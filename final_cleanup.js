const mongoose = require('mongoose');
const { models } = require('./server/models');

async function cleanData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/erpnext');
        console.log('Connected');

        const students = await models.student.find({});
        console.log(`Checking ${students.length} students`);

        let modified = 0;
        for (const s of students) {
            let update = {};
            if (s.studentId === "") update.studentId = 1;
            if (s.username === "") update.username = 1;
            if (s.email === "") update.email = 1;

            if (Object.keys(update).length > 0) {
                await models.student.updateOne({ _id: s._id }, { $unset: update });
                modified++;
            }
        }
        console.log(`Cleaned ${modified} students`);

        // Diagnostic: List unique centers in student records
        const centers = await models.student.distinct('studyCenter');
        console.log('Unique centers in DB:', centers);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

cleanData();
