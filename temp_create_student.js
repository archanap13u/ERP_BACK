
const http = require('http');

const data = JSON.stringify({
    studentName: "Debug Student Node",
    email: "debugnode@test.com",
    organizationId: "65f2a1b3c8e1a2b3c4d5e6f7", // Dummy valid ObjectId
    studyCenter: "Debug Center Node",
    verificationStatus: "Pending"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resource/student',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log("Response:", body);
    });
});

req.on('error', (error) => {
    console.error("Error:", error);
});

req.write(data);
req.end();

// Add GET check after short delay
setTimeout(() => {
    const getOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/resource/student',
        method: 'GET'
    };
    const reqGet = http.request(getOptions, (res) => {
        console.log(`GET StatusCode: ${res.statusCode}`);
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
            console.log("GET Response:", body);
        });
    });
    reqGet.end();
}, 2000);
