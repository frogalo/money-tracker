'use client';

import React, {useState} from 'react';
import {
    TrendingUp,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    RotateCcw,
} from 'lucide-react';
import {Expense, Income} from '@/app/types';
import {TFunction} from 'i18next'; // Import TFunction type

interface IncomeCardProps {
    incomes: Income[];
    expenses: Expense[];
    total: number;
    // These props are now passed from DashboardPage
    formatCurrency: (amount: number) => string; // The formatCurrency from DashboardPage doesn't take currency string as an argument for its internal calculation
    formatDate: (dateString: string) => string;
    t: TFunction; // The translation function from DashboardPage
}

interface GroupedIncome {
    source: string;
    totalAmount: number;
    currency?: string; // currency can be optional as per your Income type
    count: number;
    latestDate: string;
    transactions: Income[];
}

const IncomeCard: React.FC<IncomeCardProps> = ({
                                                   incomes,
                                                   expenses,
                                                   total,
                                                   formatCurrency, // Destructure from props
                                                   formatDate, // Destructure from props
                                                   t, // Destructure from props
                                               }) => {
    const [showAll, setShowAll] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [btnHover, setBtnHover] = useState(false);
    const green = '#00b069';

    const toggle = (src: string) => {
        const s = new Set(expanded);
        if (s.has(src)) {
            s.delete(src);
        } else {
            s.add(src);
        }
        setExpanded(s);
    };

    const getLinked = (id: number): Expense | undefined =>
        expenses.find((e) => e.id === id);

    // group by source
    const grouped = incomes.reduce(
        (acc: { [src: string]: GroupedIncome }, inc) => {
            if (acc[inc.source]) {
                acc[inc.source].totalAmount += inc.amount;
                acc[inc.source].transactions.push(inc);
                acc[inc.source].count++;
                if (new Date(inc.date) > new Date(acc[inc.source].latestDate))
                    acc[inc.source].latestDate = inc.date;
            } else {
                acc[inc.source] = {
                    source: inc.source,
                    totalAmount: inc.amount,
                    currency: inc.currency,
                    count: 1,
                    latestDate: inc.date,
                    transactions: [inc],
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
                    style={{color: green}}
                >
                    <div
                        className="p-2 rounded-lg flex items-center"
                        style={{background: green, color: 'var(--background)'}}
                    >
                        <TrendingUp className="w-6 h-6"/>
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
                    {/* Pass only the amount to formatCurrency, it handles the currency symbol */}
                    {formatCurrency(total)}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {groups.length ? (
                    <>
                        {shown.map((g, i) => (
                            <div key={i}>
                                {/* Group header */}
                                <div
                                    className="flex justify-between items-center p-4 rounded-lg hover:shadow-md transition-all duration-200"
                                    onClick={() => g.count > 1 && toggle(g.source)}
                                    style={{
                                        background: `${green}10`,
                                        border: `1px solid ${green}20`,
                                        cursor: g.count > 1 ? 'pointer' : 'default',
                                    }}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {g.count > 1 && (
                                            <ChevronRight
                                                className={`w-4 h-4 transition-transform duration-200 ${
                                                    expanded.has(g.source) ? 'rotate-90' : ''
                                                }`}
                                                style={{color: green}}
                                            />
                                        )}
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
                                                <span className="font-medium">{g.source}</span>
                                            </div>
                                            {g.count === 1 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs opacity-60">
                                                        {formatDate(g.latestDate)}
                                                    </span>
                                                    {g.transactions[0].origin &&
                                                        g.transactions[0].origin !== g.source && (
                                                            <span className="text-xs" style={{color: green}}>
                                                                {g.transactions[0].origin}
                                                            </span>
                                                        )}
                                                    {g.transactions[0].linkedExpenseId && (
                                                        <span className="text-xs opacity-60">
                                                            {t('incomeCard.for')}{' '}
                                                            <span style={{color: green}}>
                                                                {
                                                                    getLinked(
                                                                        g.transactions[0].linkedExpenseId
                                                                    )?.description
                                                                }
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg" style={{color: green}}>
                                        {formatCurrency(g.totalAmount)}
                                    </span>
                                </div>

                                {/* Expanded items */}
                                {g.count > 1 && expanded.has(g.source) && (
                                    <div className="ml-6 mt-2 space-y-2">
                                        {g.transactions
                                            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                                            .map((tr) => {
                                                const exp =
                                                    tr.linkedExpenseId &&
                                                    getLinked(tr.linkedExpenseId);
                                                return (
                                                    <div
                                                        key={tr.id}
                                                        className="flex justify-between items-center p-3 rounded-lg"
                                                        style={{
                                                            background: `${green}05`,
                                                            border: `1px solid ${green}15`,
                                                        }}
                                                    >
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">
                                                                    {tr.source}
                                                                </span>
                                                                {tr.type === 'return' && (
                                                                    <RotateCcw
                                                                        className="w-4 h-4"
                                                                        style={{color: green}}
                                                                        aria-label={t(
                                                                            'incomeCard.returnLabel'
                                                                        )}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs opacity-60">
                                                                    {formatDate(tr.date)}
                                                                </span>
                                                                {tr.origin && tr.origin !== tr.source && (
                                                                    <span className="text-xs" style={{color: green}}>
                                                                        {tr.origin}
                                                                    </span>
                                                                )}
                                                                {exp && (
                                                                    <span className="text-xs opacity-60">
                                                                        {t('incomeCard.for')}{' '}
                                                                        <span style={{color: green}}>
                                                                            {exp.description}
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className="font-bold"
                                                            style={{color: green}}
                                                        >
                                                            {formatCurrency(tr.amount)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        ))}

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
                                        <ChevronUp className="w-4 h-4"/>
                                        {t('incomeCard.showLess')}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4"/>
                                        {t('incomeCard.showMore', {count: groups.length - 5})}
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
            <div className="mt-6 pt-4" style={{borderTop: `2px solid ${green}30`}}>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                        {t('incomeCard.totalIncome')}:
                    </span>
                    <span className="text-2xl font-bold" style={{color: green}}>
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IncomeCard;