import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, FileText } from 'lucide-react';
import { TFunction } from 'i18next';
import { Transaction, Currency, ExpenseCategory, IncomeCategory, Income, Expense } from '@/app/types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    initialTransaction?: Expense | Income; // Allow both Expense and Income types
    t: TFunction;
    availableCurrencies: Currency[];
    defaultCurrency: Currency;
    expenseCategories: ExpenseCategory[];
    incomeCategories: IncomeCategory[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               initialTransaction,
                                                               t,
                                                               availableCurrencies,
                                                               defaultCurrency,
                                                               expenseCategories,
                                                               incomeCategories,
                                                           }) => {
    const [formData, setFormData] = useState({
        type: 'expense' as 'expense' | 'income',
        amount: '',
        description: '',
        category: '',
        currency: defaultCurrency,
        date: new Date().toISOString().split('T')[0],
        source: '', // For income-specific properties
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialTransaction) {
            setFormData({
                type: initialTransaction.type || 'expense',
                amount: initialTransaction.amount?.toString() || '',
                description: initialTransaction.description || '',
                category: initialTransaction.category || '',
                currency: initialTransaction.currency || defaultCurrency,
                date: initialTransaction.date ? initialTransaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
                source: initialTransaction.type === 'income' ? initialTransaction.source || '' : '', // Only for income
            });
        } else {
            setFormData({
                type: 'expense',
                amount: '',
                description: '',
                category: '',
                currency: defaultCurrency,
                date: new Date().toISOString().split('T')[0],
                source: '', // Default to empty string
            });
        }
        setErrors({});
    }, [initialTransaction, defaultCurrency, isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            newErrors.amount = t('transactionModal.validation.amount');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('transactionModal.validation.description');
        }

        if (!formData.category) {
            newErrors.category = t('transactionModal.validation.category');
        }

        if (!formData.date) {
            newErrors.date = t('transactionModal.validation.date');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        let transaction: Transaction;

        if (formData.type === 'income') {
            // Handle Income-specific properties
            transaction = {
                id: initialTransaction?.id,
                type: 'income',
                amount: Number(formData.amount),
                description: formData.description,
                category: formData.category, // Use category for income
                currency: formData.currency,
                date: formData.date,
                source: formData.description || t('transactionModal.sourcePlaceholder'), // Provide a default source if not specified
            } as Income; // Explicitly cast to Income
        } else {
            // Handle Expense-specific properties
            transaction = {
                id: initialTransaction?.id,
                type: 'expense',
                amount: Number(formData.amount),
                description: formData.description,
                category: formData.category,
                currency: formData.currency,
                date: formData.date,
            } as Expense; // Explicitly cast to Expense
        }

        onSave(transaction);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
                background: 'var(--background)',
                border: `1px solid var(--border, rgba(255, 255, 255, 0.1))`,
                color: 'var(--text)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: 'var(--border, rgba(255, 255, 255, 0.1))' }}
            >
                <h2 className="text-2xl font-bold">
                    {initialTransaction
                        ? t('transactionModal.editTransaction')
                        : t('transactionModal.addTransaction')
                    }
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200 cursor-pointer"
                    style={{
                        backgroundColor: 'var(--text)',
                        opacity: 0.8, // Increase opacity for better visibility
                    }}
                >
                    <X className="w-6 h-6" style={{ color: 'var(--background)' }} /> {/* Explicitly set icon color */}
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Transaction Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium opacity-80">
                        {t('transactionModal.transactionType')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleInputChange('type', 'expense')}
                            className={`cursor-pointer p-4 rounded-xl font-medium transition-all duration-200 border-2 ${
                                formData.type === 'expense'
                                    ? 'shadow-lg'
                                    : 'opacity-60 hover:opacity-80'
                            }`}
                            style={{
                                backgroundColor: formData.type === 'expense'
                                    ? 'var(--accent)'
                                    : 'transparent',
                                borderColor: 'var(--accent)',
                                color: formData.type === 'expense'
                                    ? 'var(--background)'
                                    : 'var(--accent)',
                            }}
                        >
                            {t('transactionModal.expense')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInputChange('type', 'income')}
                            className={`cursor-pointer p-4 rounded-xl font-medium transition-all duration-200 border-2 ${
                                formData.type === 'income'
                                    ? 'shadow-lg'
                                    : 'opacity-60 hover:opacity-80'
                            }`}
                            style={{
                                backgroundColor: formData.type === 'income'
                                    ? 'var(--green)'
                                    : 'transparent',
                                borderColor: 'var(--green)',
                                color: formData.type === 'income'
                                    ? 'var(--background)'
                                    : 'var(--green)',
                            }}
                        >
                            {t('transactionModal.income')}
                        </button>
                    </div>
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium opacity-80">
                            {t('transactionModal.amount')}
                        </label>
                        <div className="relative">
                            <DollarSign
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60"
                            />
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                    errors.amount
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'focus:ring-blue-500/20'
                                }`}
                                style={{
                                    backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                    borderColor: errors.amount
                                        ? '#ef4444'
                                        : 'var(--border, rgba(255, 255, 255, 0.1))',
                                    color: 'var(--text)',
                                }}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-sm text-red-500">{errors.amount}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium opacity-80">
                            {t('transactionModal.currency')}
                        </label>
                        <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="cursor-pointer w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            style={{
                                backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor: 'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                        >
                            {availableCurrencies.map((currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium opacity-80">
                        {t('transactionModal.description')}
                    </label>
                    <div className="relative">
                        <FileText
                            className="absolute left-3 top-3 w-5 h-5 opacity-60"
                        />
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.description
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'focus:ring-blue-500/20'
                            }`}
                            style={{
                                backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor: errors.description
                                    ? '#ef4444'
                                    : 'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                            placeholder={t('transactionModal.descriptionPlaceholder')}
                        />
                    </div>
                    {errors.description && (
                        <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium opacity-80">
                        {t('transactionModal.category')}
                    </label>
                    <div className="relative">
                        <Tag
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60"
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className={`cursor-pointer w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.category
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'focus:ring-blue-500/20'
                            }`}
                            style={{
                                backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor: errors.category
                                    ? '#ef4444'
                                    : 'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                        >
                            <option value="">{t('transactionModal.selectCategory')}</option>
                            {(formData.type === 'expense' ? expenseCategories : incomeCategories).map((category) => (
                                <option key={category} value={category}>
                                    {t(`transactionModal.categories.${category.toLowerCase()}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.category && (
                        <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium opacity-80">
                        {t('transactionModal.date')}
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className={`w-full pl-3 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.date
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'focus:ring-blue-500/20'
                            }`}
                            style={{
                                backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor: errors.date
                                    ? '#ef4444'
                                    : 'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                        />
                    </div>
                    {errors.date && (
                        <p className="text-sm text-red-500">{errors.date}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 hover:opacity-80"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: 'var(--text)',
                            color: 'var(--text)',
                        }}
                    >
                        {t('transactionModal.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="cursor-pointer flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-90 shadow-lg"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--background)',
                        }}
                    >
                        {initialTransaction ? t('transactionModal.updateTransaction') : t('transactionModal.saveTransaction')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionModal;