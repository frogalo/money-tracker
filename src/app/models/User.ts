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
    },
    //default currency
    //incomes
    //expenses
});

const User = models.User || model('User', UserSchema);

export default User;