require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./server/models/Complaint');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function backfill() {
    await connectDB();

    console.log('--- Starting Complaint Backfill ---');
    const complaints = await Complaint.find({ employeeId: { $exists: false } });
    console.log(`Found ${complaints.length} complaints without employeeId.`);

    let updatedCount = 0;
    for (const comp of complaints) {
        if (comp.employeeName) {
            // Case-insensitive name match within the same organization
            const emp = await Employee.findOne({
                employeeName: { $regex: new RegExp(`^${comp.employeeName.trim()}$`, "i") },
                organizationId: comp.organizationId
            });

            if (emp) {
                comp.employeeId = emp.employeeId;
                await comp.save();
                console.log(`[Fixed] Linked "${comp.employeeName}" to ID "${emp.employeeId}"`);
                updatedCount++;
            } else {
                console.log(`[Skip] No employee match found for "${comp.employeeName}" in org ${comp.organizationId}`);
            }
        }
    }

    console.log(`--- Backfill Complete. Updated ${updatedCount} records. ---`);
    mongoose.disconnect();
}

backfill().catch(console.error);
