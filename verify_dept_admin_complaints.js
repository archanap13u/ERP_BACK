const mongoose = require('mongoose');
require('dotenv').config();
const { Schema } = mongoose;

// Define minimal schema for testing
const ComplaintSchema = new Schema({
    employeeId: { type: String, required: false },
    username: { type: String, required: false },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});
const Complaint = mongoose.model('Complaint', ComplaintSchema);

async function testDeptAdminComplaints() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Create a complaint for "operation" admin (no employeeId)
        const testComplaint = {
            username: 'operation',
            employeeName: 'Ms. Operations',
            department: 'Operations',
            departmentId: new mongoose.Types.ObjectId(), // Fake ID
            subject: 'Test Complaint from Ops Admin',
            description: 'This is a test complaint filed by the operations admin.',
            organizationId: new mongoose.Types.ObjectId() // Fake ID
        };

        const created = await Complaint.create(testComplaint);
        console.log(`✅ Created test complaint with ID: ${created._id}`);
        console.log(`   Username: ${created.username}, EmployeeID: ${created.employeeId}`);

        // 2. Fetch complaints filtering by username="operation"
        // Simulating the API logic: { $or: [{ employeeId: ... }, { username: 'operation' }] }

        const username = 'operation';
        const query = {
            $or: [
                { username: username }
            ]
        };

        const found = await Complaint.find(query);
        console.log(`\n🔍 Searching for complaints with username="${username}"`);
        console.log(`✅ Found ${found.length} complaints`);

        const match = found.find(c => c._id.toString() === created._id.toString());
        if (match) {
            console.log('   ✅ verified: Newly created complaint was found via query');
        } else {
            console.error('   ❌ FAILED: Newly created complaint was NOT found');
        }

        // Cleanup
        await Complaint.deleteOne({ _id: created._id });
        console.log('\n🧹 Cleaned up test data');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testDeptAdminComplaints();
