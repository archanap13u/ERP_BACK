const mongoose = require('mongoose');
const Announcement = require('./server/models/Announcement');

const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function test() {
    try {
        console.log('Connecting...');
        await mongoose.connect(uri);
        console.log('Connected');

        console.log('Testing Announcement creation...');
        const a = new Announcement({
            title: 'Test Auto',
            content: 'Test Content',
            organizationId: 'org_debug_1',
            type: 'Announcement',
            priority: 'Medium'
        });
        await a.save();
        console.log('Success: Saved Announcement');

        console.log('Testing Poll creation...');
        const p = new Announcement({
            title: 'Poll Test Auto',
            content: 'Poll Content',
            organizationId: 'org_debug_1',
            type: 'Poll',
            poll_options_text: 'Option 1\nOption 2'
        });
        await p.save();
        console.log('Success: Saved Poll');

    } catch (e) {
        console.error('ERROR:', e);
        const fs = require('fs');
        fs.writeFileSync('error_log.txt', e.toString() + '\n' + (e.stack || ''));
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}
test();
