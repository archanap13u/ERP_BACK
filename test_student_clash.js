const mongoose = require('mongoose');
require('dotenv').config();

async function testInsert() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');

        console.log('Testing insertion of two students with NO studentId...');

        const orgId = "test_org_" + Date.now();

        await collection.insertOne({
            studentName: "Test 1",
            organizationId: orgId,
            // no studentId
            username: "test1_" + Date.now(),
            email: "test1@example.com"
        });
        console.log('Inserted first student');

        await collection.insertOne({
            studentName: "Test 2",
            organizationId: orgId,
            // no studentId
            username: "test2_" + Date.now(),
            email: "test2@example.com"
        });
        console.log('Inserted second student - SUCCESS! Uniqueness constraint for missing studentId is working.');

        // Cleanup
        await collection.deleteMany({ organizationId: orgId });
        console.log('Test data cleaned up.');

        process.exit(0);
    } catch (e) {
        console.error('TEST FAILED:', e.message);
        process.exit(1);
    }
}

testInsert();
