const fetch = require('node-fetch');

async function test() {
    const studentId = '67907f16f39185ea9367e91d';
    // Test empty string
    const url = `http://localhost:5000/api/resource/student/${studentId}?organizationId=`;

    console.log(`Testing with empty organizationId at ${url}...`);

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verificationStatus: 'Verified by Ops' })
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

test();
