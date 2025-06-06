'use client';

import React, { useState } from 'react';
import {
    BarChart3,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
} from 'lucide-react';
import { TFunction } from 'i18next';
import ExpenseCard from '@/app/components/ExpenseCard';
import IncomeCard from '@/app/components/IncomeCard';
import StatCard from '@/app/components/StatCard';
import TransactionModal from '@/app/components/TransactionModal';
import { Transaction, Expense, Income } from '@/app/types';
import { useDashboard } from '@/app/hooks/useDashboard';
import {
    availableCurrencies,
    expenseCategories,
    incomeCategories,
    dashboardCategories,
    DashboardCategory,
} from '@/app/constants/dashboard';
import { formatCurrency, formatDate } from '@/app/utils/formatting';

const DashboardPage = () => {
    const {
        session,
        expenses,
        incomes,
        settings,
        safeT,
        isInitialized,
        isModalOpen,
        editingTransaction,
        setExpenses,
        setIncomes,
        setIsModalOpen,
        setEditingTransaction,
    } = useDashboard();

    const [isLoading, setIsLoading] = useState(false);

    // Helper function to ensure transaction has proper ID
    function ensureTransactionId<T extends Transaction>(transaction: T): T {
        return {
            ...transaction,
            id: transaction.id ?? transaction._id ?? '',
        };
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    const formatCurrencyWithSettings = (amount: number) =>
        formatCurrency(amount, settings);
    const formatDateWithSettings = (dateString: string) =>
        formatDate(dateString, settings);

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString(
        settings.language || 'en',
        {
            month: 'long',
            year: 'numeric',
        }
    );

    // Get userId from session
    const userId = session?.user?.id;

    // Modal Handlers
    const handleAddTransactionClick = () => {
        setEditingTransaction(undefined);
        setIsModalOpen(true);
    };

    const handleEditTransactionClick = (transaction: Transaction) => {
        // console.log('Editing transaction:', transaction); // Debug log
        const transactionWithId = ensureTransactionId(transaction);
        // console.log('Transaction with ID:', transactionWithId); // Debug log
        setEditingTransaction(transactionWithId);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTransaction(undefined);
    };

    const handleSaveTransaction = async (
        transaction: Transaction,
        mode: 'add' | 'edit'
    ) => {
        if (isLoading || !userId) return;
        setIsLoading(true);

        try {
            if (mode === 'edit') {
                const transactionId = transaction.id || transaction._id;

                if (!transactionId) {
                    throw new Error('Transaction ID is missing');
                }

                // console.log('Updating transaction with ID:', transactionId); // Debug log

                // PUT to API - Update existing transaction
                const response = await fetch(
                    `/api/users/${userId}/transaction/${transactionId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(transaction),
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update transaction');
                }

                const responseData = await response.json();
                const updatedTransaction = ensureTransactionId(responseData.transaction);

                // Update state
                if (transaction.type === 'expense') {
                    setExpenses((prev) =>
                        prev.map((exp) =>
                            (exp.id || exp._id) === transactionId
                                ? (updatedTransaction as Expense)
                                : exp
                        )
                    );
                } else {
                    setIncomes((prev) =>
                        prev.map((inc) =>
                            (inc.id || inc._id) === transactionId
                                ? (updatedTransaction as Income)
                                : inc
                        )
                    );
                }
            } else {
                // POST to API - Create new transaction
                const response = await fetch(`/api/users/${userId}/transaction`, {
                    method: 'POST',
                    body: JSON.stringify(transaction),
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create transaction');
                }

                const data = await response.json();
                const newTransaction = ensureTransactionId({
                    ...transaction,
                    id: data.id || data.transaction?.id || data.transaction?._id?.toString()
                });

                // console.log('Created new transaction:', newTransaction); // Debug log

                if (transaction.type === 'expense') {
                    setExpenses((prev) => [
                        ...prev,
                        newTransaction as Expense,
                    ]);
                } else {
                    setIncomes((prev) => [...prev, newTransaction as Income]);
                }
            }

            // Close modal after successful save
            setIsModalOpen(false);
            setEditingTransaction(undefined);
        } catch (error) {
            console.error('Error saving transaction:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to save transaction. Please try again.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTransaction = async (transaction: Transaction) => {
        if (isLoading || !userId) return;

        const transactionId = transaction.id || transaction._id;

        if (!transactionId) {
            console.error('Transaction ID is missing:', transaction);
            alert('Cannot delete transaction: ID is missing');
            return;
        }

        // console.log('Deleting transaction with ID:', transactionId); // Debug log
        setIsLoading(true);

        try {
            // DELETE from API
            const response = await fetch(
                `/api/users/${userId}/transaction/${transactionId}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete transaction');
            }

            // Update state
            if (transaction.type === 'expense') {
                setExpenses((prev) =>
                    prev.filter((exp) => (exp.id || exp._id) !== transactionId)
                );
            } else {
                setIncomes((prev) =>
                    prev.filter((inc) => (inc.id || inc._id) !== transactionId)
                );
            }

            // Close modal after successful delete
            setIsModalOpen(false);
            setEditingTransaction(undefined);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to delete transaction. Please try again.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Month navigation handlers (placeholder for now)
    const handlePreviousMonth = () => {
        console.log('Previous month clicked');
        // TODO: Implement month navigation logic
    };

    const handleNextMonth = () => {
        console.log('Next month clicked');
        // TODO: Implement month navigation logic
    };

    if (!isInitialized) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: 'var(--background)' }}
            >
                <div className="text-center">
                    <Loader2
                        className="w-12 h-12 animate-spin mx-auto"
                        style={{ color: 'var(--primary)' }}
                    />
                    <p
                        className="mt-4 text-lg font-medium"
                        style={{ color: 'var(--text)' }}
                    >
                        {safeT('dashboard.loading')}
                    </p>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    // Categories with translations
    const categories = dashboardCategories.map(
        (category: DashboardCategory) => ({
            ...category,
            description: safeT(
                `dashboard.categories.${category.name.toLowerCase()}.description`
            ),
        })
    );

    return (
        <div className="relative min-h-screen">
            {/* Main Dashboard Content - This gets blurred */}
            <div
                className={`min-h-screen transition-all duration-300 ${
                    isModalOpen ? 'blur-sm' : ''
                }`}
                style={{ background: 'var(--background)' }}
            >
                {/* Hero Section */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                        color: 'var(--background)',
                    }}
                >
                    <div className="container mx-auto px-6 py-12 relative z-10">
                        <div className="h-60 flex items-center justify-between">
                            <div className="flex-1">
                                {/* Month Navigation */}
                                <div className="flex items-center gap-4 mb-6">
                                    <button
                                        onClick={handlePreviousMonth}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <h1 className="text-4xl md:text-5xl font-bold">
                                        {currentMonth}
                                    </h1>
                                    <button
                                        onClick={handleNextMonth}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-xl opacity-90">
                                    {safeT('dashboard.monthlyOverview')}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-16">
                                    <StatCard
                                        label={safeT('dashboard.income')}
                                        value={totalIncome}
                                        prefix="+"
                                        color="var(--green)"
                                        formatValue={formatCurrencyWithSettings}
                                        t={safeT as TFunction}
                                    />
                                    <StatCard
                                        label={safeT('dashboard.expenses')}
                                        value={totalExpenses}
                                        prefix="-"
                                        color="var(--accent)"
                                        formatValue={formatCurrencyWithSettings}
                                        t={safeT as TFunction}
                                    />
                                    <StatCard
                                        label={safeT('dashboard.balance')}
                                        value={Math.abs(netBalance)}
                                        prefix={netBalance >= 0 ? '+' : '-'}
                                        color={
                                            netBalance >= 0
                                                ? 'var(--green)'
                                                : 'var(--accent)'
                                        }
                                        formatValue={formatCurrencyWithSettings}
                                        t={safeT as TFunction}
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
                                style={{
                                    background: 'var(--background)',
                                    border: `2px solid var(--green)`,
                                }}
                            >
                                <div
                                    className="text-xs opacity-70"
                                    style={{ color: 'var(--text)' }}
                                >
                                    {safeT('dashboard.income')}
                                </div>
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--green)' }}
                                >
                                    {formatCurrencyWithSettings(totalIncome)}
                                </div>
                            </div>
                            <div
                                className="rounded-xl p-4 shadow-xl text-center"
                                style={{
                                    background: 'var(--background)',
                                    border: `2px solid var(--accent)`,
                                }}
                            >
                                <div
                                    className="text-xs opacity-70"
                                    style={{ color: 'var(--text)' }}
                                >
                                    {safeT('dashboard.expenses')}
                                </div>
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    {formatCurrencyWithSettings(totalExpenses)}
                                </div>
                            </div>
                            <div
                                className="rounded-xl p-4 shadow-xl text-center"
                                style={{
                                    background: 'var(--background)',
                                    border: `2px solid ${
                                        netBalance >= 0
                                            ? 'var(--green)'
                                            : 'var(--accent)'
                                    }`,
                                }}
                            >
                                <div
                                    className="text-xs opacity-70"
                                    style={{ color: 'var(--text)' }}
                                >
                                    {safeT('dashboard.balance')}
                                </div>
                                <div
                                    className="text-lg font-bold"
                                    style={{
                                        color:
                                            netBalance >= 0
                                                ? 'var(--green)'
                                                : 'var(--accent)',
                                    }}
                                >
                                    {netBalance >= 0 ? '+' : ''}
                                    {formatCurrencyWithSettings(
                                        Math.abs(netBalance)
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Income Card */}
                    <div className="mb-8">
                        <IncomeCard
                            incomes={incomes}
                            expenses={expenses}
                            total={totalIncome}
                            formatCurrency={formatCurrencyWithSettings}
                            formatDate={formatDateWithSettings}
                            t={safeT as TFunction}
                            onEdit={handleEditTransactionClick}
                            onDelete={handleDeleteTransaction}
                        />
                    </div>

                    {/* Category Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                        {categories.map((category) => {
                            const categoryExpenses = expenses.filter(
                                (exp) => exp.category === category.name
                            );
                            const categoryTotal = categoryExpenses.reduce(
                                (sum, exp) => sum + exp.amount,
                                0
                            );
                            const percentage =
                                totalExpenses > 0
                                    ? (categoryTotal / totalExpenses) * 100
                                    : 0;

                            return (
                                <ExpenseCard
                                    key={category.name}
                                    title={safeT(
                                        `dashboard.categories.${category.name.toLowerCase()}.title`
                                    )}
                                    icon={category.icon}
                                    expenses={categoryExpenses}
                                    incomes={incomes}
                                    color={category.color}
                                    total={categoryTotal}
                                    percentage={percentage}
                                    formatCurrency={formatCurrencyWithSettings}
                                    formatDate={formatDateWithSettings}
                                    t={safeT as TFunction}
                                    onEdit={handleEditTransactionClick}
                                    onDelete={handleDeleteTransaction}
                                />
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button
                            onClick={handleAddTransactionClick}
                            disabled={isLoading}
                            className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--background)',
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Plus className="w-6 h-6" />
                            )}
                            {safeT('dashboard.addTransaction')}
                        </button>
                        <button
                            className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                            style={{
                                background: 'transparent',
                                color: 'var(--primary)',
                                borderColor: 'var(--primary)',
                            }}
                        >
                            <BarChart3 className="w-6 h-6" />
                            {safeT('dashboard.viewAnalytics')}
                        </button>
                        <button
                            className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                            style={{
                                background: 'transparent',
                                color: 'var(--primary)',
                                borderColor: 'var(--primary)',
                            }}
                        >
                            <Calendar className="w-6 h-6" />
                            {safeT('dashboard.monthlyReport')}
                        </button>
                    </div>

                    {/* Financial Health Insights */}
                    <div className="mt-12">
                        <h3
                            className="text-3xl font-bold mb-8 text-center"
                            style={{ color: 'var(--text)' }}
                        >
                            {safeT('dashboard.financialHealth')} 📊
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div
                                className="p-6 rounded-2xl shadow-lg border-l-4"
                                style={{
                                    background: 'var(--background)',
                                    borderLeftColor:
                                        netBalance >= 0
                                            ? 'var(--green)'
                                            : 'var(--accent)',
                                    color: 'var(--text)',
                                }}
                            >
                                <h4
                                    className="font-bold text-lg mb-2"
                                    style={{
                                        color:
                                            netBalance >= 0
                                                ? 'var(--green)'
                                                : 'var(--accent)',
                                    }}
                                >
                                    {safeT('dashboard.monthlyBalance')}
                                </h4>
                                <div className="text-sm opacity-80">
                                    {netBalance >= 0
                                        ? safeT('dashboard.savingMoney')
                                        : safeT('dashboard.spendingMore')}
                                </div>
                            </div>
                            <div
                                className="p-6 rounded-2xl shadow-lg border-l-4"
                                style={{
                                    background: 'var(--background)',
                                    borderLeftColor: 'var(--green)',
                                    color: 'var(--text)',
                                }}
                            >
                                <h4
                                    className="font-bold text-lg mb-2"
                                    style={{ color: 'var(--green)' }}
                                >
                                    {safeT(
                                        'dashboard.categories.survival.title'
                                    )}
                                </h4>
                                <div className="text-sm opacity-80">
                                    {(
                                        (expenses
                                                .filter(
                                                    (e) => e.category === 'Survival'
                                                )
                                                .reduce((s, e) => s + e.amount, 0) /
                                            Math.max(totalExpenses, 1)) *
                                        100
                                    ).toFixed(0)}
                                    % {safeT('dashboard.ofSpending')}
                                </div>
                            </div>
                            <div
                                className="p-6 rounded-2xl shadow-lg border-l-4"
                                style={{
                                    background: 'var(--background)',
                                    borderLeftColor: 'var(--secondary)',
                                    color: 'var(--text)',
                                }}
                            >
                                <h4
                                    className="font-bold text-lg mb-2"
                                    style={{ color: 'var(--secondary)' }}
                                >
                                    {safeT('dashboard.categories.growth.title')}
                                </h4>
                                <div className="text-sm opacity-80">
                                    {(
                                        (expenses
                                                .filter(
                                                    (e) => e.category === 'Growth'
                                                )
                                                .reduce((s, e) => s + e.amount, 0) /
                                            Math.max(totalExpenses, 1)) *
                                        100
                                    ).toFixed(0)}
                                    % {safeT('dashboard.investedInFuture')}
                                </div>
                            </div>
                            <div
                                className="p-6 rounded-2xl shadow-lg border-l-4"
                                style={{
                                    background: 'var(--background)',
                                    borderLeftColor: 'var(--accent)',
                                    color: 'var(--text)',
                                }}
                            >
                                <h4
                                    className="font-bold text-lg mb-2"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    {safeT('dashboard.categories.fun.title')}
                                </h4>
                                <div className="text-sm opacity-80">
                                    {(
                                        (expenses
                                                .filter((e) => e.category === 'Fun')
                                                .reduce((s, e) => s + e.amount, 0) /
                                            Math.max(totalExpenses, 1)) *
                                        100
                                    ).toFixed(0)}
                                    % {safeT('dashboard.onEntertainment')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Outside blurred content with backdrop */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
                    onClick={handleModalClose}
                >
                    <TransactionModal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        onSave={handleSaveTransaction}
                        onDelete={handleDeleteTransaction}
                        initialTransaction={editingTransaction}
                        t={safeT as TFunction}
                        availableCurrencies={availableCurrencies}
                        defaultCurrency={settings?.defaultCurrency || 'USD'}
                        expenseCategories={expenseCategories}
                        incomeCategories={incomeCategories}
                        isLoading={isLoading}
                    />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;