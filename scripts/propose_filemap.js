// propose_filemap.js
// Scans all_quiz_data.json and suggests arrays of files per topic by keyword matching.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ALL = JSON.parse(fs.readFileSync(path.join(ROOT,'all_quiz_data.json'),'utf8'));

// Topics and simple keywords to match. These should mirror the distro keys used by the assembler.
const topics = {
    "Professionalism-Ethics": ["professionalism","ethic","ethics","conduct"],
    "Professional-Policing": ["policing","police","officer","patrol"],
    "Fitness-Wellness-Stress-Management": ["fitness","wellness","stress","health"],
    "Multiculturalism-and-Human-Relations": ["multicultural","culture","diversity","human relations","human-relations"],
    "Racial-profiling": ["racial","profiling","race"],
    "US-Texas-Constitution-and-Rights": ["constitution","rights","amendment","texas constitution"],
    "Penal-Code": ["penal","penal code","criminal code","penalty","felony","misdemeanor"],
    "Code-of-Criminal-Procedure": ["code of criminal procedure","ccp","criminal procedure"],
    "Arrest-Search-Seizure": ["arrest","search","seizure","warrant"],
    "Asset-Forfeiture": ["forfeiture","asset","assets"],
    "Identity-Crimes": ["identity","fraud","identity theft","imperson"],
    "Consular-Notification": ["consular","notification","consulate"],
    "Civil-Process": ["civil process","subpoena","service of process"],
    "Health-Safety-Controlled-Substances": ["controlled substance","drug","narcotic","drug test"],
    "Alcoholic-Beverage-Code": ["alcohol","beverage","abc","intoxication"],
    "Sexual-Assault-Family-Violence": ["sexual assault","family violence","safv","assault"],
    "Missing-Exploited-Persons": ["missing","exploited","mep"],
    "Child-Safety-Check-Alert": ["child safety","safety check","check alert"],
    "Victims-of-Crime": ["victim","victims","victim of crime"],
    "Human-Trafficking": ["human trafficking","traffick"],
    "Traffic-Code-Crash-Investigation": ["traffic","crash","collision","accident","investigation"],
    "Intoxicated-Driver-SFST": ["sfst","field sobriety","intoxicated driver","dui","dwi"],
    "Written-Communication": ["written communication","writing","report writing","report"],
    "Verbal-Communication": ["verbal communication","verbal","radio","call for service"],
    "De-Escalation-Strategies": ["de-escalation","deescal","de escalate","verbal judo"],
    "Force-Theory": ["force","use of force","force theory","level of force"],
    "Crisis-Intervention-Training": ["crisis intervention","cit","mental health","counseling"],
    "Traumatic-Brain-Injury": ["brain injury","traumatic brain","tbi"],
    "Arrest-and-Control": ["arrest control","control procedure","control hold"],
    "Criminal-Investigations": ["investigation","criminal investigation","evidence","forensic","case file"],
    "Juvenile-Offenders": ["juvenile","youth offender","juvenile justice"],
    "Professional-Police-Driving": ["driving","vehicle pursuit","pursuit","police driving"],
    "Patrol-Skills-Traffic-Stops": ["traffic stop","stop","citation","traffic stop"],
    "Radio-Communications-TCIC-TLETS": ["tcic","tlets","radio","communications","txdot"],
    "Civilian-Interaction-Training": ["civilian interaction","community","interaction training","community relations"],
    "Deaf-and-Hard-of-Hearing": ["deaf","hard of hearing","sign language"],
    "Canine-Encounters": ["canine","k9","dog encounter","canine encounter"],
    "Emergency-Medical-Assistance": ["emergency medical","first aid","ems","medical assistance"],
    "HazMat-ICS": ["hazmat","ics","incident command","hazardous material"]
};

function normalize(s){return (s||'').toLowerCase();}

const fileNames = Object.keys(ALL);
const suggestions = {};
for (const topic of Object.keys(topics)) {
    const kws = topics[topic];
    const scores = {}; // filename -> score
    for (const f of fileNames) scores[f]=0;
    for (const f of fileNames) {
        const arr = ALL[f];
        for (const q of arr) {
            const text = normalize((q.question||q.prompt||'') + ' ' + (q.options||[]).join(' '));
            for (const kw of kws) {
                if (text.indexOf(kw) !== -1) scores[f] += 1;
            }
        }
    }
    // pick files with >0 score, sort by score desc, return top 6 (arbitrary cap)
    const picks = Object.entries(scores).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]).map(e=>e[0]).slice(0,6);
    suggestions[topic] = picks;
}

if (!fs.existsSync(path.join(ROOT,'build'))) fs.mkdirSync(path.join(ROOT,'build'));
fs.writeFileSync(path.join(ROOT,'build','proposed_filemap.json'), JSON.stringify(suggestions,null,2));
console.log('Wrote build/proposed_filemap.json');
// Print a short human summary
for (const t of Object.keys(suggestions)){
    console.log(t.padEnd(45), ' -> ', suggestions[t].slice(0,3).join(', ') || '(no hits)');
}
