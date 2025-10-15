"""
build_quiz_json.py

Scans the repository for `-Quiz.html` files and extracts a `const quizData = [...]` JavaScript array
from each file, then writes a single JSON file `all_quiz_data.json` mapping relative filenames to
arrays of question objects.

Usage:
    python scripts\build_quiz_json.py

This script is intentionally conservative: it uses a regex to extract the array text, then uses a
very small JS->JSON transformer to make the text valid JSON for Python's json.loads. It does not
evaluate arbitrary JS.
"""
import re
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_FILE = ROOT / 'all_quiz_data.json'

QUIZ_GLOB = '*-Quiz.html'

# Regex to find const quizData = [ ... ]; including newlines
QUIZ_RE = re.compile(r"const\s+quizData\s*=\s*(\[.*?\])\s*;", re.DOTALL)

# Simple replacer to convert JS-like object literal into JSON:
# - convert single quotes to double quotes when safe
# - wrap unquoted object keys with quotes
# - remove trailing commas
# This is not a full JS parser; it's meant for the quizData pattern used in the repo.

def js_array_to_json(js_text):
    # Remove JS-style comments
    js_text = re.sub(r"//.*?$", "", js_text, flags=re.MULTILINE)
    js_text = re.sub(r"/\*.*?\*/", "", js_text, flags=re.DOTALL)

    # Replace single quotes with double quotes, but avoid cases like apostrophes inside words
    # A conservative approach: replace '...'(where quotes wrap a string) with "..."
    js_text = re.sub(r"'(\\.|[^'])*'", lambda m: '"' + m.group(0)[1:-1].replace('"', '\\"') + '"', js_text)

    # Quote unquoted keys: match { key: or , key:  (key can be word characters or hyphen)
    js_text = re.sub(r'([,{\s])(\w+)\s*:', lambda m: f"{m.group(1)}\"{m.group(2)}\":", js_text)

    # Remove trailing commas before ] or }
    js_text = re.sub(r",\s*(\]|})", r"\1", js_text)

    return js_text


def extract_quiz_from_file(path: Path):
    text = path.read_text(encoding='utf-8')
    m = QUIZ_RE.search(text)
    if not m:
        return None
    arr_text = m.group(1)
    try:
        json_text = js_array_to_json(arr_text)
        data = json.loads(json_text)
        return data
    except Exception as e:
        print(f"Failed to parse quiz data in {path}: {e}")
        return None


def main():
    quizzes = {}
    files_scanned = 0
    for p in ROOT.glob(QUIZ_GLOB):
        files_scanned += 1
        rel = p.relative_to(ROOT).as_posix()
        data = extract_quiz_from_file(p)
        if data is None:
            print(f"No quiz data extracted from {rel}")
            continue
        quizzes[rel] = data
        print(f"Extracted {len(data)} questions from {rel}")

    if not quizzes:
        print("No quizzes found. Exiting.")
        return

    OUT_FILE.write_text(json.dumps(quizzes, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Wrote {OUT_FILE} with {sum(len(v) for v in quizzes.values())} total questions from {len(quizzes)} files scanned from {files_scanned} files.")

if __name__ == '__main__':
    main()
