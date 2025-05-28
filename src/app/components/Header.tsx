'use client';

import Link from 'next/link';
import {useSession, signOut} from 'next-auth/react';
import {useTheme} from 'next-themes';
import {useRouter} from 'next/navigation';
import GoogleButton from '@/app/components/buttons/GoogleButton';
import CustomButton from '@/app/components/buttons/CustomButton';
import {LogOut, Moon, Sun, User} from 'lucide-react';

const Header = () => {
    const {data: session, status} = useSession();
    const {theme, setTheme} = useTheme();
    const router = useRouter();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const goToProfile = () => {
        router.push('/settings');
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-[var(--background)] bg-opacity-25 text-[var(--text)] py-4 z-30">
            <div className="container mx-auto flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-[var(--green)]"
                >
                    Money Tracker
                </Link>
                <nav>
                    <ul className="flex space-x-4 items-center">

                        {status === 'authenticated' && session?.user ? (
                            <>
                                <li>
                                    <CustomButton
                                        onClick={goToProfile}
                                        icon={User}
                                        text=""
                                        className="p-2"
                                        aria-label="Profile settings"
                                    />
                                </li>
                                <li>
                                    <CustomButton
                                        onClick={toggleTheme}
                                        icon={theme === 'dark' ? Sun : Moon}
                                        text=""
                                        className="p-2"
                                        aria-label="Toggle theme"
                                    />
                                </li>
                                <li>
                                    <CustomButton
                                        onClick={() => signOut()}
                                        icon={LogOut}
                                        text="Sign Out"
                                    />
                                </li>
                            </>
                        ) : (
                            <li>
                                <GoogleButton/>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;