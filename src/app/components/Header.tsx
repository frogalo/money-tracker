'use client';

import Link from 'next/link';
import {useSession, signOut} from 'next-auth/react';
import {useTheme} from 'next-themes';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import GoogleButton from '@/app/components/buttons/GoogleButton';
import CustomButton from '@/app/components/buttons/CustomButton';
import {LogOut, Moon, Sun, User} from 'lucide-react';

const Header = () => {
    const {data: session, status} = useSession();
    const {theme, setTheme} = useTheme();
    const router = useRouter();
    const [loadingTheme, setLoadingTheme] = useState(true);

    // On mount or session change, set theme from user preference or default to dark
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            // Fetch user settings to get preferredTheme
            fetch(`/api/users/${session.user.id}/settings`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.settings?.preferredTheme) {
                        setTheme(data.settings.preferredTheme);
                    } else {
                        setTheme('dark'); // default
                    }
                })
                .catch(() => {
                    setTheme('dark'); // fallback default
                })
                .finally(() => setLoadingTheme(false));
        } else {
            setTheme('dark'); // default for unauthenticated users
            setLoadingTheme(false);
        }
    }, [session, status, setTheme]);

    const toggleTheme = async () => {
        if (!session?.user?.id) {
            // Just toggle locally if no user
            setTheme(theme === 'dark' ? 'light' : 'dark');
            return;
        }

        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Persist new theme to user settings API
        try {
            const response = await fetch(`/api/users/${session.user.id}/settings`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({preferredTheme: newTheme}),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                console.error('Failed to update theme preference:', data.error);
                // Optionally revert theme on failure
                setTheme(theme ?? 'dark');
            }
        } catch (error) {
            console.error('Error updating theme preference:', error);
            setTheme(theme ?? 'dark');
        }
    };

    const goToProfile = () => {
        router.push('/settings');
    };

    if (loadingTheme) {
        // Optionally render nothing or a loader while theme is loading
        return null;
    }

    return (
        <header className="fixed top-0 left-0 w-full bg-[var(--background)] bg-opacity-25 text-[var(--text)] py-4 z-130">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-[var(--green)]">
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
                                    <CustomButton onClick={() => signOut()} icon={LogOut} text="Sign Out"/>
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