import './globals.css';
import {Inter} from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';
import React from "react";
import AuthProvider from "./providers/AuthProvider";

const inter = Inter({subsets: ['latin']});

export const metadata = {
    title: 'Money Tracker',
    description: 'Track your expenses and manage your finances effectively.',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full" data-theme="dark">
        <body className={`${inter.className} flex flex-col h-full mt-16`}>
        <AuthProvider>
            <Header/>
            <main className="flex-grow">{children}</main>
            <Footer/>
        </AuthProvider>
        </body>
        </html>
    );
}