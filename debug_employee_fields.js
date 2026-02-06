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
        // First get org id
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');
        const org = orgRes.data && orgRes.data[0];

        if (!org) {
            console.log('No org found');
            return;
        }

        console.log('Fetching employees for org:', org._id);
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${org._id}`);

        if (empRes.data && empRes.data.length > 0) {
            const emp = empRes.data[0];
            console.log('Employee Data Keys:', Object.keys(emp));
            console.log('Name:', emp.employeeName);
            console.log('ID:', emp.employeeId);
            console.log('Username:', emp.username);
            console.log('Password:', emp.password); // Checking if it exists
        } else {
            console.log('No employees found');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
