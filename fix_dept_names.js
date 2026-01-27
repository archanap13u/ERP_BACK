const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function fixNames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const depts = await Department.find({});
        console.log('--- Checking Dept Names ---');
        for (const d of depts) {
            if (d.name === 'hr' && d.panelType === 'HR') {
                d.name = 'Human Resources';
                await d.save();
                console.log('Updated hr -> Human Resources');
            } else if (d.name === 'fin' && d.panelType === 'Finance') {
                d.name = 'Finance';
                await d.save();
                console.log('Updated fin -> Finance');
            } else if (d.name === 'op' && d.panelType === 'Operations') {
                d.name = 'Operations';
                await d.save();
                console.log('Updated op -> Operations');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixNames();
