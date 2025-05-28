'use client'; // Ensure this is at the top if it's a client component

import React, {useState} from 'react';
import {LucideIcon, ChevronDown, ChevronUp} from 'lucide-react';

interface Expense {
    id: number;
    category: string;
    description: string;
    amount: number;
    date: string;
}

interface CardProps {
    title: string;
    icon: LucideIcon;
    expenses: Expense[];
    color: string;
    total: number;
    percentage: number;
}

interface GroupedExpense {
    description: string;
    totalAmount: number;
    count: number;
    latestDate: string;
}

const ExpenseCard: React.FC<CardProps> = ({
                                              title,
                                              icon: Icon,
                                              expenses,
                                              color,
                                              total,
                                              percentage
                                          }) => {
    const [showAll, setShowAll] = useState(false);

    // Group expenses by description
    const groupedExpenses = expenses.reduce((acc: { [key: string]: GroupedExpense }, expense) => {
        if (acc[expense.description]) {
            acc[expense.description].totalAmount += expense.amount;
            acc[expense.description].count += 1;
            // Keep the latest date
            if (new Date(expense.date) > new Date(acc[expense.description].latestDate)) {
                acc[expense.description].latestDate = expense.date;
            }
        } else {
            acc[expense.description] = {
                description: expense.description,
                totalAmount: expense.amount,
                count: 1,
                latestDate: expense.date
            };
        }
        return acc;
    }, {});

    const groupedExpensesArray = Object.values(groupedExpenses);
    const displayedExpenses = showAll ? groupedExpensesArray : groupedExpensesArray.slice(0, 5);
    const hasMoreThan5 = groupedExpensesArray.length > 5;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    };

    return (
        <div // Added 'group' and 'relative' to the main card container
            className="relative group rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2"
            style={{
                background: 'var(--background)',
                borderColor: color,
                color: 'var(--text)'
            }}
        >
            {/* The total amount div, now absolutely positioned and hover-only */}
            <div
                className="absolute z-10 px-4 py-2 rounded-full text-lg font-bold
               opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: color,
                    color: 'var(--background)',
                    top: '-10px',
                    right: '-10px'
                }}
            >
                ${total}
            </div>

            {/* Title and Icon section (no longer needs justify-between here) */}
            <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3" style={{color}}>
                    <div className="p-2 rounded-lg flex items-center gap-2"
                         style={{background: color, color: 'var(--background)'}}>
                        <Icon className="w-6 h-6"/>
                    </div>
                    {title}
                </h2>
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {groupedExpensesArray.length > 0 ? (
                    <>
                        {displayedExpenses.map((expense, index) => (
                            <div
                                key={`${expense.description}-${index}`}
                                className="flex justify-between items-center p-4 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                    background: `${color}10`,
                                    border: `1px solid ${color}20`
                                }}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{expense.description}</span>
                                        {expense.count > 1 && (
                                            <span
                                                className="text-xs px-2 py-1 rounded-full font-bold"
                                                style={{background: color, color: 'var(--background)'}}
                                            >
                                                x{expense.count}
                                            </span>
                                        )}
                                    </div>
                                    {expense.count === 1 && (
                                        <span className="text-xs opacity-60">
                                            {formatDate(expense.latestDate)}
                                        </span>
                                    )}
                                </div>
                                <span className="font-bold text-lg" style={{color}}>
                                    ${expense.totalAmount}
                                </span>
                            </div>
                        ))}

                        {hasMoreThan5 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="w-full p-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                    borderColor: color,
                                    color: color
                                }}
                            >
                                {showAll ? (
                                    <>
                                        <ChevronUp className="w-4 h-4"/>
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4"/>
                                        Show {groupedExpensesArray.length - 5} More
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 opacity-60">
                        <p>No expenses yet</p>
                        <p className="text-sm">Add your first {title.toLowerCase()} expense!</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4" style={{borderTop: `2px solid ${color}30`}}>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold" style={{color}}>
                        ${total}
                    </span>
                </div>
                <div className="text-sm opacity-70 mt-1">
                    {percentage.toFixed(1)}% of total expenses
                </div>
            </div>
        </div>
    );
};

export default ExpenseCard;