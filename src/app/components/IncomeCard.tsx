'use client';

import React, { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface Income {
    id: number;
    source: string;
    amount: number;
    type: 'salary' | 'investment' | 'transfer' | 'other';
    date: string;
}

interface IncomeCardProps {
    incomes: Income[];
    total: number;
}

interface GroupedIncome {
    source: string;
    totalAmount: number;
    count: number;
    type: string;
    latestDate: string;
}

const IncomeCard: React.FC<IncomeCardProps> = ({ incomes, total }) => {
    const [showAll, setShowAll] = useState(false);

    // Explicit hex color for green
    const greenHex = '#00b069';


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Group incomes by source
    const groupedIncomes = incomes.reduce((acc: { [key: string]: GroupedIncome }, income) => {
        if (acc[income.source]) {
            acc[income.source].totalAmount += income.amount;
            acc[income.source].count += 1;
            // Keep the latest date
            if (new Date(income.date) > new Date(acc[income.source].latestDate)) {
                acc[income.source].latestDate = income.date;
            }
        } else {
            acc[income.source] = {
                source: income.source,
                totalAmount: income.amount,
                count: 1,
                type: income.type,
                latestDate: income.date
            };
        }
        return acc;
    }, {});

    const groupedIncomesArray = Object.values(groupedIncomes);
    const displayedIncomes = showAll ? groupedIncomesArray : groupedIncomesArray.slice(0, 5);
    const hasMoreThan5 = groupedIncomesArray.length > 5;

    return (
        <div
            className="rounded-2xl p-6 shadow-xl border-2 col-span-full flex flex-col h-full overflow-hidden"
            style={{
                background: 'var(--background)',
                borderColor: greenHex,
                color: 'var(--text)'
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: greenHex }}>
                    <div className="p-2 rounded-lg flex items-center gap-2" style={{ background: greenHex, color: 'var(--background)' }}>
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-xl">💰</span>
                    </div>
                    Income & Earnings
                </h2>
                <div
                    className="px-4 py-2 rounded-full text-lg font-bold"
                    style={{ background: greenHex, color: 'var(--background)' }}
                >
                    +${total}
                </div>
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {groupedIncomesArray.length > 0 ? (
                    <>
                        {displayedIncomes.map((income, index) => (
                            <div
                                key={`${income.source}-${index}`}
                                className="flex justify-between items-center p-4 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                    background: `${greenHex}10`,
                                    border: `1px solid ${greenHex}20`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{income.source}</span>
                                            {income.count > 1 && (
                                                <span
                                                    className="text-xs px-2 py-1 rounded-full font-bold"
                                                    style={{ background: greenHex, color: 'var(--background)' }}
                                                >
                                                    x{income.count}
                                                </span>
                                            )}
                                        </div>
                                        {income.count === 1 && (
                                            <span className="text-xs opacity-60">
                                                {formatDate(income.latestDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-bold text-lg" style={{ color: greenHex }}>
                                    +${income.totalAmount}
                                </span>
                            </div>
                        ))}

                        {hasMoreThan5 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="w-full p-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                                style={{
                                    borderColor: greenHex,
                                    color: greenHex
                                }}
                            >
                                {showAll ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Show {groupedIncomesArray.length - 5} More
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 opacity-60">
                        <p>No income recorded yet</p>
                        <p className="text-sm">Add your income sources!</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4" style={{ borderTop: `2px solid ${greenHex}30` }}>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Income:</span>
                    <span className="text-2xl font-bold" style={{ color: greenHex }}>
                        +${total}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IncomeCard;