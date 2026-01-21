const mongoose = require('mongoose');

async function checkDuplicates() {
    try {
        await mongoose.connect('mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP');
        console.log('Connected to MongoDB');

        // Use the pluralized collection name usually used by Mongoose
        const StudyCenter = mongoose.model('StudyCenter', new mongoose.Schema({
            username: String,
            centerName: String
        }));

        const dups = await StudyCenter.aggregate([
            { $group: { _id: '$username', count: { $sum: 1 }, centers: { $push: '$centerName' } } },
            { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
        ]);

        console.log('Duplicate Usernames Found:');
        console.log(JSON.stringify(dups, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDuplicates();
