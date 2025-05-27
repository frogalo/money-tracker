'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import GoogleButton from "@/app/components/buttons/GoogleButton";
import CustomButton from "@/app/components/buttons/CustomButton";
import { LogOut } from "lucide-react";

const Header = () => {
    const { data: session, status } = useSession();

    return (
        <header className="fixed top-0 left-0 w-full bg-[var(--background)] bg-opacity-75 text-[var(--text)] py-4 z-20">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-[var(--green)]">
                    Money Tracker
                </Link>
                <nav>
                    <ul className="flex space-x-6 items-center">
                        {status === "authenticated" && session?.user ? (
                            <>
                                <li className="hidden md:block mr-8">
                                    <span>Welcome, {session.user.name}</span>
                                </li>
                                <li>
                                    <CustomButton
                                        onClick={() => signOut()}
                                        icon={LogOut}
                                        text="Sign Out"
                                        className="md:px-4 md:py-2 md:text-sm"
                                    />
                                </li>
                            </>
                        ) : (
                            <li>
                                <GoogleButton />
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;