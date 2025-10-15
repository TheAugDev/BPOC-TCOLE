const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'dist', 'assembled_250.json');
try {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('dist/assembled_250.json must be a JSON array. Found:', typeof data);
    process.exit(2);
  }
  if (data.length !== 250) {
    console.error(`dist/assembled_250.json must contain 250 items. Found: ${data.length}`);
    process.exit(3);
  }
  console.log('OK: dist/assembled_250.json contains', data.length, 'items');
  process.exit(0);
} catch (err) {
  console.error('Failed to validate dist/assembled_250.json:', err.message);
  process.exit(1);
}
