const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function checkAssociate() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        const d = await db.collection("designations").findOne({ title: "Associate" });
        console.log("Associate Designation:", d);

        const dept = await db.collection("departments").findOne({ _id: d.departmentId });
        console.log("Linked Department:", dept);

    } finally {
        await client.close();
    }
}

checkAssociate().catch(console.error);
