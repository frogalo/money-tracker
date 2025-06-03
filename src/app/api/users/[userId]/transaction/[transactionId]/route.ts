import { NextRequest, NextResponse } from 'next/server';
import User from '@/app/models/User';
import Transaction from '@/app/models/Transaction';
import dbConnect from '@/app/lib/mongodb';
import { ITransaction } from '@/app/models/interfaces';
import mongoose from 'mongoose';
import {authorizeRequest} from "@/app/api/helper";

// PUT: Update an existing transaction
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ userId: string; transactionId: string }> }
) {
    const { userId, transactionId } = await context.params;
    await dbConnect();
    const auth = await authorizeRequest(request, userId);
    if (!auth.authorized) return auth.response;

    try {
        // Validate transactionId format
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 });
        }

        const body: Partial<ITransaction> = await request.json();

        // Validate that we have something to update
        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ error: 'No data provided for update' }, { status: 400 });
        }

        const updateFields: Partial<ITransaction> = {};
        const allowedUpdateFields = [
            'amount',
            'currency',
            'date',
            'description',
            'category',
            'source',
            'incomeType',
            'returnPercentage',
            'linkedTransactionId',
            'notes'
        ];

        // Filter and validate update fields
        for (const field of allowedUpdateFields) {
            const value = body[field as keyof Partial<ITransaction>];
            if (value !== undefined) {
                // Basic validation for specific fields
                if (field === 'amount' && (typeof value !== 'number' || value <= 0)) {
                    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
                }
                if (field === 'date') {
                    updateFields[field as keyof Partial<ITransaction>] = new Date(value as string);
                } else if (field === 'linkedTransactionId' && value) {
                    updateFields[field as keyof Partial<ITransaction>] = new mongoose.Types.ObjectId(value as string);
                } else {
                    updateFields[field as keyof Partial<ITransaction>] = value;
                }
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Find and update the transaction
        const updatedTransaction = await Transaction.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(transactionId),
                userId: new mongoose.Types.ObjectId(userId)
            },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return NextResponse.json({
                error: 'Transaction not found or does not belong to user'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            transaction: updatedTransaction
        });
    } catch (error) {
        console.error('Error updating transaction:', error);

        // Handle validation errors
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({
                error: 'Validation error',
                details: error.message
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a transaction
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ userId: string; transactionId: string }> }
) {
    const { userId, transactionId } = await context.params;
    await dbConnect();
    const auth = await authorizeRequest(request, userId);
    if (!auth.authorized) return auth.response;

    try {
        // Validate transactionId format
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 });
        }

        // Find and delete the transaction
        const deletedTransaction = await Transaction.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(transactionId),
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!deletedTransaction) {
            return NextResponse.json({
                error: 'Transaction not found or does not belong to user'
            }, { status: 404 });
        }

        // Remove transaction reference from user
        await User.findByIdAndUpdate(
            userId,
            { $pull: { transactions: deletedTransaction._id } },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Transaction deleted successfully',
            deletedTransaction: {
                id: deletedTransaction._id.toString(),
                description: deletedTransaction.description,
                amount: deletedTransaction.amount
            }
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: Get a specific transaction
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string; transactionId: string }> }
) {
    const { userId, transactionId } = await context.params;
    await dbConnect();
    const auth = await authorizeRequest(request, userId);
    if (!auth.authorized) return auth.response;

    try {
        // Validate transactionId format
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 });
        }

        const transaction = await Transaction.findOne({
            _id: new mongoose.Types.ObjectId(transactionId),
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!transaction) {
            return NextResponse.json({
                error: 'Transaction not found or does not belong to user'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}