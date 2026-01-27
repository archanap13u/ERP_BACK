const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./server/models/Student');

async function testLoginLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find or create a test student
        let student = await Student.findOne({ email: 'login_test@example.com' });
        if (!student) {
            student = new Student({
                studentName: 'Login Test Student',
                email: 'login_test@example.com',
                username: 'teststudent',
                password: 'password123',
                organizationId: new mongoose.Types.ObjectId(),
                isActive: true,
                verificationStatus: 'Approved by Accounts'
            });
            await student.save();
        } else {
            student.isActive = true;
            student.verificationStatus = 'Approved by Accounts';
            await student.save();
        }

        console.log('--- Student for Test ---');
        console.log('isActive:', student.isActive);
        console.log('verificationStatus:', student.verificationStatus);

        // Simulate the logic in auth.js
        const fakePassword = 'password123';
        const isPasswordMatch = student.password === fakePassword;
        console.log('Password Match:', isPasswordMatch);

        const canLogin = isPasswordMatch && student.isActive;
        console.log('Can Login (based on isActive):', canLogin);

        process.exit(canLogin ? 0 : 1);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testLoginLogic();
