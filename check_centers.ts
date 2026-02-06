
import mongoose from 'mongoose';
import StudyCenter from './src/models/StudyCenter';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        const centers = await StudyCenter.find({});
        console.log('--- STUDY CENTERS DUMP ---');
        centers.forEach((c: any) => {
            console.log(`Name: ${c.centerName}, User: "${c.username}", Pass: "${c.password}", OrgId: ${c.organizationId}`);
        });
        console.log('--------------------------');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
