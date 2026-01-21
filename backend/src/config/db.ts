import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`[MongoDB] ✅ Connection established to ${conn.connection.host}`);
    } catch (err: any) {
        console.error(`[MongoDB] ❌ Connection error:`, err.message);
        process.exit(1);
    }
};
