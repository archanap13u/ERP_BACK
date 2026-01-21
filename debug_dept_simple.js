const mongoose = require('mongoose');
const Department = require('./server/models/Department');

const uri = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

const checkDept = async () => {
    try {
        await mongoose.connect(uri);
        const dept = await Department.findOne().sort({ createdAt: -1 });
        console.log('Last Department:', dept ? dept.name : 'None');
        console.log('Features:', dept ? JSON.stringify(dept.features) : 'None');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDept();
