// assemble_with_counts.js
// Reproduce the assembly used by TCOLE-Practice-Test.html but track the topic assignment for each selected question.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ALL = JSON.parse(fs.readFileSync(path.join(ROOT,'all_quiz_data.json'),'utf8'));

const distro = {
    "Professionalism-Ethics": 3,
    "Professional-Policing": 3,
    "Fitness-Wellness-Stress-Management": 2,
    "Professional-Policing-tcole-rules": 2,
    "Multiculturalism-and-Human-Relations": 4,
    "Racial-profiling": 3,
    "US-Texas-Constitution-and-Rights": 12,
    "Penal-Code": 54,
    "Code-of-Criminal-Procedure": 5,
    "Arrest-Search-Seizure": 20,
    "Asset-Forfeiture": 2,
    "Identity-Crimes": 2,
    "Consular-Notification": 1,
    "Civil-Process": 2,
    "Health-Safety-Controlled-Substances": 3,
    "Alcoholic-Beverage-Code": 2,
    "Sexual-Assault-Family-Violence": 2,
    "Missing-Exploited-Persons": 2,
    "Child-Safety-Check-Alert": 1,
    "Victims-of-Crime": 3,
    "Human-Trafficking": 2,
    "Traffic-Code-Crash-Investigation": 26,
    "Intoxicated-Driver-SFST": 4,
    "Written-Communication": 2,
    "Verbal-Communication": 5,
    "De-Escalation-Strategies": 4,
    "Force-Theory": 16,
    "Crisis-Intervention-Training": 8,
    "Traumatic-Brain-Injury": 1,
    "Arrest-and-Control": 8,
    "Criminal-Investigations": 12,
    "Juvenile-Offenders": 5,
    "Professional-Police-Driving": 3,
    "Patrol-Skills-Traffic-Stops": 6,
    "Radio-Communications-TCIC-TLETS": 3,
    "Civilian-Interaction-Training": 2,
    "Deaf-and-Hard-of-Hearing": 2,
    "Canine-Encounters": 2,
    "Emergency-Medical-Assistance": 4,
    "HazMat-ICS": 2
};

const fileMap = {
    "Professionalism-Ethics": "Professional-Policing-Quiz.html",
    "Professional-Policing": "Professional-Policing-Quiz.html",
    "Fitness-Wellness-Stress-Management": "Fitness-Wellness-Stress-Management-Quiz.html",
    "Professional-Policing-tcole-rules": "Professional-Policing-Quiz.html",
    "Multiculturalism-and-Human-Relations": "Professional-Policing-Quiz.html",
    "Racial-profiling": "Professional-Policing-Quiz.html",
    "US-Texas-Constitution-and-Rights": "Professional-Policing-Quiz.html",
    "Penal-Code": "Criminal-Investigations-Quiz.html",
    "Code-of-Criminal-Procedure": "Civil-Process-Liability-Quiz.html",
    "Arrest-Search-Seizure": "AS&S-Quiz.html",
    "Asset-Forfeiture": "Asset-Forfeiture-Quiz.html",
    "Identity-Crimes": "Identity-Crimes-Quiz.html",
    "Consular-Notification": "Consular-Notification-Quiz.html",
    "Civil-Process": "Civil-Process-Liability-Quiz.html",
    "Health-Safety-Controlled-Substances": "Health-Safety-Code-Quiz.html",
    "Alcoholic-Beverage-Code": "Alcoholic-Beverage-Code-Quiz.html",
    "Sexual-Assault-Family-Violence": "Sexual-Assault-Family-Violence-Quiz.html",
    "Missing-Exploited-Persons": "Missing-Exploited-Persons-Quiz.html",
    "Child-Safety-Check-Alert": "Child-Safety-Check-Alert-Quiz.html",
    "Victims-of-Crime": "Victims-of-Crime-Quiz.html",
    "Human-Trafficking": "Human-Trafficking-Quiz.html",
    "Traffic-Code-Crash-Investigation": "Traffic-Code-Crash-Investigation-Quiz.html",
    "Intoxicated-Driver-SFST": "Intoxicated-Driver-(SFST)-Quiz.html",
    "Written-Communication": "Written-Communication-Quiz.html",
    "Verbal-Communication": "Verbal-Communication-Quiz.html",
    "De-Escalation-Strategies": "De-Escalation-Strategies-Quiz.html",
    "Force-Theory": "Force-Theory-Quiz.html",
    "Crisis-Intervention-Training": "Crisis-Intervention-Training-Quiz.html",
    "Traumatic-Brain-Injury": "Traumatic-Brain-Injury-Quiz.html",
    "Arrest-and-Control": "Arrest-Control-Procedure-Quiz.html",
    "Criminal-Investigations": "Criminal-Investigations-Quiz.html",
    "Juvenile-Offenders": "Juvenile-Offenders-Quiz.html",
    "Professional-Police-Driving": "Professional-Policing-Quiz.html",
    "Patrol-Skills-Traffic-Stops": "Traffic-Code-Crash-Investigation-Quiz.html",
    "Radio-Communications-TCIC-TLETS": "Professional-Policing-Quiz.html",
    "Civilian-Interaction-Training": "Professional-Policing-Quiz.html",
    "Deaf-and-Hard-of-Hearing": "Introductory-Spanish-Quiz.html",
    "Canine-Encounters": "Professional-Policing-Quiz.html",
    "Emergency-Medical-Assistance": "Health-Safety-Code-Quiz.html",
    "HazMat-ICS": "Health-Safety-Code-Quiz.html"
};

