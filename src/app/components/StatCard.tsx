import React from 'react';
import { TFunction } from 'i18next'; // Import TFunction for the 't' prop

interface StatCardProps {
    label: string; // This will now be a translation key, e.g., 'dashboard.income'
    value: string | number;
    color?: string;
    prefix?: string;
    suffix?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    // ADDED: New props for formatting and translation
    formatValue?: (amount: number) => string; // Optional: function to format the numeric value
    t: TFunction; // REQUIRED: The translation function
}

const StatCard: React.FC<StatCardProps> = ({
                                               label,
                                               value,
                                               color = 'var(--primary)',
                                               prefix = '',
                                               suffix = '',
                                               size = 'md',
                                               className = '',
                                               formatValue, // Destructure the new formatValue prop
                                               t, // Destructure the new t prop
                                           }) => {
    const sizeClasses = {
        sm: {
            container: 'p-3',
            label: 'text-xs',
            value: 'text-lg',
        },
        md: {
            container: 'p-4',
            label: 'text-sm',
            value: 'text-2xl',
        },
        lg: {
            container: 'p-6',
            label: 'text-base',
            value: 'text-3xl',
        },
    };

    // Determine the displayed value
    // If formatValue is provided AND the value is a number, use formatValue.
    // Otherwise, concatenate prefix, value, and suffix as before.
    const displayedValue =
        typeof value === 'number' && formatValue
            ? formatValue(value)
            : `${prefix}${value}${suffix}`;

    return (
        <div
            className={`rounded-2xl shadow-3xl text-center ${sizeClasses[size].container} ${className}`}
            style={{ background: 'var(--background)', color: 'var(--text)' }}
        >
            <div className={`${sizeClasses[size].label} opacity-70`}>
                {/* Use the 't' prop to translate the label */}
                {t(label)}
            </div>
            <div className={`${sizeClasses[size].value} font-bold`} style={{ color }}>
                {/* Use the pre-calculated displayedValue */}
                {displayedValue}
            </div>
        </div>
    );
};

export default StatCard;