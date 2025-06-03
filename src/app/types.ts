export type Currency = 'PLN' | 'USD' | 'EUR' | 'GBP';

// Base for frontend transactions
export interface BaseTransaction {
    id?: string; // Now string, to match MongoDB ObjectId
    amount: number;
    currency: Currency;
    date: string; // ISO 8601 string (YYYY-MM-DD)
    description: string;
    origin?: string; // This might map to ITransaction.source or be a separate detail
    linkedTransactionId?: string; // Now string, to match MongoDB ObjectId
}

// Frontend Expense type
export interface Expense extends BaseTransaction {
    _id: string;
    type: 'expense';
    category: string; // e.g., 'Groceries', 'Utilities', 'Rent', 'Fun'
    source?: string; // e.g., "Amazon", "Local Cafe"
    linkedIncomeId?: string; // Now string, to match MongoDB ObjectId
}

// Frontend Income Type
export type IncomeSourceType = 'salary' | 'investment' | 'transfer' | 'gift' | 'other' | 'refund';

export interface Income extends BaseTransaction {
    _id: string;
    type: 'income';
    source: string; // The primary source of income (e.g., 'Employer', 'Investment Fund', 'Client')
    incomeType: IncomeSourceType; // Specific type of income
    category?: string; // Optional category for income
    linkedExpenseId?: string; // Now string, to match MongoDB ObjectId
    returnPercentage?: number; // Only if incomeType is 'refund'
}

// Union type for all frontend transactions
export type Transaction = Expense | Income;

// Predefined categories/types for dropdowns
export type ExpenseCategory =
    | 'Survival'
    | 'Growth'
    | 'Fun'
    | 'Restaurants'
    | 'Mobility'
    | 'Groceries'
    | 'Other';

export type IncomeCategory =
    | 'Salary'
    | 'Investment'
    | 'Gift'
    | 'Refund'
    | 'Other'; // These are more for the 'category' field on income