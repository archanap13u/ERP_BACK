
const mongoose = require('mongoose');

// Hardcoded URI from verify_centers.js
const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'debug_output.txt');
const logStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });

function log(msg) {
    console.log(msg); // Keep console for progress
    logStream.write(msg + '\n');
}

async function run() {
    try {
        log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const employeesColl = db.collection('employees');
        const leavesColl = db.collection('leaverequests');
        const deptsColl = db.collection('departments');

        log('\n--- FINDING EMPLOYEE: Arun ---');
        const employees = await employeesColl.find({
            employeeName: { $regex: /Arun/i }
        }).toArray();

        if (employees.length === 0) {
            log('No employee found with name matching "Arun"');
        } else {
            for (const emp of employees) {
                log(`Found Employee: ${emp.employeeName} (ID: ${emp.employeeId})`);
                log(`- _id: ${emp._id}`);
                log(`- Department: "${emp.department}"`);
                log(`- DepartmentId: ${emp.departmentId}`);
                log(`- OrganizationId: ${emp.organizationId}`);

                if (emp.departmentId) {
                    try {
                        // Check if it's a valid ObjectId
                        const deptId = typeof emp.departmentId === 'string' ? new mongoose.Types.ObjectId(emp.departmentId) : emp.departmentId;
                        const dept = await deptsColl.findOne({ _id: deptId });
                        if (dept) {
                            log(`- Linked Dept Metadata: Name="${dept.name}", PanelType="${dept.panelType}"`);
                        } else {
                            log(`- Linked Dept NOT FOUND in DB for ID: ${emp.departmentId}`);
                        }
                    } catch (e) {
                        log(`- Error looking up dept: ${e.message}`);
                    }
                }
            }
        }

        log('\n--- FINDING LEAVE REQUESTS FOR ARUN ---');
        for (const emp of employees) {
            log(`\nChecking leaves for ${emp.employeeName} (${emp.employeeId}):`);
            const leaves = await leavesColl.find({
                $or: [
                    { employeeId: emp.employeeId },
                    { employeeName: { $regex: /Arun/i } } // Fallback check
                ]
            }).toArray();

            if (leaves.length === 0) log('No leave requests found.');

            for (const leave of leaves) {
                log(`> Leave Request: ${leave._id}`);
                log(`  - Status: "${leave.status}"`);
                log(`  - Department in Leave: "${leave.department}"`);
                log(`  - DepartmentId: "${leave.departmentId}"`);
                log(`  - OrganizationId: "${leave.organizationId}"`);
                log(`  - Dates: ${leave.fromDate} to ${leave.toDate}`);
            }
        }

        log('\n--- FINDING OPS DEPARTMENTS ---');
        const opsDepts = await deptsColl.find({
            $or: [{ panelType: 'Operations' }, { panelType: 'Education' }, { name: { $regex: /Operation/i } }]
        }).toArray();
        opsDepts.forEach(d => {
            log(`Dept: "${d.name}" (ID: ${d._id}), PanelType: "${d.panelType}"`);
        });

        log('Done.');
        logStream.end();
        process.exit(0);
    } catch (e) {
        log('Error:' + e);
        logStream.end();
        process.exit(1);
    }
}

run();
