
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const collection = mongoose.connection.db.collection('studycenters');
        const center = await collection.findOne({});
        console.log('--- SAMPLE CENTER ---');
        console.log(JSON.stringify(center, null, 2));
        console.log('--- END ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
