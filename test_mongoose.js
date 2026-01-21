const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { models } = require('./server/models');
        const Student = models.student;

        const orgId = "696f24697e737d6a7669c501"; // archana's org

        console.log('Testing Mongoose save with missing studentId...');

        const s1 = new Student({
            studentName: "Mongoose Test 1",
            organizationId: orgId,
            email: "mtest1@example.com",
            username: "mtest1"
        });
        await s1.save();
        console.log('Saved first');

        try {
            const s2 = new Student({
                studentName: "Mongoose Test 2",
                organizationId: orgId,
                email: "mtest2@example.com",
                username: "mtest2"
            });
            await s2.save();
            console.log('Saved second - OK!');
        } catch (e) {
            console.log('FAILED ON SECOND:', e.message);
            if (e.code === 11000) console.log('keyValue:', JSON.stringify(e.keyValue));
        }

        // Cleanup
        await Student.deleteMany({ studentName: /Mongoose Test/ });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testMongoose();
