import { Schema, model, models } from 'mongoose';
// Correct import path for ITransaction
import { ITransaction } from './interfaces';

const TransactionSchema = new Schema<ITransaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        enum: ['PLN', 'USD', 'EUR', 'GBP'],
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
    },
    category: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    source: {
        type: String,
        trim: true,
        maxlength: 255,
    },
    linkedTransactionId: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

TransactionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

TransactionSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;