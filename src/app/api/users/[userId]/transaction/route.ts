import {NextRequest, NextResponse} from 'next/server';
import User from '@/app/models/User';
import Transaction from '@/app/models/Transaction';
import dbConnect from '@/app/lib/mongodb';
import {ITransaction} from '@/app/models/interfaces';
import mongoose from 'mongoose';
import {TransactionRequestBody} from "@/app/types";
import {authorizeRequest} from "@/app/api/helper";


// Helper to get current month's start and end dates
function getCurrentMonthDateRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {startOfMonth, endOfMonth};
}

// Common function to verify user and authorization


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
        const body: TransactionRequestBody = await request.json();

        const {
            type,
            amount,
            currency,
            date,
            description,
            category,
            source,
        } = body;

        if (
            !type ||
            !['income', 'expense'].includes(type) || amount <= 0 || !currency || !description || !date ||
            !category
        ) {
            return NextResponse.json(
                { error: 'Missing or invalid required transaction fields' },
                { status: 400 }
            );
        }

        // Validate category
        if (
            (type === 'income' &&
                !['salary', 'investment', 'transfer', 'gift', 'other', 'refund'].includes(category)) ||
            (type === 'expense' &&
                !['Survival', 'Growth', 'Fun', 'Restaurants', 'Mobility', 'Groceries', 'Other'].includes(category))
        ) {
            return NextResponse.json(
                { error: 'Invalid category for transaction type' },
                { status: 400 }
            );
        }

        const transactionData: Partial<ITransaction> = {
            userId: new mongoose.Types.ObjectId(userId),
            type,
            amount,
            currency,
            date: new Date(date),
            description,
            category,
            source,
        };

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

        return NextResponse.json(
            {
                success: true,
                transaction: {
                    ...newTransaction.toObject(),
                    id: newTransaction._id.toString(),
                },
                id: newTransaction._id.toString(),
            },
            { status: 201 }
        );
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
    const {userId} = await context.params;

    await dbConnect();
    const auth = await authorizeRequest(request, userId);
    if (!auth.authorized) return auth.response;

    try {
        const {startOfMonth, endOfMonth} = getCurrentMonthDateRange();

        const transactions = await Transaction.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: {$gte: startOfMonth, $lte: endOfMonth},
        }).sort({date: -1, createdAt: -1});

        return NextResponse.json({success: true, transactions});
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}