import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TFunction } from 'i18next';
import { Expense, Income, Transaction } from '@/app/types';
import { UserSettings, getDefaultSettings } from '@/app/types/settings';
import { fetchTransactions, fetchSettings } from '@/app/services/api';
import { initTranslations, createSafeTranslation } from '@/app/utils/translations';

export const useDashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [t, setT] = useState<TFunction | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<
        Transaction | undefined
    >(undefined);

    const safeT = createSafeTranslation(t);

    useEffect(() => {
        let mounted = true;

        const initializeDashboard = async () => {
            if (status === 'unauthenticated') {
                router.replace('/');
                return;
            }

            if (status === 'authenticated' && session?.user) {
                const { expenses: fetchedExpenses, incomes: fetchedIncomes } =
                    await fetchTransactions(session);

                if (mounted) {
                    setExpenses(fetchedExpenses);
                    setIncomes(fetchedIncomes);
                }

                const userSettings = await fetchSettings(session);
                if (mounted) {
                    setSettings(userSettings);
                    const loadedT = await initTranslations(userSettings);
                    setT(() => loadedT);
                    setIsInitialized(true);
                }
            }
        };

        initializeDashboard();

        return () => {
            mounted = false;
        };
    }, [status, session, router]);

    const refreshTransactions = async () => {
        const { expenses: fetchedExpenses, incomes: fetchedIncomes } =
            await fetchTransactions(session);
        setExpenses(fetchedExpenses);
        setIncomes(fetchedIncomes);
    };

    return {
        session,
        expenses,
        incomes,
        settings: settings || getDefaultSettings(),
        safeT,
        isInitialized,
        isModalOpen,
        editingTransaction,
        setExpenses,
        setIncomes,
        setIsModalOpen,
        setEditingTransaction,
        refreshTransactions,
    };
};