import {Session} from 'next-auth';
import {Transaction, Expense, Income} from '@/app/types';
import {UserSettings, getDefaultSettings} from '@/app/types/settings';


export const fetchTransactions = async (
    session: Session | null
): Promise<{ expenses: Expense[]; incomes: Income[] }> => {
    if (!session?.user?.id) {
        return {expenses: [], incomes: []};
    }

    try {
        const response = await fetch(`/api/users/${session.user.id}/transaction`);
        const data = await response.json();

        if (response.ok && data.success) {
            const fetchedExpenses = data.transactions.filter(
                (t: Transaction) => t.type === 'expense'
            ) as Expense[];
            const fetchedIncomes = data.transactions.filter(
                (t: Transaction) => t.type === 'income'
            ) as Income[];

            return {expenses: fetchedExpenses, incomes: fetchedIncomes};
        } else {
            console.error(
                'Failed to fetch transactions:',
                data.error || 'Unknown error'
            );
            return {expenses: [], incomes: []};
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return {expenses: [], incomes: []};
    }
};

export const fetchSettings = async (
    session: Session | null
): Promise<UserSettings> => {
    if (!session?.user?.id) {
        return getDefaultSettings();
    }

    try {
        const response = await fetch(`/api/users/${session.user.id}/settings`);
        const data = await response.json();

        if (response.ok && data.success) {
            return data.settings;
        } else {
            console.warn('Failed to fetch settings from API, using defaults.');
            return getDefaultSettings();
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        return getDefaultSettings();
    }
};

export const deleteTransaction = async (
    session: Session | null,
    transactionId: string | number
): Promise<boolean> => {
    if (!session?.user?.id || !transactionId) return false;

    try {
        const response = await fetch(
            `/api/users/${session.user.id}/transaction/${transactionId}`,
            {
                method: 'DELETE',
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error(
                'Failed to delete transaction:',
                data.error || 'Unknown error'
            );
            return false;
        }

        // console.log('Transaction deleted successfully:', data.message);
        return true;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return false;
    }
};
