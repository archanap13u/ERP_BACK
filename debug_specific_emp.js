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
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        const targetId = '697b2bb594396a1fd48f9a25'; // The ID user mentioned
        // First get any org to help context (though finding by ID usually works if we dont pass wrong org)
        // Actually resource.js requires organizationId usually?
        // GET /:doctype/:id checks organizationId IF provided. If not provided, it just finds by ID.

        console.log(`Fetching Employee ${targetId} without Org Context...`);
        const res = await fetch(`http://localhost:5000/api/resource/employee/${targetId}`);

        if (res.data) {
            console.log('Record Found (No Org)!');
            console.log('Name:', res.data.employeeName);
            console.log('Org ID:', res.data.organizationId);
            console.log('Keys:', Object.keys(res.data));
        } else {
            console.log('Error/Empty (No Org):', res);
        }

        // Try to find if it exists in list
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');
        const org = orgRes.data && orgRes.data[0];
        if (org) {
            console.log(`Fetching Employee ${targetId} WITH Org Context: ${org._id}...`);
            const resOrg = await fetch(`http://localhost:5000/api/resource/employee/${targetId}?organizationId=${org._id}`);
            console.log('Result With Org:', resOrg.data ? 'Found' : 'Not Found', resOrg.error || '');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
