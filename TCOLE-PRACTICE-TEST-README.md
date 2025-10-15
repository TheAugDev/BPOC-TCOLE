TCOLE Practice Test — README

Purpose
-------
This repository contains a deterministic build pipeline that assembles a 250-question TCOLE practice test from the project's quiz source files. The canonical artifact is produced into build/ and a distribution-ready copy is placed into dist/ for serving to the browser.

Artifacts
---------
- build/assembled_250.json — Canonical, source-of-truth artifact (250 items). Do not edit directly.
- dist/assembled_250.json — Distribution copy served to clients. Must be an exact mirror of build/assembled_250.json without code fences or extra comments.

Regeneration (deterministic)
----------------------------
Prerequisites: Node.js installed.

1. From the project root, run the proposer to analyze pools:
   node scripts/propose_filemap.js --input all_quiz_data.json --output build/proposed_filemap.json

2. Run the assembler to produce the canonical artifact:
   node scripts/assemble_with_counts.js --input all_quiz_data.json --filemap build/proposed_filemap.json --output build/assembled_250.json

3. After assembly, copy the canonical artifact to dist atomically (example on Windows PowerShell):
   Copy-Item -Path 'build/assembled_250.json' -Destination 'dist/assembled_250.json' -Force

Dedupe policy
-------------
- Selection dedupes per source during the initial deterministic selection pass (no duplicate questions from the same source file).
- A deterministic top-up refill pass allows reuse of questions only when necessary to meet per-topic quotas, preferring globally-unused items first.
- The pipeline and reorder rules are deterministic — the same inputs produce the same output.

Serving notes
-------------
Serve the repository directory over HTTP; browsers block fetch() requests to file:// URLs. For a quick local server run (Python):

python -m http.server 8000

Quality checks
--------------
Validate the distribution artifact with:
- JSON parse and length == 250.
- Optionally run a JSON linter or CI job that the project may use.

Contact
-------
If you need regen help or to change per-topic quotas, open an issue or contact the maintainer.
