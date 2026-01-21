const mongoose = require('mongoose');
require('dotenv').config();

async function testEmptyString() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { models } = require('./server/models');
        const Student = models.student;

        const orgId = "696f24697e737d6a7669c501";

        console.log('Testing Mongoose save with studentId: ""...');

        const s1 = new Student({
            studentName: "Empty Test 1",
            organizationId: orgId,
            studentId: "",
            email: "e1@example.com",
            username: "e1"
        });
        await s1.save();
        console.log('Saved 1');

        try {
            const s2 = new Student({
                studentName: "Empty Test 2",
                organizationId: orgId,
                studentId: "",
                email: "e2@example.com",
                username: "e2"
            });
            await s2.save();
            console.log('Saved 2 - OK! Empty string is ignored.');
        } catch (e) {
            console.log('FAILED ON EMPTY STRING:', e.message);
            if (e.code === 11000) console.log('keyValue:', JSON.stringify(e.keyValue));
        }

        await Student.deleteMany({ studentName: /Empty Test/ });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testEmptyString();
