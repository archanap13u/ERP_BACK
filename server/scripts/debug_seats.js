require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Define minimal schemas if models are not globally available
const OrgSchema = new mongoose.Schema({ name: String, organizationId: String, subscription: Object });
const EmpSchema = new mongoose.Schema({ employeeName: String, email: String, organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' } });

async function debugSeats() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const Organization = mongoose.model('Organization', OrgSchema);
        const Employee = mongoose.model('Employee', EmpSchema);

        const orgs = await Organization.find({});
        console.log(`Found ${orgs.length} Organizations`);

        for (const org of orgs) {
            console.log(`\n--- Org: ${org.name} (${org._id}) ---`);
            console.log(`Max Users: ${org.subscription?.maxUsers || 10}`);

            const employees = await Employee.find({ organizationId: org._id });
            console.log(`Actual Employee Count: ${employees.length}`);
            employees.forEach((e, i) => {
                console.log(`  ${i + 1}. ${e.employeeName} (${e.email}) [ID: ${e._id}]`);
            });
        }

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugSeats();
