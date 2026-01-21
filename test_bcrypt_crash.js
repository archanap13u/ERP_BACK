const bcrypt = require('bcryptjs');

async function test() {
    try {
        console.log('Testing with undefined hash...');
        await bcrypt.compare('password', undefined);
        console.log('Did not throw');
    } catch (e) {
        console.log('CAUGHT:', e.message);
    }

    try {
        console.log('Testing with null hash...');
        await bcrypt.compare('password', null);
        console.log('Did not throw');
    } catch (e) {
        console.log('CAUGHT:', e.message);
    }
}

test();
