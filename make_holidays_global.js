const mongoose = require('mongoose');
require('dotenv').config();
const Holiday = require('./server/models/Holiday');

async function makeGlobal() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await Holiday.updateMany(
            { department: { $ne: 'All' } },
            { $set: { department: 'All' } }
        );
        console.log(`Updated ${result.modifiedCount} holidays to be global.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
makeGlobal();
