import {Schema, model, models} from 'mongoose';

const UserSchema = new Schema({
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
        // Notification preferences (for future implementation)
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
        // Budget settings (for future implementation)
        budget: {
            monthlyLimit: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        // Privacy settings (for future implementation)
        privacy: {
            dataRetention: {
                type: String,
                default: '1year',
                enum: ['6months', '1year', '2years', 'forever'],
            },
        },
    },
    // Timestamps
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Update the updatedAt field before updating
UserSchema.pre('findOneAndUpdate', function (next) {
    this.set({updatedAt: new Date()});
    next();
});

const User = models.User || model('User', UserSchema);

export default User;