const { MongoClient } = require('mongodb');

// Get from your .env normally, but using the one found in check-creds.js
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function checkDesignations() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        console.log("--- DESIGNATIONS ---");
        const designations = await db.collection("designations").find({}).toArray();
        console.log(`Found ${designations.length} designations.`);
        designations.forEach(d => {
            console.log(`Title: ${d.title}, DeptId: ${d.departmentId}, OrgId: ${d.organizationId}`);
        });

        console.log("\n--- DEPARTMENTS ---");
        const departments = await db.collection("departments").find({}).toArray();
        console.log(`Found ${departments.length} departments.`);
        departments.forEach(d => {
            console.log(`Name: ${d.name}, ID: ${d._id}`);
        });

    } finally {
        await client.close();
    }
}

checkDesignations().catch(console.error);
