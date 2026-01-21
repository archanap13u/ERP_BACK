const mongoose = require('mongoose');
require('dotenv').config();

// We'll try to load the Holiday model directly to avoid complex model index issues in a script
const HolidaySchema = new mongoose.Schema({}, { strict: false, collection: 'holidays' });
const Holiday = mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);

async function checkHolidays() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const holidays = await Holiday.find().lean();
        console.log(`Total Holidays: ${holidays.length}`);

        holidays.forEach(h => {
            console.log(`- Holiday: ${h.holidayName || h.holiday_name}, OrgId: ${h.organizationId}, DeptId: ${h.departmentId}, DeptName: ${h.department}`);
        });

        const orphans = holidays.filter(h => !h.organizationId);
        console.log(`Orphans (no organizationId): ${orphans.length}`);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkHolidays();
