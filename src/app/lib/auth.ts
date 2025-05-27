import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type {NextAuthOptions} from "next-auth";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";

type UserData = {
    name?: string;
    given_name?: string;
    family_name?: string;
    email: string;
    locale?: string;
    provider?: string[];
    googleProfile?: unknown;
};

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({user, account, profile}) {
            try {
                await dbConnect();

                if (!user.email) {
                    console.error("No email found for user, cannot sign in.");
                    return false;
                }

                // Fetch existing user to get current providers
                const existingUser = (await User.findOne({email: user.email}).lean()) as
                    | {
                    provider?: string[] | string;
                    googleProfile?: unknown;
                    githubProfile?: unknown;
                }
                    | null;

                // Start with existing providers or empty array
                let providers: string[] = [];
                if (Array.isArray(existingUser?.provider)) {
                    providers = existingUser.provider;
                } else if (typeof existingUser?.provider === "string") {
                    providers = [existingUser.provider];
                }

                // Add the current provider if not already present
                if (account?.provider) {
                    providers = Array.from(new Set([...providers, account.provider]));
                }

                const userData: UserData = {
                    name: user.name ?? undefined,
                    email: user.email,
                    googleProfile: existingUser?.googleProfile,
                    provider: providers,
                };

                if (account?.provider === "google") {
                    userData.given_name = (profile as Record<string, unknown>)?.given_name as string ?? undefined;
                    userData.family_name = (profile as Record<string, unknown>)?.family_name as string ?? undefined;
                    userData.locale = (profile as Record<string, unknown>)?.locale as string ?? undefined;
                    userData.googleProfile = profile;
                }

                await User.updateOne(
                    {email: user.email},
                    {
                        $set: userData,
                        $setOnInsert: {createdAt: new Date()},
                    },
                    {upsert: true}
                );
                return true;
            } catch (e) {
                console.error("Mongoose user insert error:", e);
                return false;
            }
        },
        async redirect({url, baseUrl}) {
            if (url === baseUrl || url === `${baseUrl}/`) {
                return `${baseUrl}/dashboard`;
            }
            return url;
        },
    },
};

export default NextAuth(authOptions);
