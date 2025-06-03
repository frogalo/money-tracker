import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';

export async function GET() {
    await dbConnect();
    return NextResponse.json({ ok: true });
}