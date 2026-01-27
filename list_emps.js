const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const emps = await db.collection('employees').find({}).toArray();
    console.log('employeeName,employeeId,department,organizationId');
    emps.forEach(e => {
        console.log(`${e.employeeName},${e.employeeId},${e.department},${e.organizationId}`);
    });

    process.exit();
}

run();
