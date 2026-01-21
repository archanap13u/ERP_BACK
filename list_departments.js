const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        console.log('MongoDB Connected...');
        const Department = mongoose.model('Department', new mongoose.Schema({
            name: String,
            code: String,
            username: String,
            organizationId: mongoose.Schema.Types.ObjectId
        }));

        const depts = await Department.find({});
        console.log('Existing Departments:');
        depts.forEach(d => {
            console.log(`- Name: ${d.name}, Code: ${d.code}, Username: ${d.username}, Org: ${d.organizationId}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();
