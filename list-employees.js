const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const employees = await db.collection('employees').find({}).toArray();
    console.log(`Total Employees Count: ${employees.length}`);
    console.log('Names:', JSON.stringify(employees.map(e => e.employeeName)));

    await mongoose.disconnect();
}

run().catch(console.error);
