const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Correct IDs found:
    const HR_ID = new mongoose.Types.ObjectId('696f248d7e737d6a7669c523');

    // Find the HR department to get the exact name
    const hrDept = await db.collection('departments').findOne({ _id: HR_ID });
    if (!hrDept) {
        console.error('HR Department not found!');
        process.exit(1);
    }

    console.log('Found HR Department:', hrDept.name);

    // Update Amal's record
    const result = await db.collection('employees').updateOne(
        { employeeName: /Amal/i },
        {
            $set: {
                departmentId: hrDept._id,
                department: hrDept.name
            }
        }
    );

    if (result.matchedCount > 0) {
        console.log(`Successfully updated ${result.modifiedCount} record(s) for Amal.`);
    } else {
        console.log('No employee named Amal found.');
    }

    process.exit();
}

run();
