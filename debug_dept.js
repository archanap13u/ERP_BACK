const mongoose = require('mongoose');
const Department = require('./server/models/Department');
require('dotenv').config();

const checkDept = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const dept = await Department.findOne().sort({ createdAt: -1 });
        console.log('Last Department:', dept ? dept.name : 'None');
        console.log('Features:', dept ? dept.features : 'None');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDept();
