'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {
    Plus,
    Home,
    Sparkles,
    TrendingUp,
    BarChart3,
    Calendar,
    Loader2,
    Car,
    ShoppingCart,
    UtensilsIcon
} from 'lucide-react';
import ExpenseCard from '@/app/components/ExpenseCard';
import IncomeCard from '@/app/components/IncomeCard';
import StatCard from "@/app/components/StatCard";

interface Expense {
    id: number;
    category: string;
    description: string;
    amount: number;
    date: string; // Add this
}

interface Income {
    id: number;
    source: string;
    amount: number;
    type: 'salary' | 'investment' | 'transfer' | 'other';
    date: string; // Add this
}

const DashboardPage = () => {
    const {data: session, status} = useSession();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);

    // Mock Data - replace with actual API call later
    const mockExpenses: Expense[] = [
        {id: 1, category: 'Survival', description: 'Rent', amount: 1500, date: '2024-01-01'},
        {id: 2, category: 'Groceries', description: 'Walmart', amount: 150, date: '2024-01-02'},
        {id: 3, category: 'Groceries', description: 'Walmart', amount: 120, date: '2024-01-09'},
        {id: 4, category: 'Groceries', description: 'Walmart', amount: 180, date: '2024-01-16'},
        {id: 5, category: 'Survival', description: 'Utilities', amount: 200, date: '2024-01-03'},
        {id: 6, category: 'Restaurants', description: 'McDonalds', amount: 15, date: '2024-01-04'},
        {id: 7, category: 'Restaurants', description: 'McDonalds', amount: 12, date: '2024-01-08'},
        {id: 8, category: 'Restaurants', description: 'McDonalds', amount: 18, date: '2024-01-12'},
        {id: 9, category: 'Restaurants', description: 'McDonalds', amount: 14, date: '2024-01-18'},
        {id: 10, category: 'Restaurants', description: 'McDonalds', amount: 16, date: '2024-01-22'},
        {id: 11, category: 'Fun', description: 'Movies', amount: 25, date: '2024-01-05'},
        {id: 17, category: 'Fun', description: 'Movies', amount: 25, date: '2024-01-05'},
        {id: 18, category: 'Fun', description: 'Game', amount: 25, date: '2024-01-05'},
        {id: 28, category: 'Fun', description: 'Game2', amount: 25, date: '2024-01-05'},
        {id: 38, category: 'Fun', description: 'Game3', amount: 25, date: '2024-01-05'},
        {id: 48, category: 'Fun', description: 'Game4', amount: 25, date: '2024-01-05'},
        {id: 58, category: 'Fun', description: 'Game5', amount: 25, date: '2024-01-05'},
        {id: 12, category: 'Growth', description: 'Stocks', amount: 500, date: '2024-01-06'},
        {id: 13, category: 'Growth', description: 'Online Course', amount: 100, date: '2024-01-07'},
        {id: 14, category: 'Mobility', description: 'Gas', amount: 60, date: '2024-01-10'},
        {id: 15, category: 'Mobility', description: 'Gas', amount: 55, date: '2024-01-17'},
        {id: 16, category: 'Mobility', description: 'Gas', amount: 65, date: '2024-01-24'},
        {id: 19, category: 'Mobility', description: 'Ticket', amount: 65, date: '2024-01-24'},
        {id: 29, category: 'Mobility', description: 'Ticket2', amount: 65, date: '2024-01-24'},
        {id: 39, category: 'Mobility', description: 'Ticket3', amount: 65, date: '2024-01-24'},
        {id: 49, category: 'Mobility', description: 'Ticket4', amount: 65, date: '2024-01-24'},
        {id: 49, category: 'Mobility', description: 'Ticket5', amount: 65, date: '2024-01-24'},
    ];

    const mockIncomes: Income[] = [
        {id: 1, source: 'Monthly Salary', amount: 5000, type: 'salary', date: '2024-01-01'},
        {id: 2, source: 'Stock Dividends', amount: 75, type: 'investment', date: '2024-01-15'},
        {id: 3, source: 'Stock Dividends', amount: 75, type: 'investment', date: '2024-01-30'},
        {id: 4, source: 'Freelance Project', amount: 400, type: 'other', date: '2024-01-10'},
        {id: 5, source: 'Freelance Project', amount: 400, type: 'other', date: '2024-01-20'},
        {id: 6, source: 'Bank Transfer', amount: 200, type: 'transfer', date: '2024-01-05'},
    ];

