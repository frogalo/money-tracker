import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, FileText, Trash2, Loader2, Building2 } from 'lucide-react';
import { TFunction } from 'i18next';
import {
    Transaction,
    Currency,
    ExpenseCategory,
    IncomeCategory,
    Income,
    Expense,
} from '@/app/types';
import {incomeCategories} from "@/app/constants/dashboard";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction, mode: 'add' | 'edit') => void;
    onDelete?: (transaction: Transaction) => void;
    initialTransaction?: Expense | Income;
    t: TFunction;
    availableCurrencies: Currency[];
    defaultCurrency: Currency;
    expenseCategories: ExpenseCategory[];
    incomeCategories: IncomeCategory[];
    isLoading?: boolean;
}


const TransactionModal: React.FC<TransactionModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               onDelete,
                                                               initialTransaction,
                                                               t,
                                                               availableCurrencies,
                                                               defaultCurrency,
                                                               expenseCategories,
                                                               isLoading = false,
                                                           }) => {
    const [formData, setFormData] = useState({
        type: 'expense' as 'expense' | 'income',
        amount: '',
        description: '',
        source: '',
        category: '',
        currency: defaultCurrency,
        date: new Date().toISOString().split('T')[0],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialTransaction) {
            setFormData({
                type: initialTransaction.type,
                amount: initialTransaction.amount?.toString() || '',
                description: initialTransaction.description || '',
                source: initialTransaction.source || '',
                category: initialTransaction.category || '',
                currency: initialTransaction.currency || defaultCurrency,
                date: initialTransaction.date
                    ? initialTransaction.date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
            });
        } else {
            setFormData({
                type: 'expense',
                amount: '',
                description: '',
                source: '',
                category: '',
                currency: defaultCurrency,
                date: new Date().toISOString().split('T')[0],
            });
        }
        setErrors({});
    }, [initialTransaction, defaultCurrency, isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }

        // Clear category when switching transaction type
        if (field === 'type') {
            setFormData((prev) => ({
                ...prev,
                category: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (
            !formData.amount ||
            isNaN(Number(formData.amount)) ||
            Number(formData.amount) <= 0
        ) {
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
        if (!validateForm() || isLoading) return;

        let transaction: Transaction;
        const baseTransaction = {
            id: initialTransaction?.id || undefined,
            amount: Number(formData.amount),
            description: formData.description,
            source: formData.source || undefined,
            category: formData.category,
            currency: formData.currency,
            date: formData.date,
        };

        if (formData.type === 'income') {
            transaction = {
                ...baseTransaction,
                type: 'income',
            } as Income;
        } else {
            transaction = {
                ...baseTransaction,
                type: 'expense',
            } as Expense;
        }

        onSave(transaction, initialTransaction ? 'edit' : 'add');
    };

    const handleDelete = () => {
        if (initialTransaction && onDelete && !isLoading) {
            const confirmMessage =
                t('transactionModal.confirmDelete') ||
                'Are you sure you want to delete this transaction?';
            if (confirm(confirmMessage)) {
                onDelete(initialTransaction);
            }
        }
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
                style={{
                    borderColor: 'var(--border, rgba(255, 255, 255, 0.1))',
                }}
            >
                <h2 className="text-2xl font-bold">
                    {initialTransaction
                        ? t('transactionModal.editTransaction')
                        : t('transactionModal.addTransaction')}
                </h2>
                <div className="flex gap-2">
                    {initialTransaction && onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="p-2 rounded-full hover:bg-red-100 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('transactionModal.delete') || 'Delete'}
                            style={{
                                backgroundColor: 'rgba(239,68,68,0.1)',
                            }}
                        >
                            {isLoading ? (
                                <Loader2
                                    className="w-6 h-6 animate-spin"
                                    style={{ color: '#ef4444' }}
                                />
                            ) : (
                                <Trash2
                                    className="w-6 h-6"
                                    style={{ color: '#ef4444' }}
                                />
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'var(--text)',
                            opacity: 0.8,
                        }}
                    >
                        <X
                            className="w-6 h-6"
                            style={{ color: 'var(--background)' }}
                        />
                    </button>
                </div>
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
                            disabled={isLoading}
                            className={`cursor-pointer p-4 rounded-xl font-medium transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                formData.type === 'expense'
                                    ? 'shadow-lg'
                                    : 'opacity-60 hover:opacity-80'
                            }`}
                            style={{
                                backgroundColor:
                                    formData.type === 'expense'
                                        ? 'var(--accent)'
                                        : 'transparent',
                                borderColor: 'var(--accent)',
                                color:
                                    formData.type === 'expense'
                                        ? 'var(--background)'
                                        : 'var(--accent)',
                            }}
                        >
                            {t('transactionModal.expense')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInputChange('type', 'income')}
                            disabled={isLoading}
                            className={`cursor-pointer p-4 rounded-xl font-medium transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                formData.type === 'income'
                                    ? 'shadow-lg'
                                    : 'opacity-60 hover:opacity-80'
                            }`}
                            style={{
                                backgroundColor:
                                    formData.type === 'income'
                                        ? 'var(--green)'
                                        : 'transparent',
                                borderColor: 'var(--green)',
                                color:
                                    formData.type === 'income'
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
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60" />
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) =>
                                    handleInputChange('amount', e.target.value)
                                }
                                disabled={isLoading}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    errors.amount
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'focus:ring-blue-500/20'
                                }`}
                                style={{
                                    backgroundColor:
                                        'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                    borderColor: errors.amount
                                        ? '#ef4444'
                                        : 'var(--border, rgba(255, 255, 255, 0.1))',
                                    color: 'var(--text)',
                                }}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-sm text-red-500">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium opacity-80">
                            {t('transactionModal.currency')}
                        </label>
                        <select
                            value={formData.currency}
                            onChange={(e) =>
                                handleInputChange('currency', e.target.value)
                            }
                            disabled={isLoading}
                            className="cursor-pointer w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor:
                                    'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor:
                                    'var(--border, rgba(255, 255, 255, 0.1))',
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
                        <FileText className="absolute left-3 top-3 w-5 h-5 opacity-60" />
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) =>
                                handleInputChange('description', e.target.value)
                            }
                            disabled={isLoading}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.description
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'focus:ring-blue-500/20'
                            }`}
                            style={{
                                backgroundColor:
                                    'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor: errors.description
                                    ? '#ef4444'
                                    : 'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                            placeholder={t(
                                'transactionModal.descriptionPlaceholder'
                            )}
                        />
                    </div>
                    {errors.description && (
                        <p className="text-sm text-red-500">
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Source (Company/Shop/Employer/Person) */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium opacity-80">
                        {t('transactionModal.source') || 'Source (company/shop/person)'}
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-5 h-5 opacity-60" />
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) =>
                                handleInputChange('source', e.target.value)
                            }
                            disabled={isLoading}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor:
                                    'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor:
                                    'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                            placeholder={t('transactionModal.sourcePlaceholder') || 'e.g. Amazon, Employer, John Doe'}
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium opacity-80">
                        {t('transactionModal.category')}
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60" />
                        <select
                            value={formData.category}
                            onChange={(e) =>
                                handleInputChange('category', e.target.value)
                            }
                            disabled={isLoading}
                            className={`cursor-pointer w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.category
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'focus:ring-blue-500/20'
                            }`}
                            style={{
                                backgroundColor:
                                    'var(--card-bg, rgba(255, 255, 255, 0.05))',
                                borderColor: errors.category
                                    ? '#ef4444'
                                    : 'var(--border, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text)',
                            }}
                        >
                            <option value="">
                                {t('transactionModal.selectCategory')}
                            </option>
                            {(formData.type === 'expense'
                                    ? expenseCategories
                                    : incomeCategories
                            ).map((category) => (
                                <option key={category} value={category}>
                                    {t(
                                        `transactionModal.categories.${category.toLowerCase()}`
                                    )}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.category && (
                        <p className="text-sm text-red-500">
                            {errors.category}
                        </p>
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
                            onChange={(e) =>
                                handleInputChange('date', e.target.value)
                            }
                            disabled={isLoading}
                            className={`w-full pl-3 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.date
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'focus:ring-blue-500/20'
                            }`}
                            style={{
                                backgroundColor:
                                    'var(--card-bg, rgba(255, 255, 255, 0.05))',
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
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLoading}
                        className="cursor-pointer flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--background)',
                        }}
                    >
                        {isLoading && (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        )}
                        {initialTransaction
                            ? t('transactionModal.updateTransaction')
                            : t('transactionModal.saveTransaction')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionModal;