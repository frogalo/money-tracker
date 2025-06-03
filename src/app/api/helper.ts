import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/lib/auth";

export async function authorizeRequest(request: NextRequest, userId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return {authorized: false, response: NextResponse.json({error: 'Unauthorized'}, {status: 401})};
    }

    if (session.user.id !== userId) {
        return {authorized: false, response: NextResponse.json({error: 'Forbidden'}, {status: 403})};
    }
    return {authorized: true, userId: session.user.id};
}