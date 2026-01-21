const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const SuperAdminSchema = new mongoose.Schema({
    username: String,
    email: String,
    fullName: String,
    isActive: Boolean
}, { strict: false });

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_mern');
        console.log('Connected to DB');

        const count = await SuperAdmin.countDocuments();
        console.log(`Total SuperAdmins: ${count}`);

        const admins = await SuperAdmin.find();
        admins.forEach(a => {
            console.log(`- ${a.username} (${a.email}) | Active: ${a.isActive} | HasPassword: ${!!a.password}`);
        });

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

check();
