import { Document, Schema } from 'mongoose'; // Import Document and Schema for Mongoose-specific interfaces

// --- User Settings Interface ---
export interface IUserSettings {
    defaultCurrency: 'PLN' | 'USD' | 'EUR' | 'GBP';
    preferredDateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    customName?: string;
    preferredTheme: 'light' | 'dark';
    language: 'en' | 'pl' | 'es' | 'fr';
    notifications: {
        push: boolean;
        email: boolean;
        budgetAlerts: boolean;
    };
    budget: {
        monthlyLimit: number;
    };
    privacy: {
        dataRetention: '6months' | '1year' | '2years' | 'forever';
    };
}

// --- User Interface ---
// Represents the Mongoose document structure for a User
export interface IUser extends Document {
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    image?: string;
    emailVerified?: Date;
    provider: string[];
    googleProfile?: Record<string, unknown>; // Use 'unknown' for type safety
    locale?: string;
    createdAt: Date;
    settings: IUserSettings;
    updatedAt: Date;
    // Reference to Transaction documents
    transactions: Schema.Types.ObjectId[];
}

// --- Transaction Interface ---
export type Currency = 'PLN' | 'USD' | 'EUR' | 'GBP';
export type MongooseTransactionType = 'income' | 'expense';
export type MongooseIncomeSourceType = 'salary' | 'investment' | 'transfer' | 'gift' | 'other' | 'refund'; // Keep this consistent

export interface ITransaction extends Document {
    userId: Schema.Types.ObjectId;
    type: MongooseTransactionType; // 'income' or 'expense'
    amount: number;
    currency: Currency;
    date: Date;
    description: string;
    category?: string; // For expense category, or income category
    source?: string; // For expense merchant, or income source name (employer, etc.)
    incomeType?: MongooseIncomeSourceType; // Specific for income type
    returnPercentage?: number; // Specific for refund income type
    linkedTransactionId?: Schema.Types.ObjectId; // MongoDB ID for linking
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}