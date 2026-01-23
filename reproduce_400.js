const fetch = require('node-fetch');

async function simulateApprove() {
    const studentId = '67907f16f39185ea9367e91d'; // Using one of the IDs from audit
    const orgId = '6788a101297e68fa792825c8';
    const url = `http://localhost:5000/api/resource/student/${studentId}?organizationId=${orgId}`;

    console.log(`Approving student at ${url}...`);

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

simulateApprove();
