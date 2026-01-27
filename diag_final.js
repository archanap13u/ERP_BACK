const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const Program = require('./server/models/Program');
    console.log('INSTANCE:' + Program.schema.path('university').instance);
    process.exit(0);
})();
