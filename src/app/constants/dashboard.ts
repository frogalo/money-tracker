import {
    Car,
    Home,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    UtensilsIcon,
    LucideIcon,
} from 'lucide-react';
import {
    Currency,
    ExpenseCategory,
    IncomeCategory,
    IncomeSourceType,
} from '@/app/types';

export const availableCurrencies: Currency[] = ['PLN', 'USD', 'EUR', 'GBP'];

export const expenseCategories: ExpenseCategory[] = [
    'Survival',
    'Growth',
    'Fun',
    'Restaurants',
    'Mobility',
    'Groceries',
    'Other',
];

export const incomeCategories: IncomeCategory[] = [
    'Salary',
    'Investment',
    'Gift',
    'Refund',
    'Other',
];

export const incomeSourceTypes: IncomeSourceType[] = [
    'salary',
    'investment',
    'transfer',
    'gift',
    'other',
    'refund',
];

export const currencySymbols = {
    PLN: 'zł',
    USD: '$',
    EUR: '€',
    GBP: '£',
};

// Add proper typing for dashboard categories
export interface DashboardCategory {
    name: string;
    icon: LucideIcon;
    color: string;
}

export const dashboardCategories: DashboardCategory[] = [
    {
        name: 'Survival',
        icon: Home,
        color: '#b56ee5',
    },
    {
        name: 'Growth',
        icon: TrendingUp,
        color: '#47931a',
    },
    {
        name: 'Fun',
        icon: Sparkles,
        color: '#d08f16',
    },
    {
        name: 'Restaurants',
        icon: UtensilsIcon,
        color: '#ff6b6b',
    },
    {
        name: 'Mobility',
        icon: Car,
        color: '#4ecdc4',
    },
    {
        name: 'Groceries',
        icon: ShoppingCart,
        color: '#45b7d1',
    },
];