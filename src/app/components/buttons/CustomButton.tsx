'use client';

import React from 'react';
import {LucideIcon} from 'lucide-react';

interface CustomButtonProps {
    text?: string;
    icon?: LucideIcon;
    onClick: () => void;
    className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({text, icon: Icon, onClick, className}) => {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center bg-[var(--green)] hover:bg-[var(--secondary)] text-[var(--text)] font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 cursor-pointer ${className || ''
            }`}
        >
            {Icon && <Icon size={20} className="mr-2"/>}
            {text && <span>{text}</span>}
        </button>
    );
};

export default CustomButton;