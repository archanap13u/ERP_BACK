const mongoose = require('mongoose');
require('dotenv').config();

async function simulateAdd() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { models } = require('./server/models');
        const Student = models.student;

        // Use archana's orgId
        const orgId = "696f24697e737d6a7669c501";

        console.log(`Attempting to add student to org ${orgId}...`);

        try {
            const s1 = new Student({
                studentName: "Test Student " + Date.now(),
                organizationId: orgId,
                email: "test_" + Date.now() + "@example.com",
                username: "testuser_" + Date.now()
                // studentId missing
            });
            await s1.save();
            console.log('Saved first test student.');

            const s2 = new Student({
                studentName: "Test Student 2 " + Date.now(),
                organizationId: orgId,
                email: "test2_" + Date.now() + "@example.com",
                username: "testuser2_" + Date.now()
                // studentId missing
            });
            await s2.save();
            console.log('Saved second test student! UNIQUE CONSTRAINT FIXED.');

            // cleanup
            await Student.deleteMany({ studentName: /Test Student/ });
            console.log('Cleanup done.');

        } catch (saveError) {
            console.error('SAVE FAILED:', saveError.message);
            if (saveError.keyValue) console.log('keyValue:', JSON.stringify(saveError.keyValue));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

simulateAdd();
