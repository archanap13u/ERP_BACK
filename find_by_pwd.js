require('dotenv').config();
const mongoose = require('mongoose');
const { models } = require('./server/models');
const connectDB = require('./server/config/db');

async function run() {
    await connectDB();
    for (const [name, Model] of Object.entries(models)) {
        try {
            const results = await Model.find({ password: 'su' }).lean();
            if (results.length > 0) {
                console.log(`[${name}] found:`, results.map(r => ({ id: r.employeeId || r.username || r._id, name: r.name || r.employeeName })));
            }
        } catch (e) { }
    }
    process.exit();
}
run();
