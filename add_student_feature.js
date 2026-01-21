const mongoose = require('mongoose');
const { models } = require('./server/models');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const res = await models.department.updateMany(
            { panelType: 'Finance' },
            { $addToSet: { features: 'STUDENTS' } }
        );
        console.log('Updated ' + res.modifiedCount + ' finance departments.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
});
