const mongoose = require('mongoose');
require('dotenv').config();
const { Schema } = mongoose;

function toObjectId(val) {
    if (typeof val === 'string' && val.match(/^[0-9a-fA-F]{24}$/)) {
        return new mongoose.Types.ObjectId(val);
    }
    return val;
}

// Minimal Schema
const HolidaySchema = new Schema({
    holidayName: String,
    date: Date,
    description: String,
    organizationId: { type: Schema.Types.ObjectId, index: true },
    departmentId: { type: Schema.Types.ObjectId, index: true },
    department: { type: String, index: true }
});
const Holiday = mongoose.model('Holiday', HolidaySchema);

async function testHolidayLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Setup test data
        const orgId = new mongoose.Types.ObjectId();
        const hrDeptId = new mongoose.Types.ObjectId();
        const hrDeptName = 'Human Resources';

        const opsDeptId = new mongoose.Types.ObjectId();
        const opsDeptName = 'Operations';

        // 1. Create Holidays
        const h1 = await Holiday.create({
            holidayName: 'Global New Year',
            date: new Date('2026-01-01'),
            organizationId: orgId,
            department: null // Global
        });

        const h2 = await Holiday.create({
            holidayName: 'HR Retreat',
            date: new Date('2026-02-01'),
            organizationId: orgId,
            department: 'Human Resources',
            departmentId: hrDeptId
        });

        const h3 = await Holiday.create({
            holidayName: 'Ops Training Day',
            date: new Date('2026-03-01'),
            organizationId: orgId,
            department: 'Operations',
            departmentId: opsDeptId
        });

        console.log('✅ Created test holidays');

        // 2. Test Query Logic for an Operations User
        // User Context: OrgID, DeptID=Ops, DeptName=Operations

        const query = { organizationId: orgId };
        const departmentId = opsDeptId.toString();
        const departmentName = opsDeptName;

        const hrPattern = /^Human Resources$|^HR$|^hr$|^humanresources$/i;
        const holidayOrCondition = [
            { department: { $regex: hrPattern } },
            { department: { $exists: false } },
            { department: null },
            { department: '' }
        ];

        if (departmentId) holidayOrCondition.push({ departmentId: toObjectId(departmentId) });
        if (departmentName) {
            const deptStr = String(departmentName);
            holidayOrCondition.push({ department: { $regex: new RegExp(`^${deptStr}$|^${deptStr.toLowerCase()}$`, 'i') } });
        }

        query.$or = holidayOrCondition;

        console.log('\n--- Query for Ops User ---');
        console.log(JSON.stringify(query, null, 2));

        const results = await Holiday.find(query);
        console.log(`\nFound ${results.length} holidays.`);
        results.forEach(h => console.log(`- ${h.holidayName} (${h.department || 'Global'})`));

        // Validation
        const foundGlobal = results.find(h => h.holidayName === 'Global New Year');
        const foundHR = results.find(h => h.holidayName === 'HR Retreat');
        const foundOps = results.find(h => h.holidayName === 'Ops Training Day');

        if (foundGlobal && foundHR && foundOps) {
            console.log('✅ SUCCESS: Global, HR, and Own Dept holidays are visible.');
        } else {
            console.log('❌ FAILURE: Missing some holidays.');
            if (!foundGlobal) console.log('   Missing Global');
            if (!foundHR) console.log('   Missing HR');
            if (!foundOps) console.log('   Missing Ops');
        }

        // Cleanup
        await Holiday.deleteMany({ organizationId: orgId });
        console.log('\n🧹 Cleanup done');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

testHolidayLogic();
