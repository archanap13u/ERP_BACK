const mongoose = require('mongoose');
const Department = require('./server/models/Department');

const uri = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

const listDepts = async () => {
    try {
        await mongoose.connect(uri);
        const depts = await Department.find({}, 'name features');
        console.log(JSON.stringify(depts, null, 2));
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

listDepts();
