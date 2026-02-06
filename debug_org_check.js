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
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');
        const systemGenericOrg = orgRes.data && orgRes.data[0];
        const sysOrgId = systemGenericOrg ? systemGenericOrg._id : 'NONE';

        console.log(`SYSTEM ORG ID: ${sysOrgId}`);

        // Fetch employees using the system org (just to find them)
        console.log('Fetching Latest Employee...');
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${sysOrgId}`);

        if (empRes.data && empRes.data.length > 0) {
            const latest = empRes.data[0];
            const old = empRes.data[empRes.data.length - 1];

            console.log('--- LATEST EMPLOYEE ---');
            console.log(`ID: ${latest._id}`);
            console.log(`Name: ${latest.employeeName}`);
            console.log(`OrgID: ${latest.organizationId}`);
            console.log(`MATCHES SYSTEM? ${latest.organizationId === sysOrgId ? 'YES' : 'NO'}`);

            console.log('--- OLD EMPLOYEE ---');
            console.log(`ID: ${old._id}`);
            console.log(`Name: ${old.employeeName}`);
            console.log(`OrgID: ${old.organizationId}`);
            console.log(`MATCHES SYSTEM? ${old.organizationId === sysOrgId ? 'YES' : 'NO'}`);
        } else {
            console.log('No employees found.');
        }

    } catch (e) { console.error(e); }
}
run();
