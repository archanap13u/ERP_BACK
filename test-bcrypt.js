const bcrypt = require('bcryptjs');

async function testBcrypt() {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log(`Generated Hash: ${hash}`);

    const isMatch = await bcrypt.compare(password, hash);
    console.log(`match? ${isMatch}`);

    const isWrong = await bcrypt.compare('wrong', hash);
    console.log(`wrong match? ${isWrong}`);
}

testBcrypt();
