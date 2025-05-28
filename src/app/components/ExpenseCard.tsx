'use client';

import React, {useState} from 'react';
import {
    LucideIcon,
    ChevronDown,
    ChevronUp,
    RotateCcw
} from 'lucide-react';

interface Expense {
    id: number;
    category: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    origin?: string;             // optional origin
    linkedIncomeId?: number;
}

interface Income {
    id: number;
    source: string;
    amount: number;
    currency?: string;
    type: 'salary' | 'investment' | 'transfer' | 'other' | 'return';
    date: string;
    linkedExpenseId?: number;
    returnPercentage?: number;
}

interface ExpenseCardProps {
    title: string;
    icon: LucideIcon;
    expenses: Expense[];
    incomes: Income[];
    color: string;
    total: number;
    percentage: number;
}

interface GroupedExpense {
    description: string;
    totalAmount: number;
    currency: string;
    count: number;
    latestDate: string;
    transactions: Expense[];
}

// helper to format currency
const formatCurrency = (amt: number, curr?: string) => {
    if (curr === 'USD') return `$${amt}`;
    if (curr === 'PLN') return `${amt} zł`;
    return curr ? `${amt} ${curr}` : `${amt}`;
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({
                                                     title,
                                                     icon: Icon,
                                                     expenses,
                                                     incomes,
                                                     color,
                                                     total,
                                                     percentage
                                                 }) => {
    const [showAll, setShowAll] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [btnHover, setBtnHover] = useState(false);

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const toggleExpanded = (desc: string) => {
        const s = new Set(expandedItems);
        if (s.has(desc)) {
            s.delete(desc);
        } else {
            s.add(desc);
        }
        setExpandedItems(s);
    };

    const getLinkedIncome = (expId: number): Income | undefined =>
        incomes.find((i) => i.linkedExpenseId === expId);

    // group by description
    const grouped = expenses.reduce(
        (acc: { [k: string]: GroupedExpense }, e) => {
            if (acc[e.description]) {
                acc[e.description].totalAmount += e.amount;
                acc[e.description].transactions.push(e);
                acc[e.description].count++;
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
                    transactions: [e]
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
                    {formatCurrency(total, expenses[0]?.currency)}
                </div>
            </div>

            {/* stat bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm opacity-70">{percentage.toFixed(1)}% of total</span>
                    <span className="text-sm opacity-70">{expenses.length} txns</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" style={{background: `${color}20`}}>
                    <div className="h-2 rounded-full" style={{width: `${percentage}%`, background: color}}/>
                </div>
            </div>

            {/* list */}
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {groups.length ? (
                    <>
                        {shown.map((g, i) => (
                            <div key={i}>
                                <div
                                    className="flex justify-between items-center p-4 rounded-lg hover:shadow-md transition-all duration-200"
                                    onClick={() => g.count > 1 && toggleExpanded(g.description)}
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
                                        {g.count === 1 && (
                                            <div className="flex items-center gap-2 mt-1">
      <span className="text-xs opacity-60">
        {formatDate(g.latestDate)}
      </span>
                                                {g.transactions[0].origin &&
                                                    g.transactions[0].origin !== g.description && (
                                                        <span className="text-xs" style={{color}}>
            {g.transactions[0].origin}
          </span>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-bold text-lg" style={{color}}>
                    {formatCurrency(g.totalAmount, g.currency)}
                  </span>
                                </div>

                                {g.count > 1 && expandedItems.has(g.description) && (
                                    <div className="ml-6 mt-2 space-y-2">
                                        {g.transactions
                                            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                                            .map((tr) => {
                                                const li = getLinkedIncome(tr.id);
                                                return (
                                                    <div
                                                        key={tr.id}
                                                        className="flex justify-between items-center p-3 rounded-lg"
                                                        style={{
                                                            background: `${color}05`,
                                                            border: `1px solid ${color}15`
                                                        }}
                                                    >
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-sm font-medium">{tr.description}</span>
                                                                {li && (
                                                                    <RotateCcw
                                                                        className="w-4 h-4"
                                                                        style={{color}}
                                                                        aria-label="Return"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                          <span className="text-xs opacity-60">
                                                                            {formatDate(tr.date)}
                                                                          </span>
                                                                {tr.origin && (
                                                                    <span className="text-xs" style={{color}}>
                                                                      {tr.origin}
                                                                    </span>

                                                                )}

                                                                {li && (
                                                                    <span className="text-xs opacity-60">
                                                                            returned by{' '}
                                                                        <span style={{color}}>
                                                                            {li.source}
                                                                          </span>
                                                                        </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="font-bold" style={{color}}>
                              {formatCurrency(tr.amount, tr.currency)}
                            </span>
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
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                className="w-full p-3 rounded-lg border-2 border-dashed transition duration-200 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                    borderColor: color,
                                    color: color,
                                    background: btnHover ? `${color}20` : 'transparent'
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
                                        Show {groups.length - 5} More
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 opacity-60">
                        <p>No expenses</p>
                        <p className="text-sm">Start tracking!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseCard;