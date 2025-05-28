import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    color?: string;
    prefix?: string;
    suffix?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
                                               label,
                                               value,
                                               color = 'var(--primary)',
                                               prefix = '',
                                               suffix = '',
                                               size = 'md',
                                               className = ''
                                           }) => {
    const sizeClasses = {
        sm: {
            container: 'p-3',
            label: 'text-xs',
            value: 'text-lg'
        },
        md: {
            container: 'p-4',
            label: 'text-sm',
            value: 'text-2xl'
        },
        lg: {
            container: 'p-6',
            label: 'text-base',
            value: 'text-3xl'
        }
    };

    return (
        <div
            className={`rounded-2xl shadow-3xl text-center ${sizeClasses[size].container} ${className}`}
            style={{background: 'var(--background)', color: 'var(--text)'}}
        >
            <div className={`${sizeClasses[size].label} opacity-70`}>
                {label}
            </div>
            <div
                className={`${sizeClasses[size].value} font-bold`}
                style={{color}}
            >
                {prefix}{value}{suffix}
            </div>
        </div>
    );
};

export default StatCard;