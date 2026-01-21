const { MongoClient, ObjectId } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function forceRepairTargeted() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        const targetOrgIdStr = "6969b669217b28e718e16306";
        const targetOrgIdObj = new ObjectId(targetOrgIdStr);

        console.log(`Targeting Org: ${targetOrgIdStr}`);

        // Find Dept
        const depts = await db.collection("departments").find({
            $or: [{ organizationId: targetOrgIdObj }, { organizationId: targetOrgIdStr }]
        }).toArray();

        console.log(`Depts found: ${depts.length}`);
        if (depts.length === 0) { console.log("No depts!"); return; }

        const validDeptId = depts[0]._id;
        console.log(`Using Valid Dept: ${depts[0].name} (${validDeptId})`);

        // Find Designations to Fix
        const query = {
            $or: [{ organizationId: targetOrgIdObj }, { organizationId: targetOrgIdStr }]
        };
        const count = await db.collection("designations").countDocuments(query);
        console.log(`Designations to update: ${count}`);

        const result = await db.collection("designations").updateMany(
            query,
            { $set: { departmentId: validDeptId } }
        );

        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    } finally {
        await client.close();
    }
}

forceRepairTargeted().catch(console.error);
