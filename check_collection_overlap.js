const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function checkOverlap() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        console.log('Checking Employees collection for student-like fields...');
        const employeesWithStudentFields = await db.collection("employees").find({
            $or: [
                { studentName: { $exists: true } },
                { rollNumber: { $exists: true } },
                { program: { $exists: true } }
            ]
        }).toArray();

        console.log(`Found ${employeesWithStudentFields.length} employees with student fields.`);
        if (employeesWithStudentFields.length > 0) {
            console.log('Sample overlap record:', JSON.stringify(employeesWithStudentFields[0], null, 2));
        }

        console.log('\nChecking Students collection...');
        const totalStudents = await db.collection("students").countDocuments();
        console.log(`Total records in students collection: ${totalStudents}`);

        // Check if any student matches the center dashboard additions
        const recentStudents = await db.collection("students").find().sort({ createdAt: -1 }).limit(5).toArray();
        console.log('Recent students:', recentStudents.map(s => ({ name: s.studentName, center: s.studyCenter, email: s.email })));

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

checkOverlap().catch(console.error);
