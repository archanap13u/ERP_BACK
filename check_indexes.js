require('dotenv').config();
const mongoose = require('mongoose');

const checkIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const deptCollection = collections.find(c => c.name === 'departments');

        if (deptCollection) {
            const indexes = await mongoose.connection.db.collection('departments').indexes();
            const fs = require('fs');
            fs.writeFileSync('index_debug.json', JSON.stringify(indexes, null, 2));
            console.log('Indexes written to index_debug.json');
        } else {
            console.log('Collection "departments" not found.');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkIndexes();
