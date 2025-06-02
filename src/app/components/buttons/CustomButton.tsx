'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CustomButtonProps {
    text?: string;
    icon?: LucideIcon;
    onClick?: () => void; // Made onClick optional as it might not be used if type is "submit"
    className?: string;
    'aria-label'?: string;
    type?: 'button' | 'submit' | 'reset'; // Added optional type prop
    disabled?: boolean; // Added optional disabled prop for completeness
}

const CustomButton: React.FC<CustomButtonProps> = ({
                                                       text,
                                                       icon: Icon,
                                                       onClick,
                                                       className,
                                                       'aria-label': ariaLabel,
                                                       type = 'button', // Default to 'button' to prevent accidental form submission
                                                       disabled = false, // Default to false
                                                   }) => {
    const hasText = text && text.trim().length > 0;
    const hasIcon = !!Icon;

    return (
        <button
            type={type} // Apply the type prop here
            onClick={onClick} // onClick is optional, so it might be undefined
            className={`inline-flex items-center justify-center bg-[var(--green)] hover:bg-[var(--secondary)] text-[var(--text)] font-bold rounded-lg shadow-md transition duration-300 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${hasText ? 'py-2.5 px-3' : 'p-3'} ${className || ''}`}
            aria-label={ariaLabel || text}
            disabled={disabled} // Apply disabled prop
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