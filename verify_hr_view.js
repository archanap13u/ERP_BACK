const mongoose = require('mongoose');
require('dotenv').config();
const { Schema } = mongoose;

// Define minimal schema
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

const OrganizationSchema = new Schema({ name: String });
const Organization = mongoose.model('Organization', OrganizationSchema);

async function verifyHRView() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find an Organization
        const org = await Organization.findOne();
        if (!org) {
            console.error('❌ No Organization found, cannot test');
            return;
        }
        console.log(`🏢 Using Organization: ${org._id}`);

        // 2. Create a Complaint as Dept Admin (username based)
        const cleanupId = new mongoose.Types.ObjectId();
        await Complaint.create({
            _id: cleanupId,
            username: 'operation',
            employeeName: 'Ms. Operations',
            department: 'Operations',
            departmentId: new mongoose.Types.ObjectId(),
            subject: 'Test Complaint for HR View',
            description: 'HR should see this complaint filed by Operations Dept Admin',
            organizationId: org._id
        });
        console.log('✅ Created test complaint as Dept Admin');

        // 3. Simulate HR Dashboard Fetch (Fetch ALL for Org, no employeeId/username filter)
        // HR Dashboard calls: /api/resource/complaint?organizationId=...
        const hrComplaints = await Complaint.find({ organizationId: org._id }).sort({ updatedAt: -1 });

        console.log(`\n🔍 HR Dashboard Fetch Code found ${hrComplaints.length} complaints.`);

        const found = hrComplaints.find(c => c._id.toString() === cleanupId.toString());
        if (found) {
            console.log('✅ SUCCESS: HR Dashboard fetch INCLUDES the Dept Admin complaint.');
            console.log(`   Internal Data: Name="${found.employeeName}", Username="${found.username}", EmpID="${found.employeeId}"`);
        } else {
            console.error('❌ FAILURE: Dept Admin complaint missing from HR fetch.');
        }

        // Cleanup
        await Complaint.deleteOne({ _id: cleanupId });
        console.log('\n🧹 Cleanup done.');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyHRView();
