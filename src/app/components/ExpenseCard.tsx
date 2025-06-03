'use client';

import React, {useState} from 'react';
import {
    LucideIcon,
    ChevronDown,
    ChevronUp,
    RotateCcw, Trash2, Edit
} from 'lucide-react';
import {TFunction} from 'i18next';
import {Expense, Income} from "@/app/types";

interface ExpenseCardProps {
    title: string;
    icon: LucideIcon;
    expenses: Expense[];
    incomes: Income[];
    color: string;
    total: number;
    percentage: number;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
    t: TFunction;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}

interface GroupedExpense {
    description: string;
    totalAmount: number;
    currency: string;
    count: number;
    latestDate: string;
    transactions: Expense[];
    origins: Set<string>; // Use a Set to track unique origins
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
                                                     title,
                                                     icon: Icon,
                                                     expenses,
                                                     incomes,
                                                     color,
                                                     total,
                                                     percentage,
                                                     formatCurrency,
                                                     formatDate,
                                                     t,
                                                     onEdit,
                                                     onDelete,
                                                 }) => {
    const [showAll, setShowAll] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [hoveredExpense, setHoveredExpense] = useState<string | null>(null); // Track hovered expense

    const toggleExpanded = (desc: string) => {
        const s = new Set(expandedItems);
        if (s.has(desc)) {
            s.delete(desc);
        } else {
            s.add(desc);
        }
        setExpandedItems(s);
    };

    const getLinkedIncome = (expId: number | undefined): Income | undefined =>
        incomes.find((i) => i.linkedExpenseId === expId);

    // Group expenses by description
    const grouped = expenses.reduce(
        (acc: { [k: string]: GroupedExpense }, e) => {
            if (acc[e.description]) {
                acc[e.description].totalAmount += e.amount;
                acc[e.description].transactions.push(e);
                acc[e.description].count++;
                acc[e.description].origins.add(e.source || ''); // Add origin to the Set
                if (new Date(e.date) > new Date(acc[e.description].latestDate)) {
                    acc[e.description].latestDate = e.date;
                }
            } else {
                acc[e.description] = {
                    description: e.description,
                    totalAmount: e.amount,
                    currency: e.currency,
                    count: 1,
                    latestDate: e.date,
                    transactions: [e],
                    origins: new Set([e.source || '']), // Initialize the Set with the first origin
                };
            }
            return acc;
        },
        {}
    );

    const groups = Object.values(grouped);
    const shown = showAll ? groups : groups.slice(0, 5);

    return (
        <div
            className="rounded-2xl p-6 shadow-xl border-2 flex flex-col h-full overflow-hidden relative group"
            style={{
                background: 'var(--background)',
                borderColor: color,
                color: 'var(--text)'
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3" style={{color}}>
                    <div
                        className="p-2 rounded-lg"
                        style={{background: color, color: 'var(--background)'}}
                    >
                        <Icon className="w-6 h-6"/>
                    </div>
                    {title}
                </h2>
                <div
                    className="px-4 py-4 rounded-full text-lg font-bold absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{
                        background: color,
                        color: 'var(--background)',
                        top: '-12px',
                        right: '-14px',
                        zIndex: 10
                    }}
                >
                    {formatCurrency(total)}
                </div>
            </div>

            {/* Stat bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm opacity-70">
                        {t('expenseCard.percentageOfTotal', {percentage: percentage.toFixed(1)})}
                    </span>
                    <span className="text-sm opacity-70">
                        {t('expenseCard.transactions', {count: expenses.length, count_plural: expenses.length})}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" style={{background: `${color}20`}}>
                    <div className="h-2 rounded-full" style={{width: `${percentage}%`, background: color}}/>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {groups.length ? (
                    <>
                        {shown.map((g) => (
                            <div key={g.description}>
                                <div
                                    className="flex justify-between items-center p-4 rounded-lg hover:shadow-md transition-all duration-200 relative"
                                    onClick={() => g.count > 1 && toggleExpanded(g.description)}
                                    onMouseEnter={() => setHoveredExpense(g.description)}
                                    onMouseLeave={() => setHoveredExpense(null)}
                                    style={{
                                        background: `${color}10`,
                                        border: `1px solid ${color}20`,
                                        cursor: g.count > 1 ? 'pointer' : 'default'
                                    }}
                                >
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-2">
                                            {g.count > 1 && (
                                                <span
                                                    className="text-xs px-2 py-1 rounded-full font-bold"
                                                    style={{background: color, color: 'var(--background)'}}
                                                >
                                                    x{g.count}
                                                </span>
                                            )}
                                            <span className="font-medium">{g.description}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs opacity-60">{formatDate(g.latestDate)}</span>
                                            {g.origins.size > 0 && (
                                                <span className="text-xs" style={{color}}>
                                                    {Array.from(g.origins).join(', ')} {/* Display all unique origins */}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg" style={{color}}>
                                        {formatCurrency(g.totalAmount)}
                                    </span>

                                    {/* Edit and Delete Icons for Singular Expenses */}
                                    {g.count === 1 && hoveredExpense === g.description && (
                                        <div className="absolute right-2 top-2 flex gap-2">
                                            <Edit
                                                className="w-4 h-4 cursor-pointer absolute top-12 right-1/3"
                                                style={{color}}
                                                onClick={() => onEdit(g.transactions[0])}
                                            />
                                            <Trash2
                                                className="w-4 h-4 cursor-pointer absolute top-12 right-9"
                                                style={{color}}
                                                onClick={() => onDelete(g.transactions[0])}
                                            />
                                        </div>
                                    )}
                                </div>

                                {g.count > 1 && expandedItems.has(g.description) && (
                                    <div className="ml-6 mt-2 space-y-2">
                                        {g.transactions
                                            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                                            .map((tr) => {
                                                const li = getLinkedIncome(tr.id);
                                                return (
                                                    <div
                                                        key={tr._id} // Use the unique transaction ID as the key
                                                        className="flex justify-between items-center p-3 rounded-lg relative"
                                                        style={{
                                                            background: `${color}05`,
                                                            border: `1px solid ${color}15`
                                                        }}
                                                        onMouseEnter={() => setHoveredExpense(tr._id)}
                                                        onMouseLeave={() => setHoveredExpense(null)}
                                                    >
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-sm font-medium">{tr.description}</span>
                                                                {li && (
                                                                    <RotateCcw
                                                                        className="w-4 h-4"
                                                                        style={{color}}
                                                                        aria-label={t('expenseCard.returnedBy', {source: li.source})}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-xs opacity-60">{formatDate(tr.date)}</span>
                                                                {tr.source && (
                                                                    <span className="text-xs" style={{color}}>
                                                                        {tr.source}
                                                                    </span>
                                                                )}
                                                                {li && (
                                                                    <span className="text-xs opacity-60">
                                                                        {t('expenseCard.returnedBy', {source: li.source})}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="font-bold" style={{color}}>
                                                            {formatCurrency(tr.amount)}
                                                        </span>

                                                        {/* Edit and Delete Icons for Expanded Transactions */}
                                                        {hoveredExpense === tr._id && (
                                                            <div className="absolute right-1 top-1 flex gap-2">
                                                                <Edit
                                                                    className="w-3 h-3 cursor-pointer absolute top-10 right-1"
                                                                    style={{ color }}
                                                                    onClick={() => onEdit(tr)}
                                                                />
                                                                <Trash2
                                                                    className="w-3 h-3 cursor-pointer absolute top-10 right-7"
                                                                    style={{ color }}
                                                                    onClick={() => onDelete(tr)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {groups.length > 5 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="w-full p-3 rounded-lg border-2 border-dashed transition duration-200 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                    borderColor: color,
                                    color: color,
                                    background: `${color}20`
                                }}
                            >
                                {showAll ? (
                                    <>
                                        <ChevronUp className="w-4 h-4"/>
                                        {t('expenseCard.showLess')}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4"/>
                                        {t('expenseCard.showMore', {count: groups.length - 5})}
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 opacity-60">
                        <p>{t('expenseCard.noExpenses')}</p>
                        <p className="text-sm">{t('expenseCard.startTracking')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseCard;