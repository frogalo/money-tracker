'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'react-hot-toast';
import { getTranslation } from '@/app/i18n';
import { TFunction } from 'i18next';
import CustomButton from '@/app/components/buttons/CustomButton';
import {
    User,
    Moon,
    Sun,
    ArrowLeft,
    Settings,
    Bell,
    Shield,
    Download,
    Trash2,
    Save,
} from 'lucide-react';
import { Locale } from "@/app/i18n/settings";

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
        preferredTheme: 'dark',
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
    const [customNameDraft, setCustomNameDraft] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingName, setIsSavingName] = useState(false);
    const [t, setT] = useState<TFunction | null>(null);

    // Initialize translation
    useEffect(() => {
        const initTranslation = async () => {
            try {
                const { t: translate } = await getTranslation(
                    settings.language as Locale,
                    'translation'
                );
                setT(() => translate);
            } catch (error) {
                console.error('Failed to load translations:', error);
                setT(() => ((key: string) => key) as TFunction);
            }
        };
        initTranslation();
    }, [settings.language]);

    // Sync settings.preferredTheme with the actual theme from useTheme
    useEffect(() => {
        if (theme && theme !== settings.preferredTheme) {
            setSettings((prev) => ({
                ...prev,
                preferredTheme: theme as 'light' | 'dark',
            }));
        }
    }, [theme, settings.preferredTheme]);

    // Fetch user settings from API
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/');
        } else if (status === 'authenticated' && session?.user) {
            const fetchSettings = async () => {
                if (!session?.user?.id) return;

                try {
                    const response = await fetch(`/api/users/${session.user.id}/settings`);
                    const data = await response.json();

                    if (response.ok && data.success) {
                        setSettings(data.settings);
                        setCustomNameDraft(data.settings.customName || '');
                        if (data.settings.preferredTheme !== theme) {
                            setTheme(data.settings.preferredTheme);
                        }
                    } else {
                        toast.error(
                            t?.('settings.messages.fetchError') || 'Failed to fetch settings'
                        );
                    }
                } catch (error) {
                    console.error('Error fetching settings:', error);
                    toast.error(
                        t?.('settings.messages.fetchError') || 'Failed to fetch settings'
                    );
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSettings();
        }
    }, [status, session, router, theme, t, setTheme]);

    // Helper to update a single field instantly (except customName)
    const updateSetting = async (update: Partial<UserSettings>) => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch(`/api/users/${session.user.id}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(
                    t?.('settings.messages.updateError') || 'Failed to update settings'
                );
            } else {
                toast.success(
                    t?.('settings.messages.settingsUpdated') ||
                    'Settings updated successfully!'
                );
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(
                t?.('settings.messages.updateError') || 'Failed to update settings'
            );
        }
    };

    // Save customName explicitly
    const saveCustomName = async () => {
        if (!session?.user?.id) return;
        if (customNameDraft.length > 100) {
            toast.error(
                t?.('settings.profile.displayNameTooLong') ||
                'Display name must be 100 characters or less'
            );
            return;
        }

        setIsSavingName(true);
        try {
            const response = await fetch(`/api/users/${session.user.id}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customName: customNameDraft }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(
                    t?.('settings.messages.updateError') || 'Failed to save display name'
                );
            } else {
                setSettings((prev) => ({ ...prev, customName: customNameDraft }));
                toast.success(
                    t?.('settings.profile.displayNameSaved') ||
                    'Display name saved successfully!'
                );
            }
        } catch (error) {
            console.error('Error saving display name:', error);
            toast.error(
                t?.('settings.messages.updateError') || 'Failed to save display name'
            );
        } finally {
            setIsSavingName(false);
        }
    };

    // Handle changes for nested and top-level fields except customName
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (name === 'customName') {
            setCustomNameDraft(value);
            return;
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings((prev) => {
                const parentKey = parent as keyof UserSettings;
                const currentParent = prev[parentKey];

                if (typeof currentParent === 'object' && currentParent !== null) {
                    const newValue =
                        type === 'checkbox'
                            ? (e.target as HTMLInputElement).checked
                            : type === 'number'
                                ? parseFloat(value) || 0
                                : value;

                    const updatedParent = { ...currentParent, [child]: newValue };
                    const updatedSettings = { ...prev, [parentKey]: updatedParent };
                    updateSetting({
                        [parentKey]: updatedParent,
                    } as Partial<UserSettings>);
                    return updatedSettings;
                }
                return prev;
            });
        } else {
            const newValue =
                type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : type === 'number'
                        ? parseFloat(value) || 0
                        : value;

            const updatedSettings = { ...settings, [name]: newValue };
            setSettings(updatedSettings);
            updateSetting({ [name]: newValue } as Partial<UserSettings>);
        }
    };

    // Handle theme change instantly
    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        setSettings((prev) => ({ ...prev, preferredTheme: newTheme }));
        updateSetting({ preferredTheme: newTheme });
    };

    const handleExportData = () => {
        // console.log('Exporting data...');
        alert(
            t?.('settings.messages.exportStarted') ||
            'Data export started. You will receive an email when ready.'
        );
    };

    const handleDeleteAccount = () => {
        if (
            confirm(
                t?.('settings.messages.deleteConfirm') ||
                'Are you sure you want to delete your account? This action cannot be undone.'
            )
        ) {
            // console.log('Deleting account...');
            alert(
                t?.('settings.messages.deleteInitiated') ||
                'Account deletion initiated.'
            );
        }
    };

    const goBack = () => {
        router.back();
    };

    if (isLoading || !t) {
        return (
            <div className="bg-[var(--background)] text-[var(--text)] flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--green)] mx-auto mb-4"></div>
                    <div>{t?.('settings.loading') || 'Loading settings...'}</div>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-[var(--background)] text-[var(--text)] pt-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center mb-8">
                    <CustomButton
                        onClick={goBack}
                        icon={ArrowLeft}
                        className="mr-4"
                        aria-label={t('settings.goBack')}
                    />
                    <h1 className="text-3xl font-bold text-[var(--green)]">
                        {t('settings.title')}
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {/* Profile Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg">
                        <div className="flex items-center mb-6">
                            <User className="w-8 h-8 mr-3 text-[var(--green)]"/>
                            <h3 className="text-xl font-semibold">
                                {t('settings.profile.title')}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="customName"
                                    className="block text-sm font-medium mb-2"
                                >
                                    {t('settings.profile.displayName')}
                                </label>
                                <input
                                    type="text"
                                    id="customName"
                                    name="customName"
                                    value={customNameDraft}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    placeholder={
                                        session?.user?.name ||
                                        t('settings.profile.displayNamePlaceholder')
                                    }
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                />
                            </div>

                            {customNameDraft !== settings.customName && (
                                <div className="flex justify-end mt-2">
                                    <CustomButton
                                        onClick={saveCustomName}
                                        icon={Save}
                                        text={
                                            isSavingName
                                                ? t('settings.profile.saving')
                                                : t('settings.profile.save')
                                        }
                                        className="px-6 py-2"
                                    />
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium mb-2"
                                >
                                    {t('settings.profile.email')}
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
                                    {t('settings.profile.emailNote')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg">
                        <div className="flex items-center mb-6">
                            {theme === 'dark' ? (
                                <Moon className="w-8 h-8 mr-3 text-[var(--green)]"/>
                            ) : (
                                <Sun className="w-8 h-8 mr-3 text-[var(--green)]"/>
                            )}
                            <h3 className="text-xl font-semibold">
                                {t('settings.appearance.title')}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t('settings.appearance.theme')}
                                </label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`cursor-pointer px-4 py-2 rounded-md border ${
                                            settings.preferredTheme === 'light'
                                                ? 'bg-[var(--green)] text-white border-[var(--green)]'
                                                : 'border-[var(--border)] text-[var(--text)]'
                                        }`}
                                    >
                                        {t('settings.appearance.light')}
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`cursor-pointer px-4 py-2 rounded-md border ${
                                            settings.preferredTheme === 'dark'
                                                ? 'bg-[var(--green)] text-white border-[var(--green)]'
                                                : 'border-[var(--border)] text-[var(--text)]'
                                        }`}
                                    >
                                        {t('settings.appearance.dark')}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="language"
                                    className="block text-sm font-medium mb-2"
                                >
                                    {t('settings.appearance.language')}
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={settings.language}
                                    onChange={handleInputChange}
                                    className="cursor-pointer w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                >
                                    <option value="en">{t('settings.languages.en')}</option>
                                    <option value="pl">{t('settings.languages.pl')}</option>
                                    <option value="es">{t('settings.languages.es')}</option>
                                    <option value="fr">{t('settings.languages.fr')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Rest of your sections with translations... */}
                    {/* I'll include the key sections, but you can apply the same pattern to all */}

                    {/* Preferences Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg">
                        <div className="flex items-center mb-6">
                            <Settings className="w-8 h-8 mr-3 text-[var(--green)]"/>
                            <h3 className="text-xl font-semibold">
                                {t('settings.preferences.title')}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="defaultCurrency"
                                    className="block text-sm font-medium mb-2"
                                >
                                    {t('settings.preferences.defaultCurrency')}
                                </label>
                                <select
                                    id="defaultCurrency"
                                    name="defaultCurrency"
                                    value={settings.defaultCurrency}
                                    onChange={handleInputChange}
                                    className="cursor-pointer w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                >
                                    <option value="PLN">{t('settings.currencies.PLN')}</option>
                                    <option value="USD">{t('settings.currencies.USD')}</option>
                                    <option value="EUR">{t('settings.currencies.EUR')}</option>
                                    <option value="GBP">{t('settings.currencies.GBP')}</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="preferredDateFormat"
                                    className="block text-sm font-medium mb-2"
                                >
                                    {t('settings.preferences.dateFormat')}
                                </label>
                                <select
                                    id="preferredDateFormat"
                                    name="preferredDateFormat"
                                    value={settings.preferredDateFormat}
                                    onChange={handleInputChange}
                                    className="cursor-pointer w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                                >
                                    <option value="DD/MM/YYYY">
                                        {t('settings.dateFormats.DD/MM/YYYY')}
                                    </option>
                                    <option value="MM/DD/YYYY">
                                        {t('settings.dateFormats.MM/DD/YYYY')}
                                    </option>
                                    <option value="YYYY-MM-DD">
                                        {t('settings.dateFormats.YYYY-MM-DD')}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg relative overflow-hidden">
                        <div className="flex items-center mb-6">
                            <Bell className="w-8 h-8 mr-3 text-[var(--green)]"/>
                            <h3 className="text-xl font-semibold">{t('settings.notifications.title')}</h3>
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
                                <label
                                    htmlFor="notifications.push"
                                    className="ml-2 text-sm opacity-50"
                                >
                                    {t('settings.notifications.push')}
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
                                <label
                                    htmlFor="notifications.email"
                                    className="ml-2 text-sm opacity-50"
                                >
                                    {t('settings.notifications.email')}
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
                                <label
                                    htmlFor="notifications.budgetAlerts"
                                    className="ml-2 text-sm opacity-50"
                                >
                                    {t('settings.notifications.budgetAlerts')}
                                </label>
                            </div>

                            <div>
                                <label
                                    htmlFor="budget.monthlyLimit"
                                    className="block text-sm font-medium mb-2 opacity-50"
                                >
                                    {t('settings.notifications.monthlyBudgetLimit')}
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

                        <div
                            className="absolute inset-0 bg-opacity-30 flex items-center justify-center pointer-events-none">
                            <div
                                className="bg-red-600 text-white px-8 py-2 transform -rotate-12 font-bold text-lg shadow-lg">
                                {t('settings.comingSoon')}
                            </div>
                        </div>
                    </div>

                    {/* Privacy & Security Section */}
                    <div
                        className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg lg:col-span-2 relative overflow-hidden">
                        <div className="flex items-center mb-6">
                            <Shield className="w-8 h-8 mr-3 text-[var(--green)]"/>
                            <h3 className="text-xl font-semibold">{t('settings.privacy.title')}</h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="privacy.dataRetention"
                                    className="block text-sm font-medium mb-2 opacity-50"
                                >
                                    {t('settings.privacy.dataRetention')}
                                </label>
                                <select
                                    id="privacy.dataRetention"
                                    name="privacy.dataRetention"
                                    value={settings.privacy.dataRetention}
                                    onChange={handleInputChange}
                                    disabled
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--input-background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] cursor-not-allowed opacity-50"
                                >
                                    <option
                                        value="6months">{t('settings.privacy.dataRetentionOptions.6months')}</option>
                                    <option value="1year">{t('settings.privacy.dataRetentionOptions.1year')}</option>
                                    <option value="2years">{t('settings.privacy.dataRetentionOptions.2years')}</option>
                                    <option
                                        value="forever">{t('settings.privacy.dataRetentionOptions.forever')}</option>
                                </select>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={handleExportData}
                                    disabled
                                    className="inline-flex items-center justify-center bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md cursor-not-allowed opacity-50"
                                >
                                    <Download size={18} className="mr-2"/>
                                    {t('settings.privacy.exportData')}
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled
                                    className="inline-flex items-center justify-center bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md cursor-not-allowed opacity-50"
                                >
                                    <Trash2 size={18} className="mr-2"/>
                                    {t('settings.privacy.deleteAccount')}
                                </button>
                            </div>
                        </div>

                        <div
                            className="absolute inset-0 bg-opacity-30 flex items-center justify-center pointer-events-none">
                            <div
                                className="bg-red-600 text-white px-8 py-2 transform -rotate-12 font-bold text-lg shadow-lg">
                                {t('settings.comingSoon')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;