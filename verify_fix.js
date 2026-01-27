const fetch = require('node-fetch');

async function test() {
    console.log('--- Testing API Filtering Fix ---');
    const orgId = '69786287073b3f7f959f7280';
    const empId = 'EMP-1'; // Aparna (HR)

    // This should now only return ONE result (Aparna), not the whole list starting with Amal (EMP-2)
    const url = `http://localhost:5000/api/resource/employee?employeeId=${empId}&organizationId=${orgId}`;
    console.log(`Fetching: ${url}`);

    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log('Result Count:', json.data.length);
        if (json.data.length === 1) {
            console.log('SUCCESS: Filter worked correctly. Found:', json.data[0].employeeName);
        } else {
            console.log('FAILURE: Filter returned multiple results.');
            console.log('First 2 items:', json.data.slice(0, 2).map(e => `${e.employeeName} (${e.employeeId})`));
        }
    } catch (e) {
        console.error('Error fetching API:', e.message);
    }
}

test();
