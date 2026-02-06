const https = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log('Raw data:', data);
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

const http = require('http');

async function run() {
    try {
        console.log('Fetching organizations...');
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');

        if (!orgRes.data || orgRes.data.length === 0) {
            console.log('No organizations found.');
            return;
        }

        const org = orgRes.data[0];
        console.log(`Found Organization: ${org.organizationName} (${org.organizationId}) ID: ${org._id}`);

        console.log('Fetching complaints for this org...');
        // Simulate the request that GenericList makes for Admin
        const compRes = await fetch(`http://localhost:5000/api/resource/complaint?organizationId=${org._id}&view=all`);

        console.log(`Complaints found: ${compRes.data ? compRes.data.length : 0}`);
        if (compRes.data) {
            compRes.data.forEach(c => {
                console.log(`- Complaint: ${c.subject} (by ${c.employeeName})`);
            });
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
