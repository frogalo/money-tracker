import GoogleProvider from "next-auth/providers/google";
import type {NextAuthOptions} from "next-auth";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({user, profile}) {
            try {
                await dbConnect();

                const existingUser = await User.findOne({email: user.email});

                if (!existingUser) {
                    await User.create({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        googleProfile: profile,
                    });
                }

                return true;
            } catch (e) {
                console.error("User creation error:", e);
                return false;
            }
        },
        async session({session, token}) {
            if (session?.user && token?.id) {
                if (typeof token.id === 'string') {
                    session.user.id = token.id;
                } else {
                    console.error("Token ID is not a string:", token.id);
                }
            }
            return session;
        },
        async jwt({token}) {
            await dbConnect();
            const userInDb = await User.findOne({email: token.email});
            token.id = userInDb?._id?.toString() || '';
            return token;
        },
        redirect() {
            return Promise.resolve('/dashboard')
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};