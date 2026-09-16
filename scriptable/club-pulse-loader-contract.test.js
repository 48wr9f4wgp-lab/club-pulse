const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-loader.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}
check('loader targets dedicated club-pulse repository',src.includes('48wr9f4wgp-lab/club-pulse/club-pulse-runtime/scriptable/club-pulse.js'));
check('loader no longer targets motorsport-hub',!src.includes('48wr9f4wgp-lab/motorsport-hub'));
check('loader cache remains local fallback only',src.includes("ClubPulseRuntime.js")&&src.includes('if(!F.fileExists(P))throw e'));
check('in-app QA preserves selected club',src.includes("const baseClub=(p.split(':')[0]||'manutd')")&&src.includes("p=baseClub+(m==='auto'?'':':'+m)"));
if(failed){console.error(`\nClub Pulse loader contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse loader contract PASSED');
