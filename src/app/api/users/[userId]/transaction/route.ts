import {NextRequest, NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/lib/auth';
import User from '@/app/models/User';
import Transaction from '@/app/models/Transaction'; // Import the Transaction model
import dbConnect from '@/app/lib/mongodb';
import {ITransaction, Currency, MongooseIncomeSourceType, MongooseTransactionType} from '@/app/models/interfaces';
import {Schema} from "mongoose"; // Import Mongoose types

// Helper to get current month's start and end dates
function getCurrentMonthDateRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last ms of the month
    return {startOfMonth, endOfMonth};
}

// Common function to verify user and authorization
async function authorizeRequest(request: NextRequest, userId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return {authorized: false, response: NextResponse.json({error: 'Unauthorized'}, {status: 401})};
    }

    if (session.user.id !== userId) {
        return {authorized: false, response: NextResponse.json({error: 'Forbidden'}, {status: 403})};
    }
    return {authorized: true, userId: session.user.id};
}

// POST: Add a new transaction
export async function POST(
    request: NextRequest,
    {params}: { params: { userId: string } } // params is directly accessible, no need to await
) {
    await dbConnect();
    const auth = await authorizeRequest(request, params.userId);
    if (!auth.authorized) return auth.response;
    const {userId} = auth;

    try {
        const body: Partial<ITransaction> = await request.json();

        // Basic Validation (more comprehensive validation might use Zod or Joi)
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
            notes
        } = body;

        if (!type || !['income', 'expense'].includes(type) || !amount || amount <= 0 || !currency || !description || !date) {
            return NextResponse.json({error: 'Missing or invalid required transaction fields'}, {status: 400});
        }
        if (!userId) {
            return NextResponse.json({error: 'User ID is required'}, {status: 400});
        }
        const transactionData: Partial<ITransaction> = {
            userId: new Schema.Types.ObjectId(userId),
            type: type as MongooseTransactionType,
            amount: amount,
            currency: currency as Currency,
            date: new Date(date), // Ensure date is Date object
            description: description,
            category: category,
            source: source,
            notes: notes,
        };

        if (type === 'income') {
            if (!incomeType || !['salary', 'investment', 'transfer', 'gift', 'other', 'refund'].includes(incomeType)) {
                return NextResponse.json({error: 'Invalid incomeType for income transaction'}, {status: 400});
            }
            transactionData.incomeType = incomeType as MongooseIncomeSourceType;

            if (incomeType === 'refund' && typeof returnPercentage === 'number' && returnPercentage >= 0 && returnPercentage <= 100) {
                transactionData.returnPercentage = returnPercentage;
            }
        }

        if (linkedTransactionId) {
            // Validate if linkedTransactionId is a valid ObjectId string if it's from frontend
            // In your frontend mock it's a number, but in DB it's an ObjectId.
            // You'd need to query the actual Transaction by its MongoDB _id.
            // For simplicity here, we'll assume it's just a number for now, but in real use
            // you'd likely fetch/validate the actual MongoDB _id if it's an existing linked transaction.
            // transactionData.linkedTransactionId = new Schema.Types.ObjectId(linkedTransactionId as string);
        }

        let newTransaction;
        // Start a session for atomicity if MongoDB server supports it
        const session = await dbConnect().then(mongoose => mongoose.connection.startSession());
        session.startTransaction();

        try {
            newTransaction = await Transaction.create([transactionData], {session});

            if (!newTransaction || newTransaction.length === 0) {
                throw new Error('Transaction creation failed');
            }
            const transactionId = newTransaction[0]._id;

            // Push transaction ID to user's transactions array
            const userUpdateResult = await User.findByIdAndUpdate(
                userId,
                {$push: {transactions: transactionId}},
                {new: true, session}
            );

            if (!userUpdateResult) {
                throw new Error('Failed to link transaction to user');
            }

            await session.commitTransaction();
            return NextResponse.json({success: true, transaction: newTransaction[0]}, {status: 201});

        } catch (error) {
            await session.abortTransaction();
            console.error('Transaction creation/linking failed:', error);
            return NextResponse.json({error: 'Failed to create transaction due to database error'}, {status: 500});
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error adding transaction:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}


// GET: Retrieve user transactions for the current month
export async function GET(
    request: NextRequest,
    {params}: { params: { userId: string } }
) {
    await dbConnect();
    const auth = await authorizeRequest(request, params.userId);
    if (!auth.authorized) return auth.response;
    const {userId} = auth;

    try {
        const {startOfMonth, endOfMonth} = getCurrentMonthDateRange();

        const transactions = await Transaction.find({
            userId: userId,
            date: {$gte: startOfMonth, $lte: endOfMonth},
        }).sort({date: -1, createdAt: -1}); // Sort by date descending, then creation time

        return NextResponse.json({success: true, transactions});
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}

// PUT: Update an existing transaction
export async function PUT(
    request: NextRequest,
    {params}: { params: { userId: string, transactionId: string } } // transactionId will be part of the URL path
) {
    await dbConnect();
    const auth = await authorizeRequest(request, params.userId);
    if (!auth.authorized) return auth.response;
    const {userId} = auth;

    try {

        const {transactionId} = params;
        const body: Partial<ITransaction> = await request.json();

        // Ensure we only update allowed fields and validate them
        const updateFields: Partial<ITransaction> = {};
        const allowedUpdateFields = ['amount', 'currency', 'date', 'description', 'category', 'source', 'incomeType', 'returnPercentage', 'linkedTransactionId', 'notes'];

        for (const field of allowedUpdateFields) {
            if (body[field as keyof Partial<ITransaction>] !== undefined) {
                if (field === 'amount' && typeof body.amount !== 'number' || body.amount! <= 0) {
                    return NextResponse.json({error: 'Invalid amount'}, {status: 400});
                }
                if (field === 'currency' && !['PLN', 'USD', 'EUR', 'GBP'].includes(body.currency as string)) {
                    return NextResponse.json({error: 'Invalid currency'}, {status: 400});
                }
                if (field === 'date') {
                    return NextResponse.json({error: 'Invalid date format'}, {status: 400});
                } else if (field === 'incomeType') {
                    if (body.type === 'income' && !['salary', 'investment', 'transfer', 'gift', 'other', 'refund'].includes(body.incomeType as string)) {
                        return NextResponse.json({error: 'Invalid incomeType'}, {status: 400});
                    }
                    updateFields.incomeType = body.incomeType as MongooseIncomeSourceType;
                } else if (field === 'returnPercentage' && body.incomeType === 'refund') {
                    if (typeof body.returnPercentage !== 'number' || body.returnPercentage < 0 || body.returnPercentage > 100) {
                        return NextResponse.json({error: 'Invalid returnPercentage'}, {status: 400});
                    }
                    updateFields.returnPercentage = body.returnPercentage;
                } else if (field === 'linkedTransactionId' && body.linkedTransactionId !== undefined) {
                    // You might need to validate if the ID is a valid MongoDB ObjectId if linking by actual DB ID
                    // For now, assuming it's correctly passed if present.
                    updateFields.linkedTransactionId = body.linkedTransactionId;
                } else {
                    updateFields[field as keyof Partial<ITransaction>] = body[field as keyof Partial<ITransaction>];
                }
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({error: 'No valid fields to update'}, {status: 400});
        }

        // Find and update the transaction, ensuring it belongs to the user
        const updatedTransaction = await Transaction.findOneAndUpdate(
            {_id: transactionId, userId: userId}, // Query by transaction ID and user ID for security
            {$set: updateFields},
            {new: true, runValidators: true} // Return the updated document, run schema validators
        );

        if (!updatedTransaction) {
            return NextResponse.json({error: 'Transaction not found or does not belong to user'}, {status: 404});
        }

        return NextResponse.json({success: true, transaction: updatedTransaction});
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}

// DELETE: Delete a transaction
export async function DELETE(
    request: NextRequest,
    {params}: { params: { userId: string, transactionId: string } }
) {
    await dbConnect();
    const auth = await authorizeRequest(request, params.userId);
    if (!auth.authorized) return auth.response;
    const {userId} = auth;

    try {
        const {transactionId} = params;

        // Start a session for atomicity if MongoDB server supports it
        const session = await dbConnect().then(mongoose => mongoose.connection.startSession());
        session.startTransaction();

        try {
            // Delete the transaction, ensuring it belongs to the user
            const deletedTransaction = await Transaction.findOneAndDelete(
                {_id: transactionId, userId: userId},
                {session}
            );

            if (!deletedTransaction) {
                await session.abortTransaction();
                return NextResponse.json({error: 'Transaction not found or does not belong to user'}, {status: 404});
            }

            // Remove transaction ID from user's transactions array
            const userUpdateResult = await User.findByIdAndUpdate(
                userId,
                {$pull: {transactions: deletedTransaction._id}},
                {new: true, session}
            );

            if (!userUpdateResult) {
                // This is a rare edge case, but important for data integrity
                throw new Error('Failed to unlink transaction from user');
            }

            await session.commitTransaction();
            return NextResponse.json({success: true, message: 'Transaction deleted successfully'});

        } catch (error) {
            await session.abortTransaction();
            console.error('Transaction deletion/unlinking failed:', error);
            return NextResponse.json({error: 'Failed to delete transaction due to database error'}, {status: 500});
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
}