import {NextRequest, NextResponse} from 'next/server';
import User from '@/app/models/User';
import Transaction from '@/app/models/Transaction';
import dbConnect from '@/app/lib/mongodb';
import {ITransaction, MongooseIncomeSourceType} from '@/app/models/interfaces';
import mongoose from 'mongoose';
import { TransactionRequestBody} from "@/app/types";
import {authorizeRequest} from "@/app/api/helper";


// Helper to get current month's start and end dates
function getCurrentMonthDateRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {startOfMonth, endOfMonth};
}

// Common function to verify user and authorization


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

        console.log('POST body:', body);

        const {
            type,
            amount,
            currency,
            date,
            description,
            category,
            incomeType,
            source,
            returnPercentage,
            linkedTransactionId,
        } = body;

        // Handle the case where frontend sends category for income (temporary fix)
        const actualIncomeType = type === 'income' ? (incomeType || category) : undefined;
        const actualCategory = type === 'expense' ? category : undefined;

        // Validation
        if (!type || !['income', 'expense'].includes(type)) {
            return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
        }
        if (amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }
        if (!currency || !description || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate category based on transaction type
        if (type === 'income') {
            if (!actualIncomeType) {
                return NextResponse.json({ error: 'Missing incomeType for income transaction' }, { status: 400 });
            }
            // Convert to lowercase and validate
            const normalizedIncomeType = actualIncomeType.toLowerCase();
            if (!['salary', 'investment', 'transfer', 'gift', 'other', 'refund'].includes(normalizedIncomeType)) {
                return NextResponse.json({ error: `Invalid incomeType: ${actualIncomeType}` }, { status: 400 });
            }
        } else {
            if (!actualCategory) {
                return NextResponse.json({ error: 'Missing category for expense transaction' }, { status: 400 });
            }
            if (!['Survival', 'Growth', 'Fun', 'Restaurants', 'Mobility', 'Groceries', 'Other'].includes(actualCategory)) {
                return NextResponse.json({ error: `Invalid category: ${actualCategory}` }, { status: 400 });
            }
        }

        // Build transaction data
        const transactionData: Partial<ITransaction> = {
            userId: new mongoose.Types.ObjectId(userId),
            type,
            amount,
            currency,
            date: new Date(date),
            description,
            source,
        };

        // Add the appropriate category field
        if (type === 'income') {
            transactionData.incomeType = actualIncomeType!.toLowerCase() as MongooseIncomeSourceType;
            if (actualIncomeType!.toLowerCase() === 'refund' && typeof returnPercentage === 'number') {
                transactionData.returnPercentage = returnPercentage;
            }
        } else {
            transactionData.category = actualCategory;
        }

        if (linkedTransactionId) {
            transactionData.linkedTransactionId = new mongoose.Types.ObjectId(linkedTransactionId);
        }

        console.log('Transaction data to create:', transactionData);

        const newTransaction = await Transaction.create(transactionData);

        const userUpdateResult = await User.findByIdAndUpdate(
            userId,
            { $push: { transactions: newTransaction._id } },
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