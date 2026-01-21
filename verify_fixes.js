const mongoose = require('mongoose');
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api';
const ORG_ID_1 = '678d10f8a7e2f56789012345'; // Example ID
const ORG_ID_2 = '678d10f8a7e2f56789012346'; // Example ID

async function verify() {
    console.log('--- Starting Verification ---');

    try {
        // 1. Verify Department Fetching (Dropdown fix)
        // We simulate a request to fetch departments with organizationId but WITH departmentId (which should be ignored now)
        console.log('\n1. Verifying Department Fetching...');
        const deptRes = await axios.get(`${BACKEND_URL}/resource/department`, {
            params: {
                organizationId: ORG_ID_1,
                departmentId: 'some-other-dept-id' // This would have caused 0 results before the fix
            }
        });
        console.log(`- Department Fetch Result Count: ${deptRes.data.data.length}`);
        console.log('  (Should return all departments for the organization regardless of departmentId filter)');

        // 2. Verify Multi-Tenant Employee Creation
        console.log('\n2. Verifying Multi-Tenant Employee Isolation...');
        const empId = 'TEST-EMP-001';

        // Create employee in Org 1
        console.log(`- Creating employee ${empId} in Org 1...`);
        try {
            await axios.post(`${BACKEND_URL}/resource/employee`, {
                employeeId: empId,
                employeeName: 'Org 1 Employee',
                designation: 'Staff',
                department: 'HR',
                organizationId: ORG_ID_1
            });
            console.log('  Success!');
        } catch (e) {
            console.log(`  Failed: ${e.response?.data?.error || e.message}`);
        }

        // Create employee with SAME ID in Org 2 (Should now succeed)
        console.log(`- Creating employee ${empId} in Org 2...`);
        try {
            await axios.post(`${BACKEND_URL}/resource/employee`, {
                employeeId: empId,
                employeeName: 'Org 2 Employee',
                designation: 'Staff',
                department: 'HR',
                organizationId: ORG_ID_2
            });
            console.log('  Success! (Multi-tenant verified)');
        } catch (e) {
            console.log(`  Failed: ${e.response?.data?.error || e.message}`);
        }

        // 3. Verify Same-Org Uniqueness
        console.log('\n3. Verifying Same-Org Uniqueness...');
        try {
            await axios.post(`${BACKEND_URL}/resource/employee`, {
                employeeId: empId,
                employeeName: 'Another Org 1 Employee',
                designation: 'Staff',
                department: 'HR',
                organizationId: ORG_ID_1
            });
            console.log('  Failed: Should have been blocked (Unexpected success)');
        } catch (e) {
            console.log(`  Success: Properly blocked same-org duplicate (${e.response?.data?.error || e.message})`);
        }

    } catch (error) {
        console.error('Verification encountered an error:', error.message);
    }
}

verify();
