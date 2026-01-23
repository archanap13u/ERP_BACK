const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp');
        console.log('[DB] Connected');

        const Employee = mongoose.model('Employee', new mongoose.Schema({
            employeeId: String,
            username: String,
            employeeName: String
        }, { strict: false }));

        const Department = mongoose.model('Department', new mongoose.Schema({
            code: String,
            username: String,
            name: String,
            panelType: String
        }, { strict: false }));

        const emps = await Employee.find({});
        const depts = await Department.find({});

        const results = {
            employees: emps.map(e => ({
                id: e.employeeId,
                user: e.username,
                name: e.employeeName
            })),
            departments: depts.map(d => ({
                code: d.code,
                user: d.username,
                name: d.name,
                panel: d.panelType
            }))
        };

        fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
        console.log('Results written to audit_results.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
