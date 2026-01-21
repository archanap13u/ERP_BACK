const mongoose = require('mongoose');

async function fixDuplicates() {
    try {
        await mongoose.connect('mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP');
        console.log('Connected to MongoDB');

        const StudyCenter = mongoose.model('StudyCenter', new mongoose.Schema({
            username: String,
            centerName: String
        }));

        const centers = await StudyCenter.find({ username: 'center1' });
        console.log(`Found ${centers.length} centers with username "center1"`);

        if (centers.length > 1) {
            for (let i = 1; i < centers.length; i++) {
                const newUsername = `center1_${i}`;
                await StudyCenter.findByIdAndUpdate(centers[i]._id, { username: newUsername });
                console.log(`Updated center ${centers[i].centerName} (${centers[i]._id}) to username: ${newUsername}`);
            }
        }

        console.log('Ensuring unique index on username...');
        try {
            // Drop existing index if it exists to ensure fresh build
            await StudyCenter.collection.dropIndex('username_1');
        } catch (e) {
            // Index might not exist
        }

        await StudyCenter.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
        console.log('Unique index created successfully!');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixDuplicates();
