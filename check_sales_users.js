const mongoose = require('mongoose');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/erpnext');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
        const Department = mongoose.model('Department', new mongoose.Schema({}, { strict: false }), 'departments');

        const salesDept = await Department.findOne({ name: 'Sales' });
        if (!salesDept) {
            console.log('Sales department not found');
            process.exit(0);
        }

        const users = await User.find({ departmentId: salesDept._id.toString() });
        console.log(`Found ${users.length} users in Sales department:`);
        users.forEach(u => {
            console.log(`- ${u.username || u.name}: Role=${u.role}, Designation=${u.designation}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUsers();
