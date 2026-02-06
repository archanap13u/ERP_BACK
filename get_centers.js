
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const centers = await db.collection('studycenters').find({}).toArray();
        let output = '--- STUDY CENTERS ---\n';
        centers.forEach(c => {
            output += `Name: ${c.centerName}\n`;
            output += `Username: ${c.username}\n`;
            output += `Password: ${c.password}\n`;
            output += `Org: ${c.organizationId}\n`;
            output += '---\n';
        });
        fs.writeFileSync('center_list.txt', output);
        console.log('Center list written to center_list.txt');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
