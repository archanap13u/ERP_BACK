const mongoose = require('mongoose');
const { models } = require('./server/models');
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

mongoose.connect(uri).then(async () => {
    try {
        const students = await models.student.find({}, 'studentName verificationStatus organizationId department departmentId');
        console.log("Found " + students.length + " students.");
        console.log(JSON.stringify(students, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
});
