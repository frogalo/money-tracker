import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import User from '@/app/models/User';
import Transaction from '@/app/models/Transaction';
import dbConnect from '@/app/lib/mongodb';
import { ITransaction, Currency, MongooseIncomeSourceType, MongooseTransactionType } from '@/app/models/interfaces';
import mongoose from 'mongoose'; // Import mongoose

// Helper to get current month's start and end dates
function getCurrentMonthDateRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last ms of the month
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
    const { userId } = await context.params; // Await params here
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

        return NextResponse.json({ success: true, transaction: newTransaction }, { status: 201 });
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
            userId: new mongoose.Types.ObjectId(userId), // Properly cast userId to ObjectId
            date: { $gte: startOfMonth, $lte: endOfMonth },
        }).sort({ date: -1, createdAt: -1 });

        return NextResponse.json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update an existing transaction
export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string, transactionId: string } }
) {
    await dbConnect();
    const auth = await authorizeRequest(request, params.userId);
    if (!auth.authorized) return auth.response;
    const { userId } = auth;

    try {
        const { transactionId } = params;
        const body: Partial<ITransaction> = await request.json();

        const updateFields: Partial<ITransaction> = {};
        const allowedUpdateFields = ['amount', 'currency', 'date', 'description', 'category', 'source', 'incomeType', 'returnPercentage', 'linkedTransactionId', 'notes'];

        for (const field of allowedUpdateFields) {
            if (body[field as keyof Partial<ITransaction>] !== undefined) {
                updateFields[field as keyof Partial<ITransaction>] = body[field as keyof Partial<ITransaction>];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: transactionId, userId: new mongoose.Types.ObjectId(userId) }, // Properly cast userId to ObjectId
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return NextResponse.json({ error: 'Transaction not found or does not belong to user' }, { status: 404 });
        }

        return NextResponse.json({ success: true, transaction: updatedTransaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a transaction
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string, transactionId: string } }
) {
    await dbConnect();
    const auth = await authorizeRequest(request, params.userId);
    if (!auth.authorized) return auth.response;
    const { userId } = auth;

    try {
        const { transactionId } = params;

        const session = await dbConnect().then((mongoose) => mongoose.connection.startSession());
        session.startTransaction();

        try {
            const deletedTransaction = await Transaction.findOneAndDelete(
                { _id: transactionId, userId: new mongoose.Types.ObjectId(userId) }, // Properly cast userId to ObjectId
                { session }
            );

            if (!deletedTransaction) {
                await session.abortTransaction();
                return NextResponse.json({ error: 'Transaction not found or does not belong to user' }, { status: 404 });
            }

            const userUpdateResult = await User.findByIdAndUpdate(
                userId,
                { $pull: { transactions: deletedTransaction._id } },
                { new: true, session }
            );

            if (!userUpdateResult) {
                throw new Error('Failed to unlink transaction from user');
            }

            await session.commitTransaction();
            return NextResponse.json({ success: true, message: 'Transaction deleted successfully' });
        } catch (error) {
            await session.abortTransaction();
            console.error('Transaction deletion/unlinking failed:', error);
            return NextResponse.json({ error: 'Failed to delete transaction due to database error' }, { status: 500 });
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}