import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import User from '@/app/models/User';
import Transaction from '@/app/models/Transaction';
import dbConnect from '@/app/lib/mongodb';
import { ITransaction, Currency, MongooseIncomeSourceType, MongooseTransactionType } from '@/app/models/interfaces';
import mongoose from 'mongoose';

// Helper to get current month's start and end dates
function getCurrentMonthDateRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
}

// Common function to verify user and authorization
async function authorizeRequest(request: NextRequest, userId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    if (session.user.id !== userId) {
        return { authorized: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { authorized: true, userId: session.user.id };
}

// POST: Add a new transaction
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    const { userId } = await context.params;
    await dbConnect();
    const auth = await authorizeRequest(request, userId);
    if (!auth.authorized) return auth.response;

    try {
        const body: Partial<ITransaction> = await request.json();

        // Basic Validation
        const {
            type,
            amount,
            currency,
            date,
            description,
            category,
            source,
            incomeType,
            returnPercentage,
            linkedTransactionId,
            notes,
        } = body;

        if (!type || !['income', 'expense'].includes(type) || !amount || amount <= 0 || !currency || !description || !date) {
            return NextResponse.json({ error: 'Missing or invalid required transaction fields' }, { status: 400 });
        }

        const transactionData: Partial<ITransaction> = {
            userId: new mongoose.Types.ObjectId(userId),
            type: type as MongooseTransactionType,
            amount: amount,
            currency: currency as Currency,
            date: new Date(date),
            description: description,
            category: category,
            source: source,
            notes: notes,
        };

        if (type === 'income') {
            if (!incomeType || !['salary', 'investment', 'transfer', 'gift', 'other', 'refund'].includes(incomeType)) {
                return NextResponse.json({ error: 'Invalid incomeType for income transaction' }, { status: 400 });
            }
            transactionData.incomeType = incomeType as MongooseIncomeSourceType;

            if (incomeType === 'refund' && typeof returnPercentage === 'number' && returnPercentage >= 0 && returnPercentage <= 100) {
                transactionData.returnPercentage = returnPercentage;
            }
        }

        if (linkedTransactionId) {
            transactionData.linkedTransactionId = new mongoose.Types.ObjectId(linkedTransactionId);
        }

        // Create the transaction
        const newTransaction = await Transaction.create(transactionData);

        if (!newTransaction) {
            throw new Error('Transaction creation failed');
        }

        const transactionId = newTransaction._id;

        // Push transaction ID to user's transactions array
        const userUpdateResult = await User.findByIdAndUpdate(
            userId,
            { $push: { transactions: transactionId } },
            { new: true }
        );

        if (!userUpdateResult) {
            throw new Error('Failed to link transaction to user');
        }

        return NextResponse.json({
            success: true,
            transaction: {
                ...newTransaction.toObject(),
                id: newTransaction._id.toString() // Ensure id is mapped correctly
            },
            id: newTransaction._id.toString() // Also provide id at root level
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding transaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: Retrieve user transactions for the current month
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    const { userId } = await context.params;

    await dbConnect();
    const auth = await authorizeRequest(request, userId);
    if (!auth.authorized) return auth.response;

    try {
        const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

        const transactions = await Transaction.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startOfMonth, $lte: endOfMonth },
        }).sort({ date: -1, createdAt: -1 });

        return NextResponse.json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}