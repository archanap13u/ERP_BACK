const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    // Start of response might help if not JSON
                    console.log('Non-JSON response:', data.substring(0, 50));
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');
        const org = orgRes.data && orgRes.data[0];
        if (!org) { console.log('No org'); return; }
        const orgId = org._id;
        console.log(`Using Org ID: ${orgId}`);

        console.log('Fetching ALL employees (to find latest)...');
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${orgId}`);

        if (!empRes.data || empRes.data.length === 0) {
            console.log('No employees found.');
            return;
        }

        // Assuming API sends sorted, but let's find the one created LAST (max creation date/id?)
        // Or just taking 0 if API default sort is new->old
        const latest = empRes.data[0];
        console.log(`Latest Employee: ${latest.employeeName} (${latest._id})`);
        console.log(`Latest Emp OrgId: ${latest.organizationId}`);

        // Check verification status?
        const checkUrl = `http://localhost:5000/api/resource/employee/${latest._id}?organizationId=${orgId}`;
        console.log(`Simulating GenericEdit Fetch: GET ${checkUrl}`);

        const singleRes = await fetch(checkUrl);
        if (singleRes.data) {
            console.log('SUCCESS: Record fetched correctly.');
        } else {
            console.log('FAILURE: Record returned empty or error.', singleRes);
        }

        // Compare with an older one if available
        if (empRes.data.length > 1) {
            const old = empRes.data[empRes.data.length - 1]; // Oldest
            console.log(`Old Employee: ${old.employeeName} (${old._id})`);
            console.log(`Old Emp OrgId: ${old.organizationId}`);
            const oldCheckUrl = `http://localhost:5000/api/resource/employee/${old._id}?organizationId=${orgId}`;
            const oldRes = await fetch(oldCheckUrl);
            console.log(`Old Fetch Status: ${oldRes.data ? 'SUCCESS' : 'FAIL'}`);
        }

    } catch (e) { console.error(e); }
}
run();
