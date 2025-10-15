const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const src = path.join(ROOT, 'build', 'assembled_250.json');
const dest = path.join(ROOT, 'dist', 'assembled_250.json');

function fail(msg) { console.error(msg); process.exit(1); }
// Run assembler first to regenerate build/assembled_250.json
try {
  console.log('Running assembler: node scripts/assemble_with_counts.js');
  const spawn = require('child_process').spawnSync;
  const asm = spawn(process.execPath, [path.join(ROOT,'scripts','assemble_with_counts.js')], { stdio: 'inherit' });
  if (asm.status !== 0) fail('Assembler failed with exit code ' + asm.status);
} catch (e) {
  // continue if assembler can't be invoked in this environment
  console.warn('Warning: failed to run assembler automatically:', e && e.message);
}
if (!fs.existsSync(src)) fail('Source build/assembled_250.json not found. Run the assembler first.');
try {
  fs.copyFileSync(src, dest);
  console.log('Copied build/assembled_250.json -> dist/assembled_250.json');
} catch (err) { fail('Failed to copy assembled file: '+err.message); }

// run validation
try {
  const spawn = require('child_process').spawnSync;
  const res = spawn(process.execPath, [path.join(ROOT,'node_modules','npm','bin','npm-cli.js'), 'run', 'validate-dist'], { stdio: 'inherit' });
  // If npm binary isn't available like this, just run the validator directly
  if (res.status !== 0) {
    const res2 = spawn(process.execPath, [path.join(ROOT,'scripts','validate_dist.js')], { stdio: 'inherit' });
    if (res2.status !== 0) process.exit(res2.status);
  }
  process.exit(0);
} catch (err) {
  // fallback: require the validator
  try {
    require('./validate_dist.js');
    process.exit(0);
  } catch (e) {
    fail('Validation failed: '+e.message);
  }
}
