
import mongoose from 'mongoose';
import StudyCenter from './src/models/StudyCenter';

const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const centers = await StudyCenter.find({});
        console.log('--- STUDY CENTERS DUMP ---');
        centers.forEach((c: any) => {
            console.log(`- Center: "${c.centerName}"`);
            console.log(`  User:   "${c.username || 'N/A'}"`);
            console.log(`  Pass:   "${c.password || 'N/A'}"`);
            console.log(`  Email:  "${c.email || 'N/A'}"`);
            console.log(`  OrgID:  ${c.organizationId}`);
            console.log('---');
        });
        console.log('Done.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
