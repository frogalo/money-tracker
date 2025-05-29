'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {
    Plus,
    Home,
    Sparkles,
    TrendingUp,
    BarChart3,
    Calendar,
    Loader2,
    Car,
    ShoppingCart,
    UtensilsIcon,
} from 'lucide-react';
import ExpenseCard from '@/app/components/ExpenseCard';
import IncomeCard from '@/app/components/IncomeCard';
import StatCard from '@/app/components/StatCard';
import mockData from '@/app/dashboard/mockData.json';
import {Expense, Income} from '@/app/types';
import {getTranslation} from '@/app/i18n';
import {TFunction, TOptions} from 'i18next'; // Ensure TOptions is imported
import {Locale} from '@/app/i18n/settings';
import {fallbackTexts} from "@/app/i18n/fallbackTexts";

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


const DashboardPage = () => {
    const {data: session, status} = useSession();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [t, setT] = useState<TFunction | null>(null); // State for the actual i18next t function
    const [, setLoadingTranslations] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false); // Tracks if initial data & translations are loaded

    // Currency symbols mapping
    const currencySymbols = {
        PLN: 'zł',
        USD: '$',
        EUR: '€',
        GBP: '£',
    };

    // Safe translation function with fallback
    // Changed 'options?: any' to 'options?: TOptions' here
    const safeT: (key: string, options?: TOptions) => string = (key: string, options?: TOptions): string => {
        if (t && typeof t === 'function') {
            try {
                const result = t(key, options);
                return typeof result === 'string' ? result : key;
            } catch (error) {
                console.warn(`Translation error with i18next for key "${key}":`, error);
            }
        }

        // Fallback to predefined texts if `t` is not loaded or fails
        if (key in fallbackTexts) {
            let text = fallbackTexts[key as keyof typeof fallbackTexts];

            // Safely access options properties without 'any'
            // Ensure options is not null/undefined and is an object before iterating
            if (options && typeof options === 'object') {
                Object.keys(options).forEach(optionKey => {
                    // Check if optionKey is a property of options
                    // Use a type assertion to keyof TOptions to please TypeScript
                    if (Object.prototype.hasOwnProperty.call(options, optionKey)) {
                        const optionValue = options[optionKey as keyof typeof options]; // Access property using keyof TOptions
                        if (typeof optionValue === 'string' || typeof optionValue === 'number') {
                            text = text.replace(new RegExp(`{{${optionKey}}}`, 'g'), String(optionValue));
                        }
                    }
                });
            }
            return text;
        }

        // Final fallback: return the key itself if no translation or fallback is found
        return key;
    };

    // Fetch user settings
    const fetchSettings = async () => {
        if (!session?.user?.id) return null;

        try {
            const response = await fetch(`/api/users/${session.user.id}/settings`);
            const data = await response.json();

            if (response.ok && data.success) {
                return data.settings;
            } else {
                console.warn('Failed to fetch settings from API, using defaults.');
                return getDefaultSettings();
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            return getDefaultSettings();
        }
    };

    const getDefaultSettings = (): UserSettings => ({
        defaultCurrency: 'USD',
        preferredDateFormat: 'MM/DD/YYYY',
        customName: '',
        preferredTheme: 'dark',
        language: 'en', // Default to English if settings not fetched
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

    // Initialize translations based on user settings
    const initTranslations = async (userSettings: UserSettings) => {
        try {
            // Dynamically load the translation bundle for the user's preferred language
            const {t: loadedT} = await getTranslation(
                userSettings.language as Locale,
                'translation'
            );

            // Set the loaded i18next t function to the state
            if (loadedT && typeof loadedT === 'function') {
                setT(() => loadedT);
            } else {
                console.warn('getTranslation did not return a valid translation function. Using fallback.');
                setT(null); // Explicitly set to null if invalid
            }
        } catch (error) {
            console.error('Failed to load i18next translations:', error);
            setT(null); // Fallback to null in case of error
        } finally {
            setLoadingTranslations(false);
            setIsInitialized(true); // Mark as initialized regardless of translation success
        }
    };

    // Format currency based on user settings - NOW ALWAYS RETURNS A STRING
    const formatCurrency = (amount: number): string => {
        // Use default settings if actual settings are not yet loaded
        const currentSettings = settings || getDefaultSettings();
        const symbol = currencySymbols[currentSettings.defaultCurrency];
        const formattedAmount = amount.toLocaleString(currentSettings.language, { // Use user's language for locale
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        switch (currentSettings.defaultCurrency) {
            case 'PLN':
                return `${formattedAmount} ${symbol}`; // e.g., 100,00 zł
            case 'EUR':
                return `${formattedAmount}${symbol}`; // e.g., 100,00€ (common in some locales)
            case 'GBP':
                return `${symbol}${formattedAmount}`; // e.g., £100.00
            case 'USD':
            default:
                return `${symbol}${formattedAmount}`; // e.g., $100.00
        }
    };

    // Format date based on user settings - NOW ALWAYS RETURNS A STRING
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        // Use default settings if actual settings are not yet loaded
        const currentSettings = settings || getDefaultSettings();

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        switch (currentSettings.preferredDateFormat) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'MM/DD/YYYY':
            default:
                return `${month}/${day}/${year}`;
        }
    };


    // Updated categories with translations
    const getCategories = () => [
        {
            name: 'Survival',
            icon: Home,
            color: '#ac7ad2',
            description: safeT('dashboard.categories.survival.description'),
        },
        {
            name: 'Growth',
            icon: TrendingUp,
            color: '#47931a',
            description: safeT('dashboard.categories.growth.description'),
        },
        {
            name: 'Fun',
            icon: Sparkles,
            color: '#d08f16',
            description: safeT('dashboard.categories.fun.description'),
        },
        {
            name: 'Restaurants',
            icon: UtensilsIcon,
            color: '#ff6b6b',
            description: safeT('dashboard.categories.restaurants.description'),
        },
        {
            name: 'Mobility',
            icon: Car,
            color: '#9843af',
            description: safeT('dashboard.categories.mobility.description'),
        },
        {
            name: 'Groceries',
            icon: ShoppingCart,
            color: '#2d8ba1',
            description: safeT('dashboard.categories.groceries.description'),
        },
    ];

    useEffect(() => {
        let mounted = true; // Flag to prevent state updates on unmounted component

        const initializeDashboard = async () => {
            if (status === 'unauthenticated') {
                router.replace('/');
                return;
            }

            if (status === 'authenticated' && session?.user) {
                // Load data from JSON file
                if (mounted) {
                    setExpenses(mockData.expenses as Expense[]);
                    setIncomes(mockData.incomes as Income[]);
                }

                // Fetch settings
                const userSettings = await fetchSettings();
                if (mounted) {
                    setSettings(userSettings);
                    // Initialize translations with fetched or default settings
                    await initTranslations(userSettings);
                }
            }
        };

        initializeDashboard();

        return () => {
            mounted = false; // Cleanup: set mounted to false when component unmounts
        };
    }, [status, session, router]); // Dependencies for useEffect


    // Calculate totals - These calculations don't depend on `t` or `settings` directly,
    // but the `formatCurrency` and `formatDate` calls below will.
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Show loading spinner if not yet initialized
    if (!isInitialized) { // Only check for isInitialized, settings are handled by format functions
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{background: 'var(--background)'}}
            >
                <div className="text-center">
                    <Loader2
                        className="w-12 h-12 animate-spin mx-auto"
                        style={{color: 'var(--primary)'}}
                    />
                    <p
                        className="mt-4 text-lg font-medium"
                        style={{color: 'var(--text)'}}
                    >
                        {safeT('dashboard.loading')}
                    </p>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    // Now, `settings` is guaranteed to be a UserSettings object (either fetched or default)
    // and `t` (via `safeT`) is also ready.
    const displayName = settings?.customName || session.user.name || safeT('dashboard.defaultWelcome');
    const categories = getCategories();

    return (
        <div className="min-h-screen" style={{background: 'var(--background)'}}>
            {/* Hero Section */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                    color: 'var(--background)',
                }}
            >
                <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="h-60 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                {safeT('dashboard.welcome', {name: displayName})}
                            </h1>
                            <p className="text-xl opacity-90">
                                {safeT('dashboard.monthlyOverview')}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-36">
                                <StatCard
                                    label={safeT('dashboard.income')}
                                    value={totalIncome}
                                    prefix="+"
                                    color="var(--green)"
                                    formatValue={formatCurrency}
                                    t={safeT as TFunction}
                                />
                                <StatCard
                                    label={safeT('dashboard.expenses')}
                                    value={totalExpenses}
                                    prefix="-"
                                    color="var(--accent)"
                                    formatValue={formatCurrency}
                                    t={safeT as TFunction}
                                />
                                <StatCard
                                    label={safeT('dashboard.balance')}
                                    value={Math.abs(netBalance)}
                                    prefix={netBalance >= 0 ? '+' : '-'}
                                    color={netBalance >= 0 ? 'var(--green)' : 'var(--accent)'}
                                    formatValue={formatCurrency}
                                    t={safeT as TFunction}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Quick Stats for Mobile */}
                <div className="md:hidden mb-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div
                            className="rounded-xl p-4 shadow-xl text-center"
                            style={{
                                background: 'var(--background)',
                                border: `2px solid var(--green)`,
                            }}
                        >
                            <div className="text-xs opacity-70" style={{color: 'var(--text)'}}>
                                {safeT('dashboard.income')}
                            </div>
                            <div className="text-lg font-bold" style={{color: 'var(--green)'}}>
                                {formatCurrency(totalIncome)}
                            </div>
                        </div>
                        <div
                            className="rounded-xl p-4 shadow-xl text-center"
                            style={{
                                background: 'var(--background)',
                                border: `2px solid var(--accent)`,
                            }}
                        >
                            <div className="text-xs opacity-70" style={{color: 'var(--text)'}}>
                                {safeT('dashboard.expenses')}
                            </div>
                            <div className="text-lg font-bold" style={{color: 'var(--accent)'}}>
                                {formatCurrency(totalExpenses)}
                            </div>
                        </div>
                        <div
                            className="rounded-xl p-4 shadow-xl text-center"
                            style={{
                                background: 'var(--background)',
                                border: `2px solid ${
                                    netBalance >= 0 ? 'var(--green)' : 'var(--accent)'
                                }`,
                            }}
                        >
                            <div className="text-xs opacity-70" style={{color: 'var(--text)'}}>
                                {safeT('dashboard.balance')}
                            </div>
                            <div
                                className="text-lg font-bold"
                                style={{
                                    color: netBalance >= 0 ? 'var(--green)' : 'var(--accent)',
                                }}
                            >
                                {netBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(netBalance))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Card */}
                <div className="mb-8">
                    <IncomeCard
                        incomes={incomes}
                        expenses={expenses}
                        total={totalIncome}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        t={safeT as TFunction}
                    />
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                    {categories.map((category) => {
                        const categoryExpenses = expenses.filter(
                            (exp) => exp.category === category.name
                        );
                        const categoryTotal = categoryExpenses.reduce(
                            (sum, exp) => sum + exp.amount,
                            0
                        );
                        const percentage =
                            totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;

                        return (
                            <ExpenseCard
                                key={category.name}
                                title={safeT(`dashboard.categories.${category.name.toLowerCase()}.title`)}
                                icon={category.icon}
                                expenses={categoryExpenses}
                                incomes={incomes}
                                color={category.color}
                                total={categoryTotal}
                                percentage={percentage}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                t={safeT as TFunction}
                            />
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <button
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        style={{background: 'var(--primary)', color: 'var(--background)'}}
                    >
                        <Plus className="w-6 h-6"/>
                        {safeT('dashboard.addTransaction')}
                    </button>
                    <button
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                        style={{
                            background: 'transparent',
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)',
                        }}
                    >
                        <BarChart3 className="w-6 h-6"/>
                        {safeT('dashboard.viewAnalytics')}
                    </button>
                    <button
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                        style={{
                            background: 'transparent',
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)',
                        }}
                    >
                        <Calendar className="w-6 h-6"/>
                        {safeT('dashboard.monthlyReport')}
                    </button>
                </div>

                {/* Financial Health Insights */}
                <div className="mt-12">
                    <h3
                        className="text-3xl font-bold mb-8 text-center"
                        style={{color: 'var(--text)'}}
                    >
                        {safeT('dashboard.financialHealth')} 📊
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: netBalance >= 0 ? 'var(--green)' : 'var(--accent)',
                                color: 'var(--text)',
                            }}
                        >
                            <h4
                                className="font-bold text-lg mb-2"
                                style={{
                                    color: netBalance >= 0 ? 'var(--green)' : 'var(--accent)',
                                }}
                            >
                                {safeT('dashboard.monthlyBalance')}
                            </h4>
                            <div className="text-sm opacity-80">
                                {netBalance >= 0
                                    ? safeT('dashboard.savingMoney')
                                    : safeT('dashboard.spendingMore')}
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: 'var(--green)',
                                color: 'var(--text)',
                            }}
                        >
                            <h4 className="font-bold text-lg mb-2" style={{color: 'var(--green)'}}>
                                {safeT('dashboard.categories.survival.title')}
                            </h4>
                            <div className="text-sm opacity-80">
                                {(
                                    (expenses
                                            .filter((e) => e.category === 'Survival')
                                            .reduce((s, e) => s + e.amount, 0) /
                                        totalExpenses) *
                                    100
                                ).toFixed(0)}
                                % {safeT('dashboard.ofSpending')}
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: 'var(--secondary)',
                                color: 'var(--text)',
                            }}
                        >
                            <h4
                                className="font-bold text-lg mb-2"
                                style={{color: 'var(--secondary)'}}
                            >
                                {safeT('dashboard.categories.growth.title')}
                            </h4>
                            <div className="text-sm opacity-80">
                                {(
                                    (expenses
                                            .filter((e) => e.category === 'Growth')
                                            .reduce((s, e) => s + e.amount, 0) /
                                        totalExpenses) *
                                    100
                                ).toFixed(0)}
                                % {safeT('dashboard.investedInFuture')}
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: 'var(--accent)',
                                color: 'var(--text)',
                            }}
                        >
                            <h4 className="font-bold text-lg mb-2" style={{color: 'var(--accent)'}}>
                                {safeT('dashboard.categories.fun.title')}
                            </h4>
                            <div className="text-sm opacity-80">
                                {(
                                    (expenses
                                            .filter((e) => e.category === 'Fun')
                                            .reduce((s, e) => s + e.amount, 0) /
                                        totalExpenses) *
                                    100
                                ).toFixed(0)}
                                % {safeT('dashboard.onEntertainment')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;