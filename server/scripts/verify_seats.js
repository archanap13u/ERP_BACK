const mongoose = require('mongoose');
const { models } = require('../models');

// Connect to DB (update URI as needed, assuming local default or env)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext_dev'; // Adjust generic dev DB name

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find an active Organization
        const org = await models.organization.findOne({ isActive: true });
        if (!org) throw new Error('No active organization found');

        console.log(`Testing with Organization: ${org.name} (${org.organizationId})`);
        console.log(`Max Users: ${org.subscription.maxUsers}`);

        // 2. Count current employees
        const initialCount = await models.employee.countDocuments({ organizationId: org._id });
        console.log(`Initial Employee Count: ${initialCount}`);

        // 3. Try to add employees until limit hit
        let currentCount = initialCount;
        const limit = org.subscription.maxUsers || 10;

        // If already full, try one to fail
        if (currentCount >= limit) {
            console.log('Limit already reached, attempting one addition to confirm failure...');
            try {
                await createDummyEmployee(org._id, currentCount + 1);
                console.error('FAILED: Employee created despite limit reached!');
            } catch (e) {
                console.log('SUCCESS: Blocked creation as expected:', e.message);
            }
        } else {
            // Add until full
            while (currentCount < limit) {
                console.log(`Adding employee ${currentCount + 1}...`);
                await createDummyEmployee(org._id, currentCount + 1);
                currentCount++;
            }

            // Now try one more
            console.log('Limit reached, attempting one addition to confirm failure...');
            try {
                await createDummyEmployee(org._id, currentCount + 1);
                console.error('FAILED: Employee created despite limit reached!');
            } catch (e) {
                console.log('SUCCESS: Blocked creation as expected:', e.message);
            }
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

async function createDummyEmployee(orgId, num) {
    const emp = new models.employee({
        employeeId: `TEST-${Date.now()}-${num}`,
        employeeName: `Test User ${num}`,
        designation: 'Tester',
        department: 'IT',
        organizationId: orgId,
        username: `test${Date.now()}${num}`,
        email: `test${Date.now()}${num}@example.com`
    });
    await emp.save();
    console.log(`Created ${emp.employeeName}`);
}

run();
