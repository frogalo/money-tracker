'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import CustomButton from '@/app/components/buttons/CustomButton';
import {
    User,
    Moon,
    Sun,
    Save,
    ArrowLeft,
    Settings,
    Bell,
    Shield,
    Download,
    Trash2,
} from 'lucide-react';

interface UserSettings {
    defaultCurrency: 'PLN' | 'USD' | 'EUR' | 'GBP';
    preferredDateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    customName: string;
    preferredTheme: 'light' | 'dark';
    language: 'en' | 'pl' | 'es' | 'fr';
    notifications: {
        push: boolean;
        email: boolean;
        budgetAlerts: boolean;
    };
    budget: {
        monthlyLimit: number;
    };
    privacy: {
        dataRetention: '6months' | '1year' | '2years' | 'forever';
    };
}

const SettingsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState<UserSettings>({
        defaultCurrency: 'PLN',
        preferredDateFormat: 'DD/MM/YYYY',
        customName: '',
        preferredTheme: 'light',
        language: 'en',
        notifications: {
            push: true,
            email: false,
            budgetAlerts: true,
        },
        budget: {
            monthlyLimit: 0,
        },
        privacy: {
            dataRetention: '1year',
        },
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch user settings from API
    const fetchSettings = async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch(`/api/users/${session.user.id}/settings`);
            const data = await response.json();

            if (response.ok && data.success) {
                setSettings(data.settings);
                // Update theme if different
                if (data.settings.preferredTheme !== theme) {
                    setTheme(data.settings.preferredTheme);
                }
            } else {
                setError(data.error || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError('Failed to fetch settings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/');
        } else if (status === 'authenticated' && session?.user) {
            fetchSettings();
        }
    }, [status, session, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (name.includes('.')) {
            // Handle nested properties
            const [parent, child] = name.split('.');
            setSettings((prev) => {
                const parentKey = parent as keyof UserSettings;
                const currentParent = prev[parentKey];

                // Type guard to ensure we're working with an object
                if (typeof currentParent === 'object' && currentParent !== null) {
                    return {
                        ...prev,
                        [parentKey]: {
                            ...currentParent,
                            [child]: type === 'checkbox'
                                ? (e.target as HTMLInputElement).checked
                                : type === 'number'
                                    ? parseFloat(value) || 0
                                    : value,
                        },
                    };
                }
                return prev;
            });
        } else {
            setSettings((prev) => ({
                ...prev,
                [name]: type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : type === 'number'
                        ? parseFloat(value) || 0
                        : value,
            }));
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        setSettings((prev) => ({ ...prev, preferredTheme: newTheme }));
    };

    const handleSave = async () => {
        if (!session?.user?.id) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`/api/users/${session.user.id}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage('Settings saved successfully!');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportData = () => {
        // Export user data functionality
        console.log('Exporting data...');
        alert('Data export started. You will receive an email when ready.');
    };

    const handleDeleteAccount = () => {
        if (
            confirm(
                'Are you sure you want to delete your account? This action cannot be undone.'
            )
        ) {
            console.log('Deleting account...');
            alert('Account deletion initiated.');
        }
    };

    const goBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--green)] mx-auto mb-4"></div>
                    <div>Loading settings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)] pt-20">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center mb-8">
                    <CustomButton
                        onClick={goBack}
                        icon={ArrowLeft}
                        className="mr-4"
                        aria-label="Go back"
                    />
                    <h1 className="text-3xl font-bold text-[var(--green)]">Settings</h1>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {/* Profile Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg">
                        <div className="flex items-center mb-6">
                            <User className="w-8 h-8 mr-3 text-[var(--green)]" />
                            <h3 className="text-xl font-semibold">Profile Information</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="customName" className="block text-sm font-medium mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    id="customName"
                                    name="customName"
                                    value={settings.customName}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    placeholder={session?.user?.name || 'Enter your display name'}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] opacity-50 cursor-not-allowed"
                                />
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Email cannot be changed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg">
                        <div className="flex items-center mb-6">
                            {theme === 'dark' ? (
                                <Moon className="w-8 h-8 mr-3 text-[var(--green)]" />
                            ) : (
                                <Sun className="w-8 h-8 mr-3 text-[var(--green)]" />
                            )}
                            <h3 className="text-xl font-semibold">Appearance</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Theme</label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`px-4 py-2 rounded-md border ${
                                            settings.preferredTheme === 'light'
                                                ? 'bg-[var(--green)] text-white border-[var(--green)]'
                                                : 'border-[var(--border)] text-[var(--text)]'
                                        }`}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`px-4 py-2 rounded-md border ${
                                            settings.preferredTheme === 'dark'
                                                ? 'bg-[var(--green)] text-white border-[var(--green)]'
                                                : 'border-[var(--border)] text-[var(--text)]'
                                        }`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="language" className="block text-sm font-medium mb-2">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={settings.language}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                >
                                    <option value="en">English</option>
                                    <option value="pl">Polski</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg">
                        <div className="flex items-center mb-6">
                            <Settings className="w-8 h-8 mr-3 text-[var(--green)]" />
                            <h3 className="text-xl font-semibold">Preferences</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="defaultCurrency" className="block text-sm font-medium mb-2">
                                    Default Currency
                                </label>
                                <select
                                    id="defaultCurrency"
                                    name="defaultCurrency"
                                    value={settings.defaultCurrency}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                >
                                    <option value="PLN">PLN (zł)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="preferredDateFormat" className="block text-sm font-medium mb-2">
                                    Date Format
                                </label>
                                <select
                                    id="preferredDateFormat"
                                    name="preferredDateFormat"
                                    value={settings.preferredDateFormat}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section - Coming Soon */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg relative overflow-hidden">
                        <div className="flex items-center mb-6">
                            <Bell className="w-8 h-8 mr-3 text-[var(--green)]" />
                            <h3 className="text-xl font-semibold">Notifications</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notifications.push"
                                    name="notifications.push"
                                    checked={settings.notifications.push}
                                    onChange={handleInputChange}
                                    disabled
                                    className="w-4 h-4 text-[var(--green)] bg-[var(--input-background)] border-[var(--border)] rounded focus:ring-[var(--green)] cursor-not-allowed opacity-50"
                                />
                                <label htmlFor="notifications.push" className="ml-2 text-sm opacity-50">
                                    Push notifications
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notifications.email"
                                    name="notifications.email"
                                    checked={settings.notifications.email}
                                    onChange={handleInputChange}
                                    disabled
                                    className="w-4 h-4 text-[var(--green)] bg-[var(--input-background)] border-[var(--border)] rounded focus:ring-[var(--green)] cursor-not-allowed opacity-50"
                                />
                                <label htmlFor="notifications.email" className="ml-2 text-sm opacity-50">
                                    Email notifications
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notifications.budgetAlerts"
                                    name="notifications.budgetAlerts"
                                    checked={settings.notifications.budgetAlerts}
                                    onChange={handleInputChange}
                                    disabled
                                    className="w-4 h-4 text-[var(--green)] bg-[var(--input-background)] border-[var(--border)] rounded focus:ring-[var(--green)] cursor-not-allowed opacity-50"
                                />
                                <label htmlFor="notifications.budgetAlerts" className="ml-2 text-sm opacity-50">
                                    Budget alerts
                                </label>
                            </div>

                            <div>
                                <label htmlFor="budget.monthlyLimit" className="block text-sm font-medium mb-2 opacity-50">
                                    Monthly Budget Limit
                                </label>
                                <input
                                    type="number"
                                    id="budget.monthlyLimit"
                                    name="budget.monthlyLimit"
                                    value={settings.budget.monthlyLimit}
                                    onChange={handleInputChange}
                                    disabled
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] cursor-not-allowed opacity-50"
                                />
                            </div>
                        </div>

                        {/* Coming Soon Overlay */}
                        <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center pointer-events-none">
                            <div className="bg-red-600 text-white px-8 py-2 transform -rotate-12 font-bold text-lg shadow-lg">
                                COMING SOON
                            </div>
                        </div>
                    </div>

                    {/* Privacy & Security Section - Coming Soon */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg lg:col-span-2 relative overflow-hidden">
                        <div className="flex items-center mb-6">
                            <Shield className="w-8 h-8 mr-3 text-[var(--green)]" />
                            <h3 className="text-xl font-semibold">Privacy & Security</h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="privacy.dataRetention" className="block text-sm font-medium mb-2 opacity-50">
                                    Data Retention Period
                                </label>
                                <select
                                    id="privacy.dataRetention"
                                    name="privacy.dataRetention"
                                    value={settings.privacy.dataRetention}
                                    onChange={handleInputChange}
                                    disabled
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] cursor-not-allowed opacity-50"
                                >
                                    <option value="6months">6 months</option>
                                    <option value="1year">1 year</option>
                                    <option value="2years">2 years</option>
                                    <option value="forever">Forever</option>
                                </select>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={handleExportData}
                                    disabled
                                    className="inline-flex items-center justify-center bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md cursor-not-allowed opacity-50"
                                >
                                    <Download size={18} className="mr-2" />
                                    Export Data
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled
                                    className="inline-flex items-center justify-center bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md cursor-not-allowed opacity-50"
                                >
                                    <Trash2 size={18} className="mr-2" />
                                    Delete Account
                                </button>
                            </div>
                        </div>

                        {/* Coming Soon Overlay */}
                        <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center pointer-events-none">
                            <div className="bg-red-600 text-white px-8 py-2 transform -rotate-12 font-bold text-lg shadow-lg">
                                COMING SOON
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-8">
                    <CustomButton
                        onClick={handleSave}
                        icon={Save}
                        text={isSaving ? 'Saving...' : 'Save All Changes'}
                        className="px-8 py-3"
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;