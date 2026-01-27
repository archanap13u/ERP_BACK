const mongoose = require('mongoose');
require('dotenv').config();
const Holiday = require('./server/models/Holiday');

async function checkHolidays() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const holidays = await Holiday.find({});
        console.log('--- Holidays in DB (Full Data) ---');
        holidays.forEach(h => {
            const obj = h.toObject();
            console.log(`- Holiday: ${obj.holidayName} | Dept: ${obj.department} | DeptId: ${obj.departmentId} | Org: ${obj.organizationId}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkHolidays();
