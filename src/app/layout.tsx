// src/app/layout.tsx
import './globals.css';
import {Secular_One} from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';
import React from "react";
import AuthProvider from "./providers/AuthProvider";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/lib/auth";

const inter = Secular_One({
    subsets: ['latin'],
    weight: ['400'],
});

export const metadata = {
    title: 'Money Tracker',
    description: 'Track your expenses and manage your finances effectively.',
};

async function getUserSession() {
    return await getServerSession(authOptions)
}

export default async function RootLayout({children,}: { children: React.ReactNode; }) {
    const session = await getUserSession()
    return (
        <html lang="en" className="h-full" data-theme="dark">
        <body className={`${inter.className} flex flex-col h-full`}>
        <AuthProvider session={session}>
            <div className="mt-16">
                <Header/>
            </div>
            <main className="flex-grow">{children}</main>
            <Footer/>
        </AuthProvider>
        </body>
        </html>
    );
}
