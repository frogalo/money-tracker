import { Currency } from '@/app/types';

export interface UserSettings {
    defaultCurrency: Currency;
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

export const getDefaultSettings = (): UserSettings => ({
    defaultCurrency: 'USD',
    preferredDateFormat: 'MM/DD/YYYY',
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