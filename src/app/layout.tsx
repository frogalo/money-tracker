import './globals.css';
import {Secular_One} from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';
import React from 'react';
import AuthProvider from './providers/AuthProvider';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/lib/auth';
import {Toaster} from 'react-hot-toast';
import {ThemeProvider} from 'next-themes';
import {i18n} from "@/app/i18n/settings";

const inter = Secular_One({
    subsets: ['latin'],
    weight: ['400'],
});

export const metadata = {
    title: 'Money Tracker',
    description: 'Track your expenses and manage your finances effectively.',
};

async function getUserSession() {
    return await getServerSession(authOptions);
}



export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const session = await getUserSession();
    const preferredLanguage = i18n.defaultLocale;

    return (
        <html lang={preferredLanguage} className="h-full" suppressHydrationWarning>
        <body className={`${inter.className} flex flex-col h-full`}>
        <AuthProvider session={session}>
            <ThemeProvider
                attribute="data-theme"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange
            >
                <Toaster position="bottom-right" />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
    );
}