function pickRandom(arr, n) {
    const copy = arr.slice();
    const out = [];
    while (out.length < n && copy.length) {
        const i = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(i,1)[0]);
    }
    return out;
}

// Step 1: select per-topic pools and track assignments
let assigned = []; // {questionText, qObj, topic}
let shortageReport = [];
const pools = {};
// For each topic, combine mapped files into a pool and pick requested number (or all if shortage)
for (const topic of Object.keys(distro)) {
    const need = distro[topic];
    const mapped = fileMap[topic];
    if (!mapped) {
        console.warn('no mapping for', topic);
        pools[topic] = [];
        shortageReport.push({topic, requested: need, available: 0});
        continue;
    }
    const files = Array.isArray(mapped) ? mapped : [mapped];
    const combined = [];
    for (const f of files) {
        const arr = ALL[f];
        if (!arr) { console.warn('no data for', f); continue; }
        combined.push(...arr.map(q => ({...q, __source: f})));
    }
    pools[topic] = combined;
    if (!combined.length) {
        shortageReport.push({topic, requested: need, available: 0});
        continue;
    }
    if (combined.length >= need) {
        const picked = pickRandom(combined.slice(), need);
        picked.forEach(q => assigned.push({text: (q.question||q.prompt||'').trim(), q, topic}));
    } else {
        combined.forEach(q => assigned.push({text: (q.question||q.prompt||'').trim(), q, topic}));
        shortageReport.push({topic, requested: need, available: combined.length});
    }
}

// Step 2: deduplicate by keeping first occurrence of a question text
const finalAssigned = [];
const removedFromTopic = {}; // topic->count removed
// dedupe only within the same source file (__source)
const seenBySource = {};
for (const a of assigned) {
    if (!a.text) continue;
    const src = (a.q && a.q.__source) || '__unknown__';
    seenBySource[src] = seenBySource[src] || new Set();
    if (seenBySource[src].has(a.text)) {
        removedFromTopic[a.topic] = (removedFromTopic[a.topic]||0)+1;
        continue; // drop duplicate from same file
    }
    seenBySource[src].add(a.text);
    finalAssigned.push(a);
}

// Step3: fill remaining from global pool (non-duplicate questions)
const flat = Object.values(ALL).flat();
// build flatFiltered honoring per-source dedupe: filter out items whose text appears in the same source seenBySource sets
const globalSeen = new Set(finalAssigned.map(a=>a.text));
const flatWithSource = [];
for (const fname of Object.keys(ALL)) {
    const arr = ALL[fname] || [];
    for (const q of arr) {
        const text = (q.question||q.prompt||'').trim();
        if (!text) continue;
        // if already globally used, skip
        if (globalSeen.has(text)) continue;
        // if this source already used this text (unlikely since we filtered earlier), skip
        flatWithSource.push({...q, __source: fname});
    }
}
const flatFiltered = flatWithSource;
const totalNeeded = 250;
while (finalAssigned.length < totalNeeded && flatFiltered.length) {
    const i = Math.floor(Math.random()*flatFiltered.length);
    const q = flatFiltered.splice(i,1)[0];
    finalAssigned.push({text:(q.question||q.prompt||'').trim(), q, topic: '__fill__'});
    globalSeen.add((q.question||q.prompt||'').trim());
}

