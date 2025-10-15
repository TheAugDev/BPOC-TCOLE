// build_quiz_json_node.js
// Scans *-Quiz.html files and extracts `const quizData = [...]` blocks, evaluates them in a sandbox,
// and writes a single all_quiz_data.json with mapping from relative filename -> array of question objects.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'all_quiz_data.json');

function findQuizFiles() {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('-Quiz.html'));
  return files;
}

const QUIZ_RE = /const\s+quizData\s*=\s*(\[[\s\S]*?\])\s*;/m;

function extractAndEval(content, file) {
  const m = content.match(QUIZ_RE);
  if (!m) return null;
  const arrText = m[1];
  // Evaluate in a VM sandbox
  const sandbox = {};
  try {
    vm.createContext(sandbox);
    // Build script that assigns to quizData
    const script = 'quizData = ' + arrText + ';';
    vm.runInContext(script, sandbox, {timeout: 1000});
    return sandbox.quizData;
  } catch (err) {
    console.error(`Failed to evaluate quizData in ${file}: ${err.message}`);
    return null;
  }
}

function main() {
  const files = findQuizFiles();
  if (files.length === 0) {
    console.error('No *-Quiz.html files found in workspace root.');
    process.exit(1);
  }

  const results = {};
  let total = 0;

  for (const f of files) {
    const full = path.join(ROOT, f);
    const text = fs.readFileSync(full, 'utf8');
    const data = extractAndEval(text, f);
    if (!data) {
      console.warn(`No quiz data extracted from ${f}`);
      continue;
    }
    results[f] = data;
    total += Array.isArray(data) ? data.length : 0;
    console.log(`Extracted ${Array.isArray(data) ? data.length : 0} questions from ${f}`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Wrote ${OUT_FILE} with ${total} questions from ${Object.keys(results).length} files.`);
}

main();
