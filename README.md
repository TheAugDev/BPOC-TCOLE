# BPOC-TCOLE — TCOLE Study Guides and Practice Tests

This repository contains static study guides and per-topic quiz pages for TCOLE/BPOC topics. It also includes an aggregator page (`TCOLE-Practice-Test.html`) that builds a randomized 250-question practice test from the quizzes.

Key files
- `index.html` — dashboard of study guides and quizzes.
- `*.html` — many study guide pages and corresponding `*-Quiz.html` quiz pages. Quiz pages contain a `const quizData = [...]` JavaScript array.
- `TCOLE-Practice-Test.html` — client-side aggregator; now fetches `all_quiz_data.json` (a consolidated JSON of all quizzes).

Build / regenerate consolidated JSON

A consolidated `all_quiz_data.json` is produced by scanning each `*-Quiz.html` file and extracting its `quizData` array. Two scripts are provided:

- Node-based (recommended): `scripts/build_quiz_json_node.js`
  - Usage: `node scripts/build_quiz_json_node.js`
  - This script evaluates the `quizData` array in a sandbox and writes `all_quiz_data.json` at the repository root.

- Python (conservative): `scripts/build_quiz_json.py` (kept for reference)
  - Usage: `python scripts/build_quiz_json.py`
  - This script attempts a regex-based conversion and may be less robust. Use the Node script if available.

Running locally

1. Regenerate `all_quiz_data.json` (optional if already present):

```powershell
node .\scripts\build_quiz_json_node.js
```

2. Serve the repository over HTTP so the aggregator page can fetch the JSON (browsers block file:// fetches):

```powershell
# from the repo root
python -m http.server 8000
# then open http://localhost:8000/TCOLE-Practice-Test.html
```

What to upload to GitHub
- Upload the repository root including all `.html` study/quiz pages, `scripts/`, and `TCOLE-Practice-Test.html`.
- Optional: you may add `all_quiz_data.json` to the repo if you want the aggregator to work immediately for consumers without running the build script. By default `all_quiz_data.json` is ignored in `.gitignore` because it can be regenerated; if you want to include it, remove the entry from `.gitignore` before committing.

Notes & recommendations
- The aggregator de-duplicates questions by exact question text. It does not currently detect semantic duplicates.
- If you want topics to draw from multiple quiz files, update `TCOLE-Practice-Test.html`'s `fileMap` (it can be extended to accept arrays of files per topic) and re-run the simulation script to validate.
- For reproducible fixed exams, consider creating and committing a prebuilt `build/assembled_250.json` (it will be ignored by default) or remove `build/` from `.gitignore` temporarily.

Contact
- If you'd like, I can: add multi-file topic mapping, expose a download for a prebuilt exam, or add a small server-side script to produce printable PDFs of assembled exams.
