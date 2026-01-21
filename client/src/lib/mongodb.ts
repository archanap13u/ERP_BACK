import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-next';

console.log('[MongoDB Config] Initializing with URI:', MONGODB_URI.substring(0, 20) + '...');

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        };

        console.log(`[MongoDB] Connecting to database...`);
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log(`[MongoDB] ✅ Connection established to ${mongoose.connection.host}`);
            return mongoose;
        }).catch(err => {
            console.error(`[MongoDB] ❌ Connection error:`, err.message);
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
