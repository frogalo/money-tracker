import { UserSettings } from '@/app/types/settings';
import { currencySymbols } from '@/app/constants/dashboard';

export const formatCurrency = (
    amount: number,
    settings: UserSettings
): string => {
    const symbol = currencySymbols[settings.defaultCurrency];
    const formattedAmount = amount.toLocaleString(settings.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    switch (settings.defaultCurrency) {
        case 'PLN':
            return `${formattedAmount} ${symbol}`;
        case 'EUR':
            return `${formattedAmount}${symbol}`;
        case 'GBP':
            return `${symbol}${formattedAmount}`;
        case 'USD':
        default:
            return `${symbol}${formattedAmount}`;
    }
};

export const formatDate = (
    dateString: string,
    settings: UserSettings
): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (settings.preferredDateFormat) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'MM/DD/YYYY':
        default:
            return `${month}/${day}/${year}`;
    }
};