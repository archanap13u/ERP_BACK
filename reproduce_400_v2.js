require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function reproduce() {
    await connectDB();
    console.log('--- DB Reproduction ---');

    // Find two students with studentId: "undefined"
    const students = await Student.find({ studentId: "undefined" }).limit(2);

    if (students.length < 2) {
        console.log('Not enough students with studentId: "undefined" to test collision.');
        // Maybe try to create them?
    } else {
        console.log(`Found ${students.length} students with studentId: "undefined"`);
        const target = students[0];
        console.log(`Attempting to update status for ${target.studentName} (${target._id})...`);

        try {
            target.verificationStatus = 'Verified by Ops';
            await target.save();
            console.log('Success: Save() worked (this means Mongoose/Mongo didn\'t care about existing duplicates if they weren\'t changed)');
        } catch (err) {
            console.error('Error on Save():', err.message);
            if (err.code === 11000) console.log('CAUGHT: Unique key collision on Save()');
        }

        try {
            const updated = await Student.findOneAndUpdate(
                { _id: target._id },
                { $set: { verificationStatus: 'Verified by Ops' } },
                { new: true }
            );
            console.log('Success: FindOneAndUpdate() worked');
        } catch (err) {
            console.error('Error on FindOneAndUpdate():', err.message);
            if (err.code === 11000) console.log('CAUGHT: Unique key collision on FindOneAndUpdate()');
        }
    }

    mongoose.disconnect();
}

reproduce().catch(err => {
    console.error(err);
    process.exit(1);
});
