import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Adjust path as needed
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db';

async function check() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const centers = await db.collection('studycenters').find({ source: 'Referral' }).toArray();

        console.log(`Found ${centers.length} referred centers:`);
        centers.forEach(c => {
            console.log(`- ID: ${c._id}`);
            console.log(`  Name: ${c.centerName}`);
            console.log(`  OrgId: ${c.organizationId} (Type: ${typeof c.organizationId})`);
            console.log(`  SalesEmpId: "${c.salesEmployeeId}" (Type: ${typeof c.salesEmployeeId})`);
            console.log(`  DeptId: ${c.departmentId} (Type: ${typeof c.departmentId})`);
            console.log(`  Status: ${c.status}`);
            console.log(`  CreatedAt: ${c.createdAt}`);
            console.log('----------------');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
