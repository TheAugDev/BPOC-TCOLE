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
// Optional deterministic seed. If SEED is provided, the generator will be deterministic.
const PROVIDED_SEED = process.env.SEED || process.env.BANK_SEED || null;

// small seeded PRNG helpers (xmur3 to hash seed -> mulberry32 RNG)
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
for (let i = 0; i < BANK_COUNT; i++) {
  // create a deterministic RNG for this bank if a seed is provided
  let rng = Math.random;
  let bankSeed = null;
  if (PROVIDED_SEED) {
    bankSeed = `${PROVIDED_SEED}:${i+1}`;
    const h = xmur3(bankSeed)();
    rng = mulberry32(h);
  }
  const copy = assembled.slice();
  // use rng-aware shuffle when deterministic seed present
  if (PROVIDED_SEED) {
    for (let k = copy.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [copy[k], copy[j]] = [copy[j], copy[k]];
    }
  } else {
    shuffle(copy);
  }
  const out = copy.slice(0, 250);
  const name = `bank_${i+1}.json`;
  fs.writeFileSync(path.join(banksDir, name), JSON.stringify(out, null, 2));
  filenames.push(name);
  console.log('Wrote', `dist/banks/${name}`);
}

// write a simple manifest so the client can discover available banks instead of hard-coding a count
const manifest = { bankCount: BANK_COUNT, banks: filenames, generatedAt: (new Date()).toISOString(), seed: PROVIDED_SEED || null, bankSeeds: {} };
// if deterministic, include per-bank seeds used
if (PROVIDED_SEED) {
  for (let i = 0; i < filenames.length; i++) manifest.bankSeeds[filenames[i]] = `${PROVIDED_SEED}:${i+1}`;
}
fs.writeFileSync(path.join(banksDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Generated ${BANK_COUNT} banks in dist/banks (manifest written)`);
