const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const jsonData = JSON.parse(fs.readFileSync('full_depts_utf8.json', 'utf8')).data;
    const dbData = await db.collection('departments').find({}).toArray();

    const dbNames = dbData.map(d => d.name.toLowerCase());
    const missing = jsonData.filter(jd => !dbNames.includes(jd.name.toLowerCase()));

    console.log('Missing departments from JSON:', missing.map(m => m.name));

    const results = {
        totalInJson: jsonData.length,
        totalInDb: dbData.length,
        missing: missing
    };

    fs.writeFileSync('comparison-results.json', JSON.stringify(results, null, 2));
    console.log('Results written to comparison-results.json');
    await mongoose.disconnect();
}

run().catch(console.error);
