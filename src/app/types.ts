export interface Expense {
    id: number;
    category: string;
    description: string;
    amount: number;
    currency: string;
    origin?: string;
    date: string;
    linkedIncomeId?: number;
}

export interface Income {
    id: number;
    source: string;
    amount: number;
    currency: string;
    origin?: string;
    type: 'salary' | 'investment' | 'transfer' | 'other' | 'return';
    date: string;
    linkedExpenseId?: number;
    returnPercentage?: number;
}