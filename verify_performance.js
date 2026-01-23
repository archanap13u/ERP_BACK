require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const Student = require('./server/models/Student');
const JobOpening = require('./server/models/JobOpening');
const connectDB = require('./server/config/db');

async function verify() {
    await connectDB();
    console.log('--- Database Index Verification ---');

    const models = [
        { name: 'Employee', model: Employee, query: { organizationId: new mongoose.Types.ObjectId() } },
        { name: 'Student', model: Student, query: { organizationId: new mongoose.Types.ObjectId() } },
        { name: 'JobOpening', model: JobOpening, query: { organizationId: new mongoose.Types.ObjectId() } }
    ];

    for (const { name, model, query } of models) {
        const explanation = await model.find(query).explain('executionStats');
        const winningPlan = explanation.queryPlanner.winningPlan;

        // Find if any stage is IXSCAN
        let hasIndexScan = JSON.stringify(winningPlan).includes('IXSCAN');

        console.log(`${name}: ${hasIndexScan ? 'PASSED (Index Scan)' : 'FAILED (Collection Scan)'}`);
        if (!hasIndexScan) {
            console.log('Winning Plan:', JSON.stringify(winningPlan, null, 2));
        }
    }

    mongoose.disconnect();
}

verify().catch(err => {
    console.error(err);
    process.exit(1);
});
