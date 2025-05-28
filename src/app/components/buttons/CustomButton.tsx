'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CustomButtonProps {
    text?: string;
    icon?: LucideIcon;
    onClick: () => void;
    className?: string;
    'aria-label'?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
                                                       text,
                                                       icon: Icon,
                                                       onClick,
                                                       className,
                                                       'aria-label': ariaLabel,
                                                   }) => {
    const hasText = text && text.trim().length > 0;
    const hasIcon = !!Icon;

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center bg-[var(--green)] hover:bg-[var(--secondary)] text-[var(--text)] font-bold rounded-lg shadow-md transition duration-300 cursor-pointer ${
                hasText ? 'py-2.5 px-3' : 'p-3'
            } ${className || ''}`}
            aria-label={ariaLabel || text}
        >
            {hasIcon && (
                <Icon
                    size={18}
                    className={hasText ? 'mr-2' : ''}
                />
            )}
            {hasText && <span>{text}</span>}
        </button>
    );
};

export default CustomButton;