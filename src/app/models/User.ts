import { Schema, model, models, Document } from 'mongoose';
import { IUserSettings, IUser } from './interfaces';

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    given_name: {
        type: String,
    },
    family_name: {
        type: String,
    },
    image: {
        type: String,
    },
    emailVerified: {
        type: Date,
    },
    provider: {
        type: [String],
        default: [],
    },
    googleProfile: {
        type: Object,
    },
    locale: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    settings: {
        defaultCurrency: {
            type: String,
            default: 'PLN',
            enum: ['PLN', 'USD', 'EUR', 'GBP'],
        },
        preferredDateFormat: {
            type: String,
            default: 'DD/MM/YYYY',
            enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
        },
        customName: {
            type: String,
        },
        preferredTheme: {
            type: String,
            default: 'light',
            enum: ['light', 'dark'],
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'pl', 'es', 'fr'],
        },
        notifications: {
            push: {
                type: Boolean,
                default: true,
            },
            email: {
                type: Boolean,
                default: false,
            },
            budgetAlerts: {
                type: Boolean,
                default: true,
            },
        },
        budget: {
            monthlyLimit: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        privacy: {
            dataRetention: {
                type: String,
                default: '1year',
                enum: ['6months', '1year', '2years', 'forever'],
            },
        },
    },
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Transaction',
        },
    ],
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function (next) {
    // Explicitly type `this` as IUser to confirm to TypeScript that `updatedAt` is a Date
    const doc = this as IUser;
    doc.updatedAt = new Date();
    next();
});

// Update the updatedAt field before updating
UserSchema.pre('findOneAndUpdate', function (next) {
    // For `findOneAndUpdate` pre-hook, `this` is a Query, not a document.
    // The `set` method is safe here, but ensuring type consistency for the `updatedAt` type.
    this.set('updatedAt', new Date()); // Mongoose's set method handles the Date object correctly.
    next();
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;