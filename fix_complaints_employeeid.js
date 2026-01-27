const mongoose = require('mongoose');
require('dotenv').config();

async function fixComplaints() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Complaint = mongoose.connection.db.collection('complaints');
        const Employee = mongoose.connection.db.collection('employees');

        // Find complaints with null employeeId
        const brokenComplaints = await Complaint.find({
            $or: [
                { employeeId: null },
                { employeeId: { $exists: false } },
                { employeeId: '' },
                { employeeId: 'null' },
                { employeeId: 'undefined' }
            ]
        }).toArray();

        console.log(`⚠️  Found ${brokenComplaints.length} complaints with missing/invalid employeeId\n`);

        if (brokenComplaints.length === 0) {
            console.log('✅ All complaints have valid employeeId values!');
            return;
        }

        // Try to fix by matching employeeName
        for (const comp of brokenComplaints) {
            console.log(`\nProcessing: "${comp.subject}" by ${comp.employeeName}`);

            if (!comp.employeeName) {
                console.log('  ❌ No employeeName to search with, skipping');
                continue;
            }

            // Find employee by name
            const employee = await Employee.findOne({
                employeeName: comp.employeeName,
                organizationId: comp.organizationId
            });

            if (employee) {
                console.log(`  ✅ Found employee: ${employee.employeeName} (ID: ${employee.employeeId})`);

                // Update complaint with employeeId
                const result = await Complaint.updateOne(
                    { _id: comp._id },
                    { $set: { employeeId: employee.employeeId } }
                );

                console.log(`  ✅ Updated complaint with employeeId: ${employee.employeeId}`);
            } else {
                console.log(`  ⚠️  No employee found with name "${comp.employeeName}"`);
                console.log(`  Suggestion: You may need to delete this complaint or manually assign an employeeId`);
            }
        }

        console.log('\n✅ Fix complete! Verifying results...\n');

        // Verify
        const stillBroken = await Complaint.find({
            $or: [
                { employeeId: null },
                { employeeId: { $exists: false } },
                { employeeId: '' }
            ]
        }).toArray();

        console.log(`Remaining broken complaints: ${stillBroken.length}`);
        if (stillBroken.length > 0) {
            console.log('\nStill broken:');
            stillBroken.forEach(c => {
                console.log(`  - "${c.subject}" by ${c.employeeName || 'Unknown'}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixComplaints();
