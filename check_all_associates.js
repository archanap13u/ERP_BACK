const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function checkAllAssociates() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        const records = await db.collection("designations").find({ title: "Associate" }).toArray();
        console.log(`Found ${records.length} 'Associate' records.`);

        for (const r of records) {
            console.log(`ID: ${r._id}`);
            console.log(`Org: ${r.organizationId} (Type: ${typeof r.organizationId})`);
            console.log(`Dept: ${r.departmentId}`);
            console.log("-------------------");
        }

    } finally {
        await client.close();
    }
}

checkAllAssociates().catch(console.error);
