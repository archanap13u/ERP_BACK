const mongoose = require('mongoose');
const Department = require('./server/models/Department');

const uri = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

const checkDept = async () => {
    try {
        await mongoose.connect(uri);
        // Find by name case-insensitive
        const dept = await Department.findOne({ name: { $regex: new RegExp('Development', 'i') } });
        console.log('Department:', dept ? dept.name : 'Not Found');
        console.log('Features:', dept ? JSON.stringify(dept.features) : 'None');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDept();
