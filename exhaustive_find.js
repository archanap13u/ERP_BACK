const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function find() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp');
        const id = 'EMP-6436';
        const models = ['Employee', 'Student', 'Department', 'Organization', 'SuperAdmin', 'StudyCenter'];
        const results = {};

        for (const m of models) {
            let Model;
            try {
                Model = mongoose.model(m);
            } catch (e) {
                Model = mongoose.model(m, new mongoose.Schema({}, { strict: false }));
            }

            const res = await Model.find({
                $or: [
                    { username: id },
                    { employeeId: id },
                    { code: id },
                    { email: id }
                ]
            });

            if (res.length > 0) {
                results[m] = res;
            }
        }
        fs.writeFileSync('exhaustive_results.json', JSON.stringify(results, null, 2));
        console.log('Results written to exhaustive_results.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
find();