// Step3b: try to top-up any topics that remain short by selecting from their pools
// Allow duplicates if necessary (prefer unique texts first, then allow reuse)
const shortTopics = [];
// compute current counts from finalAssigned (we haven't computed 'counts' yet)
const countsCurrent = {};
for (const a of finalAssigned) { countsCurrent[a.topic] = (countsCurrent[a.topic]||0)+1; }
for (const topic of Object.keys(distro)) {
    const have = countsCurrent[topic] || 0;
    const want = distro[topic];
    if (want > have) shortTopics.push({topic, need: want - have});
}
if (shortTopics.length) {
    // Build an index of what texts are already used per topic to avoid exact repeats within the same topic
    const usedTextPerTopic = {};
    for (const a of finalAssigned) {
        usedTextPerTopic[a.topic] = usedTextPerTopic[a.topic] || new Set();
        usedTextPerTopic[a.topic].add(a.text);
    }

    for (const s of shortTopics) {
        const topic = s.topic;
        let need = s.need;
        const pool = pools[topic] || [];
        if (!pool.length) continue;

        // candidates not yet used in this topic
        const candidates = pool.map(q=>({q, text:(q.question||q.prompt||'').trim(), src:q.__source})).filter(c=>c.text);

        // 1) prefer candidates whose text is not globally used
        let preferred = candidates.filter(c=>!globalSeen.has(c.text) && !(usedTextPerTopic[topic] && usedTextPerTopic[topic].has(c.text)));
        // 2) then candidates whose text is globally used but not yet used for this topic
        let second = candidates.filter(c=>globalSeen.has(c.text) && !(usedTextPerTopic[topic] && usedTextPerTopic[topic].has(c.text)));
        // 3) finally any candidates not already selected as the exact same object for this topic
        let third = candidates.filter(c=>!(usedTextPerTopic[topic] && usedTextPerTopic[topic].has(c.text)));

        const pickFrom = (arr, n) => {
            const copy = arr.slice();
            const out = [];
            while (out.length < n && copy.length) {
                const i = Math.floor(Math.random()*copy.length);
                out.push(copy.splice(i,1)[0]);
            }
            return out;
        };

        // select in stages
        let picked = pickFrom(preferred, need);
        need -= picked.length;
        if (need > 0) {
            const p2 = pickFrom(second.filter(c=>!picked.includes(c)), need);
            picked.push(...p2);
            need -= p2.length;
        }
        if (need > 0) {
            const p3 = pickFrom(third.filter(c=>!picked.includes(c)), need);
            picked.push(...p3);
            need -= p3.length;
        }

        // If still need, allow reuse of texts already used in this topic (as a last resort)
        if (need > 0) {
            const fallback = candidates.filter(c=>true); // any
            const p4 = pickFrom(fallback.filter(c=>!picked.includes(c)), need);
            picked.push(...p4);
            need -= p4.length;
        }

        // append picked into finalAssigned with the proper topic
        for (const p of picked) {
            finalAssigned.push({text: p.text, q: {...p.q, __source: p.src}, topic});
            // update bookkeeping
            usedTextPerTopic[topic] = usedTextPerTopic[topic] || new Set();
            usedTextPerTopic[topic].add(p.text);
            globalSeen.add(p.text);
        }
    }
}

// Step4: final shuffle
for (let i = finalAssigned.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [finalAssigned[i],finalAssigned[j]]=[finalAssigned[j],finalAssigned[i]]; }

// Count per-topic
const counts = {};
for (const a of finalAssigned) { counts[a.topic] = (counts[a.topic]||0)+1; }

console.log('Requested vs Actual counts (topics with >0 requested):');
for (const topic of Object.keys(distro)) {
    console.log(topic.padEnd(45), ' requested:', String(distro[topic]).padStart(3), ' actual:', String(counts[topic]||0).padStart(3));
}
console.log('\nFiller questions (not assigned to a requested topic):', counts['__fill__']||0);
console.log('\nShortage report (initial):');
console.table(shortageReport);
console.log('\nRemoved duplicates during dedupe (counts per topic):');
console.table(removedFromTopic);

// Write a diagnostic copy
if (!fs.existsSync(path.join(ROOT,'build'))) fs.mkdirSync(path.join(ROOT,'build'));
fs.writeFileSync(path.join(ROOT,'build','assembled_with_topic_assignments.json'), JSON.stringify(finalAssigned.map(a=>({topic:a.topic,question:a.text})), null, 2));
console.log('Wrote build/assembled_with_topic_assignments.json');
// Also write a frozen assembled 250-question JSON (questions with sources and topic assignments)
const frozen = finalAssigned.slice(0, totalNeeded).map(a=>({topic:a.topic, question: a.text, source: a.q && a.q.__source, raw: a.q}));
fs.writeFileSync(path.join(ROOT,'build','assembled_250.json'), JSON.stringify(frozen, null, 2));
console.log('Wrote build/assembled_250.json');
