// simulate_assemble.js
// Load all_quiz_data.json and run the same assembly logic used by TCOLE-Practice-Test.html
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ALL = require(path.join(ROOT, 'all_quiz_data.json'));

// distribution and fileMap are recreated inline for the simulation below
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

let assembled = [];
let shortageReport = [];
let seen = new Set();

for (const key of Object.keys(distro)) {
    const need = distro[key];
    const file = fileMap[key];
    const pool = (ALL[file] || []).slice();
    if (!pool.length) { shortageReport.push({topic:key, requested:need, available:0}); continue; }
    if (pool.length >= need) {
        assembled.push(...pickRandom(pool, need));
    } else {
        assembled.push(...pool.slice());
        shortageReport.push({topic:key, requested:need, available:pool.length});
    }
}

// dedupe by question text
assembled = assembled.filter(q => {
    const key = (q.question || q.prompt || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
});

const totalNeeded = 250;
if (assembled.length < totalNeeded) {
    const flat = Object.values(ALL).flat();
    const flatFiltered = flat.filter(q => !seen.has((q.question||q.prompt||'').trim()));
    while (assembled.length < totalNeeded && flatFiltered.length) {
        const i = Math.floor(Math.random()*flatFiltered.length);
        const q = flatFiltered.splice(i,1)[0];
        const key = (q.question||q.prompt||'').trim();
        assembled.push(q);
        seen.add(key);
    }
}

console.log('Assembled', assembled.length, 'questions');
console.log('Shortages:', shortageReport.length, 'topics with shortages');
if (shortageReport.length) console.table(shortageReport);

// Check duplicates
const dupCheck = {};
assembled.forEach(q => { const k=(q.question||q.prompt||'').trim(); dupCheck[k] = (dupCheck[k]||0)+1; });
const duplicates = Object.entries(dupCheck).filter(([k,v])=>v>1);
console.log('Duplicates found:', duplicates.length);

if (!fs.existsSync(path.join(ROOT,'build'))) fs.mkdirSync(path.join(ROOT,'build'));
fs.writeFileSync(path.join(ROOT,'build','assembled_preview.json'), JSON.stringify(assembled.slice(0,250), null, 2));
console.log('Wrote build/assembled_preview.json (first 250 shown)');
