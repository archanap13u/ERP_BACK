const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function diagnoseStudents() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        console.log('--- Students Data ---');
        const students = await db.collection("students").find({}).toArray();
        console.log(`Total students: ${students.length}`);

        students.forEach(s => {
            console.log(`Name: ${s.studentName}, Center: ${s.studyCenter || 'NULL'}, Org: ${s.organizationId}, Dept: ${s.departmentId || 'NULL'}`);
        });

        console.log('\n--- Study Centers Data ---');
        const centers = await db.collection("studycenters").find({}).toArray();
        centers.forEach(c => {
            console.log(`Center Name: ${c.centerName}, ID: ${c._id}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

diagnoseStudents().catch(console.error);
