
import mongoose from 'mongoose';
import Complaint from './src/models/Complaint';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        const complaints = await Complaint.find({});
        console.log('--- COMPLAINTS DUMP ---');
        complaints.forEach((c: any) => {
            console.log(`ID: ${c._id}, EmpID: "${c.employeeId}", Subject: ${c.subject}, Dept: ${c.department}`);
        });
        console.log('-----------------------');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
