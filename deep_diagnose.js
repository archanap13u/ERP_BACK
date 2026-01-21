const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function deepDiagnose() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        console.log("--- DEPARTMENTS ---");
        const departments = await db.collection("departments").find({}).toArray();
        const validDeptIds = new Set();

        departments.forEach(d => {
            console.log(`Name: "${d.name}", ID: ${d._id}, Org: ${d.organizationId}`);
            validDeptIds.add(d._id.toString());
        });

        console.log("\n--- DESIGNATIONS ---");
        const designations = await db.collection("designations").find({}).toArray();
        let validCount = 0;
        let invalidCount = 0;

        designations.forEach(d => {
            const dDeptId = d.departmentId ? d.departmentId.toString() : "NULL";
            const isValid = validDeptIds.has(dDeptId);
            const status = isValid ? "VALID" : "INVALID/ORPHAN";

            console.log(`[${status}] Title: "${d.title}", DeptId: ${dDeptId}, Org: ${d.organizationId}`);

            if (isValid) validCount++;
            else invalidCount++;
        });

        console.log(`\nSummary: ${validCount} valid links, ${invalidCount} broken links.`);

    } finally {
        await client.close();
    }
}

deepDiagnose().catch(console.error);
