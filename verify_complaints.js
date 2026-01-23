require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./server/models/Complaint');
const connectDB = require('./server/config/db');

async function check() {
    await connectDB();

    // Find a complaint (created by any user or just look at existing)
    const allComplaints = await Complaint.find().limit(5).lean();
    console.log(`Total complaints found: ${allComplaints.length}`);

    if (allComplaints.length > 0) {
        const targetId = allComplaints[0].employeeId;
        const targetName = allComplaints[0].employeeName;

        console.log(`\nTesting filtering for employee: ${targetName} (${targetId})`);

        if (targetId) {
            const filtered = await Complaint.find({ employeeId: targetId }).lean();
            console.log(`Filtered count for ${targetId}: ${filtered.length}`);
            filtered.forEach(c => {
                if (c.employeeId !== targetId) {
                    console.error(`ERROR: Found complaint for wrong employee! ${c.employeeId}`);
                }
            });
        } else {
            console.log('No employeeId found on the test record. Please create a complaint through the portal first.');
        }
    }

    mongoose.disconnect();
}

check().catch(console.error);
