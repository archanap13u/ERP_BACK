const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function checkSuperAdmin() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        const admins = await db.collection("superadmins").find({}).toArray();
        admins.forEach(a => {
            console.log(`User: ${a.username}`);
            console.log(`Pass: ${a.password}`);
            console.log(`Is Bcrypt? ${a.password.startsWith('$2')}`);
        });

    } finally {
        await client.close();
    }
}

checkSuperAdmin().catch(console.error);
