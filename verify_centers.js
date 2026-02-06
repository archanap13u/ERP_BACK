
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('studycenters');

        const centers = await collection.find({}).toArray();
        console.log('--- STUDY CENTERS VERIFICATION ---');
        console.log(`Total centers found: ${centers.length}`);

        centers.forEach((c, idx) => {
            console.log(`${idx + 1}. Center Name: "${c.centerName}"`);
            console.log(`   Username:    "${c.username || 'MISSING'}"`);
            console.log(`   Password:    "${c.password || 'MISSING'}"`);
            console.log(`   Org ID:      ${c.organizationId}`);
            console.log(`   Document ID: ${c._id}`);
            console.log('   ---');
        });

        console.log('Verification Complete.');
        process.exit(0);
    } catch (e) {
        console.error('Error during verification:', e);
        process.exit(1);
    }
}

run();
