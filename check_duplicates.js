const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/config/fields.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Extract keys from object
// Assuming structure is `export const fieldsConfig = { ... }` or `export default { ... }`
// But fields.ts seems to start with `export const fields` or simply export default object.
// Let's just Regex for `key: [` pattern at start of lines (indented).

const lines = content.split('\n');
const keys = [];
lines.forEach((line, index) => {
    const match = line.match(/^\s*['"]?([a-zA-Z0-9_-]+)['"]?:\s*\[/);
    if (match) {
        keys.push({ key: match[1], line: index + 1 });
    }
});

console.log('Found keys:', keys);
const duplicates = keys.filter((k, i) => keys.findIndex(x => x.key === k.key) !== i);
if (duplicates.length > 0) {
    console.log('❌ Duplicates found:', duplicates);
} else {
    console.log('✅ No duplicates found via regex.');
}