// Updated categories
    const categories = [
        {
            name: 'Survival',
            icon: Home,
            color: '#b56ee5',
            description: 'Housing, utilities, insurance'
        },
        {
            name: 'Growth',
            icon: TrendingUp,
            color: '#47931a',
            description: 'Investments, education, skills, business'
        },
        {
            name: 'Fun',
            icon: Sparkles,
            color: '#ffd06b',
            description: 'Entertainment, hobbies, travel'
        },
        {
            name: 'Restaurants',
            icon: UtensilsIcon,
            color: '#ff6b6b',
            description: 'Dining out, food delivery, cafes'
        },
        {
            name: 'Mobility',
            icon: Car,
            color: '#4ecdc4',
            description: 'Transportation, car, gas, travel'
        },
        {
            name: 'Groceries',
            icon: ShoppingCart,
            color: '#45b7d1',
            description: 'Food shopping, household items'
        },
    ];

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace('/');
        } else if (status === "authenticated" && session?.user) {
            setExpenses(mockExpenses);
            setIncomes(mockIncomes);
        }
    }, [status, session, router]);


    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background)'}}>
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{color: 'var(--primary)'}}/>
                    <p className="mt-4 text-lg font-medium" style={{color: 'var(--text)'}}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{background: 'var(--background)'}}>
            {/* Hero Section */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                    color: 'var(--background)'
                }}
            >
                <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                Welcome back, {session.user.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-xl opacity-90">
                                Here&#39;s your financial overview for this month
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <StatCard
                                    label="Income"
                                    value={totalIncome}
                                    prefix="+$"
                                    color="var(--green)"
                                />
                                <StatCard
                                    label="Expenses"
                                    value={totalExpenses}
                                    prefix="-$"
                                    color="var(--accent)"
                                />
                                <StatCard
                                    label="Balance"
                                    value={Math.abs(netBalance)}
                                    prefix={netBalance >= 0 ? '+$' : '-$'}
                                    color={netBalance >= 0 ? 'var(--green)' : 'var(--accent)'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Quick Stats for Mobile */}
                <div className="md:hidden mb-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div
                            className="rounded-xl p-4 shadow-xl text-center"
                            style={{background: 'var(--background)', border: `2px solid var(--green)`}}
                        >
                            <div className="text-xs opacity-70" style={{color: 'var(--text)'}}>Income</div>
                            <div className="text-lg font-bold" style={{color: 'var(--green)'}}>
                                +${totalIncome}
                            </div>
                        </div>
                        <div
                            className="rounded-xl p-4 shadow-xl text-center"
                            style={{background: 'var(--background)', border: `2px solid var(--accent)`}}
                        >
                            <div className="text-xs opacity-70" style={{color: 'var(--text)'}}>Expenses</div>
                            <div className="text-lg font-bold" style={{color: 'var(--accent)'}}>
                                -${totalExpenses}
                            </div>
                        </div>
                        <div
                            className="rounded-xl p-4 shadow-xl text-center"
                            style={{
                                background: 'var(--background)',
                                border: `2px solid ${netBalance >= 0 ? 'var(--green)' : 'var(--accent)'}`
                            }}
                        >
                            <div className="text-xs opacity-70" style={{color: 'var(--text)'}}>Balance</div>
                            <div
                                className="text-lg font-bold"
                                style={{color: netBalance >= 0 ? 'var(--green)' : 'var(--accent)'}}
                            >
                                {netBalance >= 0 ? '+' : ''}${netBalance}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Card */}
                <div className="mb-8">
                    <IncomeCard incomes={incomes} total={totalIncome}/>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                    {categories.map((category) => {
                        const categoryExpenses = expenses.filter(exp => exp.category === category.name);
                        const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                        const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;

                        return (
                            <ExpenseCard
                                key={category.name}
                                title={category.name}
                                icon={category.icon}
                                expenses={categoryExpenses}
                                color={category.color}
                                total={categoryTotal}
                                percentage={percentage}
                            />
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <button
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        style={{background: 'var(--primary)', color: 'var(--background)'}}
                    >
                        <Plus className="w-6 h-6"/>
                        Add Transaction
                    </button>
                    <button
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                        style={{
                            background: 'transparent',
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)'
                        }}
                    >
                        <BarChart3 className="w-6 h-6"/>
                        View Analytics
                    </button>
                    <button
                        className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                        style={{
                            background: 'transparent',
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)'
                        }}
                    >
                        <Calendar className="w-6 h-6"/>
                        Monthly Report
                    </button>
                </div>

                {/* Financial Health Insights */}
                <div className="mt-12">
                    <h3 className="text-3xl font-bold mb-8 text-center" style={{color: 'var(--text)'}}>
                        Financial Health 📊
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: netBalance >= 0 ? 'var(--green)' : 'var(--accent)',
                                color: 'var(--text)'
                            }}
                        >
                            <h4 className="font-bold text-lg mb-2"
                                style={{color: netBalance >= 0 ? 'var(--green)' : 'var(--accent)'}}>
                                Monthly Balance
                            </h4>
                            <div className="text-sm opacity-80">
                                {netBalance >= 0 ? 'Great! You\'re saving money' : 'You\'re spending more than earning'}
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: 'var(--green)',
                                color: 'var(--text)'
                            }}
                        >
                            <h4 className="font-bold text-lg mb-2" style={{color: 'var(--green)'}}>
                                Survival
                            </h4>
                            <div className="text-sm opacity-80">
                                {((expenses.filter(e => e.category === 'Survival').reduce((s, e) => s + e.amount, 0) / totalExpenses) * 100).toFixed(0)}%
                                of spending
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: 'var(--secondary)',
                                color: 'var(--text)'
                            }}
                        >
                            <h4 className="font-bold text-lg mb-2" style={{color: 'var(--secondary)'}}>
                                Growth Investment
                            </h4>
                            <div className="text-sm opacity-80">
                                {((expenses.filter(e => e.category === 'Growth').reduce((s, e) => s + e.amount, 0) / totalExpenses) * 100).toFixed(0)}%
                                invested in future
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-2xl shadow-lg border-l-4"
                            style={{
                                background: 'var(--background)',
                                borderLeftColor: 'var(--accent)',
                                color: 'var(--text)'
                            }}
                        >
                            <h4 className="font-bold text-lg mb-2" style={{color: 'var(--accent)'}}>
                                Lifestyle
                            </h4>
                            <div className="text-sm opacity-80">
                                {((expenses.filter(e => e.category === 'Fun').reduce((s, e) => s + e.amount, 0) / totalExpenses) * 100).toFixed(0)}%
                                on entertainment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;