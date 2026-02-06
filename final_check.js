
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const collection = mongoose.connection.db.collection('studycenters');
        const centers = await collection.find({}).toArray();
        console.log('--- DB DUMP START ---');
        centers.forEach(c => {
            console.log(`JSON_START${JSON.stringify({
                name: c.centerName,
                user: c.username,
                pass: c.password,
                org: c.organizationId
            })}JSON_END`);
        });
        console.log('--- DB DUMP END ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
