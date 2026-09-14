const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
const check=(n,ok)=>{if(ok)console.log(`✓ ${n}`);else{console.error(`✗ ${n}`);failed++}};
const start=src.indexOf('async function getRemote');
const end=src.indexOf('\nlet c=await core()',start);
const fn=src.slice(start,end);
check('getRemote exists',start>=0&&end>start);
check('local patch cache is checked before Request',fn.indexOf('F.fileExists(file)')>=0&&fn.indexOf('F.fileExists(file)')<fn.indexOf('new Request'));
check('local patch cache validates minimum length',fn.includes('s&&s.length>=min'));
check('patch fetch URL uses stable version tag',fn.includes("url+'?v='+tag"));
check('patch fetch no longer cache-busts every widget render',!fn.includes('Date.now()'));
check('network failure still falls back to local copy',fn.includes('if(F.fileExists(file))return F.readString(file)'));
check('core URL is immutable commit-pinned',src.includes("const CORE='https://raw.githubusercontent.com/48wr9f4wgp-lab/motorsport-hub/30a2b7f1b5c58d4ffa7e91047b637692c3cac7ce/scriptable/club-pulse-core.js'"));
check('core cache uses versioned v2 file',src.includes("ClubPulseCore_v2.js")&&src.includes("CORE+'?v=core2'"));
check('mutable branch core URL is absent',!src.includes('motorsport-hub/club-pulse-runtime/scriptable/club-pulse-core.js'));
if(failed){console.error(`\nLoader efficiency QA FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse immutable local-first loader QA PASSED');
