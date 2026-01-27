const mongoose = require('mongoose');
require('dotenv').config();

async function checkSchema() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Explicitly load server model
        const Program = require('./server/models/Program');
        const uPath = Program.schema.path('university');
        if (uPath) {
            console.log('UNIVERSITY_INSTANCE:' + uPath.instance);
            console.log('UNIVERSITY_OPTIONS:' + JSON.stringify(uPath.options));
        } else {
            console.log('UNIVERSITY_NOT_FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();
