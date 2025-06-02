'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar, Tag, Info, ListFilter, Repeat, Wallet } from 'lucide-react';
import {
    Transaction,
    Expense,
    Income,
    Currency,
    ExpenseCategory,
    IncomeCategory,
    IncomeSourceType,
    BaseTransaction
} from '@/app/types';
import { TFunction } from 'i18next';
import CustomButton from './buttons/CustomButton';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    initialTransaction?: Transaction;
    t: TFunction;
    availableCurrencies: Currency[];
    defaultCurrency: Currency;
    expenseCategories?: ExpenseCategory[];
    incomeCategories?: IncomeCategory[];
    incomeSourceTypes?: IncomeSourceType[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               initialTransaction,
                                                               t,
                                                               availableCurrencies,
                                                               defaultCurrency,
                                                               expenseCategories = ['Survival', 'Growth', 'Fun', 'Restaurants', 'Mobility', 'Groceries', 'Other'],
                                                               incomeCategories = ['Salary', 'Investment', 'Gift', 'Refund', 'Other'],
                                                               incomeSourceTypes = ['salary', 'investment', 'transfer', 'gift', 'other', 'refund'],
                                                           }) => {
    const isEditMode = !!initialTransaction;
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
        initialTransaction?.type || 'expense'
    );
    const [amount, setAmount] = useState<number | string>(initialTransaction?.amount || '');
    const [currency, setCurrency] = useState<Currency>(initialTransaction?.currency || defaultCurrency);
    const [date, setDate] = useState<string>(initialTransaction?.date || new Date().toISOString().substring(0, 10));
    const [description, setDescription] = useState<string>(initialTransaction?.description || '');
    const [category, setCategory] = useState<string>(
        (initialTransaction as Expense)?.category || (initialTransaction as Income)?.category || ''
    );
    const [source, setSource] = useState<string>(initialTransaction?.source || initialTransaction?.origin || '');
    // FIX: Change linkedTransactionId state to string
    const [linkedTransactionId, setLinkedTransactionId] = useState<string>(
        initialTransaction?.linkedTransactionId?.toString() || '' // Convert number to string for initial value
    );
    const [selectedIncomeSourceType, setSelectedIncomeSourceType] = useState<IncomeSourceType>(
        (initialTransaction as Income)?.incomeType || 'other'
    );
    const [returnPercentage, setReturnPercentage] = useState<number | string>(
        (initialTransaction as Income)?.returnPercentage || ''
    );

    useEffect(() => {
        if (isOpen && initialTransaction) {
            setTransactionType(initialTransaction.type);
            setAmount(initialTransaction.amount);
            setCurrency(initialTransaction.currency);
            setDate(initialTransaction.date);
            setDescription(initialTransaction.description);
            setSource(initialTransaction.source || initialTransaction.origin || '');
            // FIX: Convert number to string when setting initial state
            setLinkedTransactionId(initialTransaction.linkedTransactionId?.toString() || '');

            if (initialTransaction.type === 'expense') {
                setCategory((initialTransaction as Expense).category || '');
                setSelectedIncomeSourceType('other');
                setReturnPercentage('');
            } else {
                setCategory((initialTransaction as Income).category || '');
                setSelectedIncomeSourceType((initialTransaction as Income).incomeType || 'other');
                setReturnPercentage((initialTransaction as Income).returnPercentage || '');
            }
        } else if (isOpen && !initialTransaction) {
            setTransactionType('expense');
            setAmount('');
            setCurrency(defaultCurrency);
            setDate(new Date().toISOString().substring(0, 10));
            setDescription('');
            setCategory('');
            setSource('');
            setLinkedTransactionId(''); // Reset as empty string
            setSelectedIncomeSourceType('other');
            setReturnPercentage('');
        }
    }, [isOpen, initialTransaction, defaultCurrency]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // FIX: Safely parse linkedTransactionId string to number or undefined
        const parsedLinkedTransactionId = linkedTransactionId === ''
            ? undefined
            : parseInt(linkedTransactionId); // parseInt handles non-numeric strings by returning NaN

        const baseData: BaseTransaction = {
            amount: parseFloat(amount as string),
            currency: currency,
            date: date,
            description: description,
            origin: source,
            // FIX: Assign parsed value
            linkedTransactionId: isNaN(parsedLinkedTransactionId as number) ? undefined : parsedLinkedTransactionId,
        };

        if (isEditMode && initialTransaction?.id) {
            baseData.id = initialTransaction.id;
        }

        let newTransaction: Transaction;

        if (transactionType === 'expense') {
            newTransaction = {
                ...(baseData as Expense),
                type: 'expense',
                category: category,
                source: source,
            };
        } else {
            newTransaction = {
                ...(baseData as Income),
                type: 'income',
                incomeType: selectedIncomeSourceType,
                source: source,
                category: category,
                returnPercentage: selectedIncomeSourceType === 'refund' && returnPercentage !== ''
                    ? parseFloat(returnPercentage as string)
                    : undefined,
            };
        }

        onSave(newTransaction);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-md m-4 relative">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {isEditMode ? t('transactionModal.editTransaction') : t('transactionModal.addTransaction')}
                </h2>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    aria-label={t('transactionModal.close')}
                >
                    <X size={24} />
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Transaction Type Toggle */}
                    <div className="flex justify-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                                transactionType === 'expense'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => setTransactionType('expense')}
                        >
                            {t('transactionModal.expense')}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                                transactionType === 'income'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => setTransactionType('income')}
                        >
                            {t('transactionModal.income')}
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('transactionModal.amount')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                <DollarSign size={18} />
                            </span>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                required
                                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Currency */}
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('transactionModal.currency')}
                        </label>
                        <select
                            id="currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {availableCurrencies.map((curr) => (
                                <option key={curr} value={curr}>
                                    {curr}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('transactionModal.date')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                <Calendar size={18} />
                            </span>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('transactionModal.description')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                <Info size={18} />
                            </span>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('transactionModal.descriptionPlaceholder')}
                                maxLength={255}
                                required
                                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Category (Expense) or Category (Income) */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('transactionModal.category')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                <ListFilter size={18} />
                            </span>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">{t('transactionModal.selectCategory')}</option>
                                {(transactionType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Source / Merchant Name */}
                    <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {transactionType === 'expense'
                                ? t('transactionModal.merchant')
                                : t('transactionModal.source')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                <Tag size={18} />
                            </span>
                            <input
                                type="text"
                                id="source"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder={
                                    transactionType === 'expense'
                                        ? t('transactionModal.merchantPlaceholder')
                                        : t('transactionModal.sourcePlaceholder')
                                }
                                maxLength={255}
                                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Income Type (if Income) */}
                    {transactionType === 'income' && (
                        <div>
                            <label htmlFor="incomeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('transactionModal.incomeType')}
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                    <Wallet size={18} />
                                </span>
                                <select
                                    id="incomeType"
                                    value={selectedIncomeSourceType}
                                    onChange={(e) => setSelectedIncomeSourceType(e.target.value as IncomeSourceType)}
                                    required
                                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {incomeSourceTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {t(`transactionModal.incomeTypes.${type}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Return Percentage (if Income Type is 'refund') */}
                    {transactionType === 'income' && selectedIncomeSourceType === 'refund' && (
                        <div>
                            <label htmlFor="returnPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('transactionModal.returnPercentage')}
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                    <Repeat size={18} />
                                </span>
                                <input
                                    type="number"
                                    id="returnPercentage"
                                    value={returnPercentage}
                                    onChange={(e) => setReturnPercentage(e.target.value)}
                                    placeholder="0-100"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Linked Transaction ID (Optional) */}
                    <div>
                        <label htmlFor="linkedTransactionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('transactionModal.linkedTransactionId')}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                <Tag size={18} />
                            </span>
                            <input
                                type="number"
                                id="linkedTransactionId"
                                value={linkedTransactionId} // This is now a string
                                onChange={(e) => setLinkedTransactionId(e.target.value)} // This accepts a string
                                placeholder={t('transactionModal.optionalIdPlaceholder')}
                                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <CustomButton
                            type="submit"
                            icon={Save}
                            text={isEditMode ? t('transactionModal.saveChanges') : t('transactionModal.add')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;