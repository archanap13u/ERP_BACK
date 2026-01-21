const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function forceRepair() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        // Hardcode Org ID from previous findings if needed, but let's look it up
        const orgIdStr = "6969b669217b28e718e16306"; // Found in logs
        // Need to find object ID? Use finding
        const orgs = await db.collection("organizations").find({}).toArray();
        // Since we saw 'undefined' name, let's match by ID text if possible/needed, or just take the first one
        const org = orgs.find(o => o._id.toString() === orgIdStr) || orgs[0];

        console.log(`Using Org: ${org._id}`);

        const depts = await db.collection("departments").find({ organizationId: org._id }).toArray();
        console.log(`Depts found: ${depts.length}`);
        if (depts.length === 0) { console.log("No depts!"); return; }

        const targetDeptId = depts[0]._id;
        console.log(`Target Dept: ${depts[0].name} (${targetDeptId})`);

        // Update ALL designations for this org to point to this department
        const result = await db.collection("designations").updateMany(
            { organizationId: org._id },
            { $set: { departmentId: targetDeptId } }
        );

        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    } finally {
        await client.close();
    }
}

forceRepair().catch(console.error);
