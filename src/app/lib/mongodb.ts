import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

let cachedConn: mongoose.Mongoose | null = null;
let cachedPromise: Promise<mongoose.Mongoose> | null = null;

async function dbConnect() {
    if (cachedConn) {
        return cachedConn;
    }

    if (cachedPromise) {
        return await cachedPromise;
    }

    const opts = {
        bufferCommands: false,
    };

    cachedPromise = mongoose
        .connect(MONGODB_URI as string, opts)
        .then((mongoose) => {
            cachedConn = mongoose;
            return mongoose;
        });

    return await cachedPromise;
}

export default dbConnect;