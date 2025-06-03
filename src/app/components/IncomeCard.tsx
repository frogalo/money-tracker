'use client';

import React, { useState } from 'react';
import {
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Trash2,
    Edit,
} from 'lucide-react';
import { Expense, Income } from '@/app/types';
import { TFunction } from 'i18next';

interface IncomeCardProps {
    incomes: Income[];
    expenses: Expense[];
    total: number;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
    t: TFunction;
    onEdit: (income: Income) => void;
    onDelete: (income: Income) => void;
}

interface GroupedIncome {
    description: string;
    totalAmount: number;
    currency: string;
    count: number;
    latestDate: string;
    transactions: Income[];
    sources: Set<string>;
}

const IncomeCard: React.FC<IncomeCardProps> = ({
                                                   incomes,
                                                   total,
                                                   formatCurrency,
                                                   formatDate,
                                                   t,
                                                   onEdit,
                                                   onDelete,
                                               }) => {
    const [showAll, setShowAll] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [hoveredIncome, setHoveredIncome] = useState<string | null>(null);
    const [btnHover, setBtnHover] = useState(false);
    const green = '#00b069';

    const toggle = (groupKey: string) => {
        const s = new Set(expanded);
        if (s.has(groupKey)) {
            s.delete(groupKey);
        } else {
            s.add(groupKey);
        }
        setExpanded(s);
    };

    // Group by description and currency for uniqueness
    const grouped = incomes.reduce(
        (acc: { [key: string]: GroupedIncome }, inc) => {
            const groupKey = `${inc.description}__${inc.currency}`;
            if (acc[groupKey]) {
                acc[groupKey].totalAmount += inc.amount;
                acc[groupKey].transactions.push(inc);
                acc[groupKey].count++;
                acc[groupKey].sources.add(inc.source || '');
                if (new Date(inc.date) > new Date(acc[groupKey].latestDate))
                    acc[groupKey].latestDate = inc.date;
            } else {
                acc[groupKey] = {
                    description: inc.description,
                    totalAmount: inc.amount,
                    currency: inc.currency,
                    count: 1,
                    latestDate: inc.date,
                    transactions: [inc],
                    sources: new Set([inc.source || '']),
                };
            }
            return acc;
        },
        {}
    );

    const groups = Object.values(grouped);
    const shown = showAll ? groups : groups.slice(0, 5);
    const hasMore = groups.length > 5;

    return (
        <div
            className="rounded-2xl p-6 shadow-xl border-2 flex flex-col h-full overflow-hidden relative group"
            style={{
                background: 'var(--background)',
                borderColor: green,
                color: 'var(--text)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2
                    className="text-2xl font-bold flex items-center gap-3"
                    style={{ color: green }}
                >
                    <div
                        className="p-2 rounded-lg flex items-center"
                        style={{ background: green, color: 'var(--background)' }}
                    >
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="hidden md:inline">
                        {t('incomeCard.incomeAndEarnings')}
                    </span>
                    <span className="inline md:hidden">{t('dashboard.earnings')}</span>
                </h2>
                <div
                    className="px-4 py-2 rounded-full text-lg font-bold absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{
                        background: green,
                        color: 'var(--background)',
                        top: '-10px',
                        right: '-10px',
                        zIndex: 10,
                    }}
                >
                    {formatCurrency(total)}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {groups.length ? (
                    <>
                        {shown.map((g) => {
                            const groupKey = `${g.description}__${g.currency}`;
                            return (
                                <div key={groupKey}>
                                    {/* Group header */}
                                    <div
                                        className="flex justify-between items-center p-4 rounded-lg hover:shadow-md transition-all duration-200 relative"
                                        onClick={() => g.count > 1 && toggle(groupKey)}
                                        onMouseEnter={() => setHoveredIncome(groupKey)}
                                        onMouseLeave={() => setHoveredIncome(null)}
                                        style={{
                                            background: `${green}10`,
                                            border: `1px solid ${green}20`,
                                            cursor: g.count > 1 ? 'pointer' : 'default',
                                        }}
                                    >
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2">
                                                {g.count > 1 && (
                                                    <span
                                                        className="text-xs px-2 py-1 rounded-full font-bold"
                                                        style={{
                                                            background: green,
                                                            color: 'var(--background)',
                                                        }}
                                                    >
                                                        x{g.count}
                                                    </span>
                                                )}
                                                <span className="font-medium">{g.description}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs opacity-60">
                                                    {formatDate(g.latestDate)}
                                                </span>
                                                {/* Only show source if not stacked */}
                                                {g.count === 1 && g.sources.size > 0 && (
                                                    <span className="text-xs" style={{ color: green }}>
                                                        {Array.from(g.sources).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg" style={{ color: green }}>
                                            {formatCurrency(g.totalAmount)}
                                        </span>

                                        {/* Edit and Delete Icons for Singular Incomes */}
                                        {g.count === 1 && hoveredIncome === groupKey && (
                                            <div className="absolute right-2 top-2 flex gap-2">
                                                <Edit
                                                    className="w-4 h-4 cursor-pointer absolute top-12 right-1/3"
                                                    style={{ color: green }}
                                                    onClick={() => onEdit(g.transactions[0])}
                                                />
                                                <Trash2
                                                    className="w-4 h-4 cursor-pointer absolute top-12 right-9"
                                                    style={{ color: green }}
                                                    onClick={() => onDelete(g.transactions[0])}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded items */}
                                    {g.count > 1 && expanded.has(groupKey) && (
                                        <div className="ml-6 mt-2 space-y-2">
                                            {g.transactions
                                                .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                                                .map((tr) => (
                                                    <div
                                                        key={tr._id}
                                                        className="flex justify-between items-center p-3 rounded-lg relative"
                                                        style={{
                                                            background: `${green}05`,
                                                            border: `1px solid ${green}15`,
                                                        }}
                                                        onMouseEnter={() => setHoveredIncome(tr._id)}
                                                        onMouseLeave={() => setHoveredIncome(null)}
                                                    >
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">{tr.description}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs opacity-60">
                                                                    {formatDate(tr.date)}
                                                                </span>
                                                                {tr.source && (
                                                                    <span className="text-xs" style={{ color: green }}>
                                                                        {tr.source}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="font-bold" style={{ color: green }}>
                                                            {formatCurrency(tr.amount)}
                                                        </span>

                                                        {/* Edit and Delete Icons for Expanded Transactions */}
                                                        {hoveredIncome === tr._id && (
                                                            <div className="absolute right-1 top-1 flex gap-2">
                                                                <Edit
                                                                    className="w-3 h-3 cursor-pointer absolute top-10 right-1"
                                                                    style={{ color: green }}
                                                                    onClick={() => onEdit(tr)}
                                                                />
                                                                <Trash2
                                                                    className="w-3 h-3 cursor-pointer absolute top-10 right-7"
                                                                    style={{ color: green }}
                                                                    onClick={() => onDelete(tr)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Show More/Less */}
                        {hasMore && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                className="w-full p-3 rounded-lg border-2 border-dashed transition duration-200 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                    borderColor: green,
                                    color: green,
                                    background: btnHover ? `${green}20` : 'transparent',
                                }}
                            >
                                {showAll ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        {t('incomeCard.showLess')}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        {t('incomeCard.showMore', { count: groups.length - 5 })}
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 opacity-60">
                        <p>{t('incomeCard.noIncomeRecorded')}</p>
                        <p className="text-sm">{t('incomeCard.addIncomeSources')}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4" style={{ borderTop: `2px solid ${green}30` }}>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                        {t('incomeCard.totalIncome')}:
                    </span>
                    <span className="text-2xl font-bold" style={{ color: green }}>
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IncomeCard;