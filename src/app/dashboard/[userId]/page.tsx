'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Expense {
    id: number;
    category: string;
    description: string;
    amount: number;
}

const DashboardPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { userId } = useParams();

    // Mock Data
    const mockExpenses: Expense[] = [
        { id: 1, category: 'Needs', description: 'Rent', amount: 1500 },
        { id: 2, category: 'Needs', description: 'Groceries', amount: 300 },
        { id: 3, category: 'Needs', description: 'Utilities', amount: 200 },
        { id: 4, category: 'Pleasures', description: 'Dining Out', amount: 150 },
        { id: 5, category: 'Pleasures', description: 'Movies', amount: 50 },
        { id: 6, category: 'Investments', description: 'Stocks', amount: 500 },
        { id: 7, category: 'Investments', description: 'Mutual Funds', amount: 300 },
    ];

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace('/');
        }
    }, [status, router]);

    // Filter expenses based on category
    const needs = mockExpenses.filter((expense) => expense.category === 'Needs');
    const pleasures = mockExpenses.filter((expense) => expense.category === 'Pleasures');
    const investments = mockExpenses.filter((expense) => expense.category === 'Investments');

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
            {userId && <p className="mb-4">User ID: {userId}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Needs</h2>
                    <ul>
                        {needs.map((expense) => (
                            <li key={expense.id} className="mb-1">
                                {expense.description}: ${expense.amount}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Pleasures</h2>
                    <ul>
                        {pleasures.map((expense) => (
                            <li key={expense.id} className="mb-1">
                                {expense.description}: ${expense.amount}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Investments</h2>
                    <ul>
                        {investments.map((expense) => (
                            <li key={expense.id} className="mb-1">
                                {expense.description}: ${expense.amount}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;