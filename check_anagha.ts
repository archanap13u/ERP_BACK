
import mongoose from 'mongoose';
import Employee from './src/models/Employee';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        const emp = await Employee.findOne({ employeeName: /Anagha/i });
        console.log('--- ANAGHA EMPLOYEE RECORD ---');
        console.log(JSON.stringify(emp, null, 2));
        console.log('------------------------------');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
