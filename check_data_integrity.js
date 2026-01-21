const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function checkRelationships() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        // const org = await db.collection("organizations").findOne({});
        // Use specific org that we repaired
        const { ObjectId } = require('mongodb');
        const orgId = new ObjectId("6969b669217b28e718e16306");
        const org = await db.collection("organizations").findOne({ _id: orgId });
        console.log(`Using Organization: ${org.organizationName} (${org._id})`);

        const departments = await db.collection("departments").find({ organizationId: org._id }).toArray();
        console.log(`\nDepartments found: ${departments.length}`);
        const deptMap = {};
        departments.forEach(d => {
            console.log(`- Dept: "${d.name}" (ID: ${d._id})`);
            deptMap[d._id.toString()] = d.name;
        });

        const designations = await db.collection("designations").find({ organizationId: org._id }).toArray();
        console.log(`\nDesignations found: ${designations.length}`);

        let matchCount = 0;
        let mismatchCount = 0;

        designations.forEach(d => {
            const dDeptId = d.departmentId ? d.departmentId.toString() : 'null';
            const deptName = deptMap[dDeptId];

            if (deptName) {
                console.log(`[MATCH] Desig: "${d.title}" -> Dept: "${deptName}" (${dDeptId})`);
                matchCount++;
            } else {
                console.log(`[MISMATCH] Desig: "${d.title}" -> DeptId: ${dDeptId} (Not found in fetched departments)`);
                mismatchCount++;
            }
        });

        console.log(`\nSummary: ${matchCount} matches, ${mismatchCount} mismatches.`);

    } finally {
        await client.close();
    }
}

checkRelationships().catch(console.error);
