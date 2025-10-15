const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const assembled = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'assembled_250.json'), 'utf8'));

// Generate multiple shuffled banks (deterministic seed can be added if desired)
const banksDir = path.join(ROOT, 'dist', 'banks');
if (!fs.existsSync(banksDir)) fs.mkdirSync(banksDir, { recursive: true });

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const BANK_COUNT = parseInt(process.env.BANK_COUNT || '6', 10);
const filenames = [];
for (let i = 0; i < BANK_COUNT; i++) {
  const copy = assembled.slice();
  shuffle(copy);
  const out = copy.slice(0, 250);
  const name = `bank_${i+1}.json`;
  fs.writeFileSync(path.join(banksDir, name), JSON.stringify(out, null, 2));
  filenames.push(name);
  console.log('Wrote', `dist/banks/${name}`);
}

// write a simple manifest so the client can discover available banks instead of hard-coding a count
const manifest = { bankCount: BANK_COUNT, banks: filenames };
fs.writeFileSync(path.join(banksDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Generated ${BANK_COUNT} banks in dist/banks (manifest written)`);
