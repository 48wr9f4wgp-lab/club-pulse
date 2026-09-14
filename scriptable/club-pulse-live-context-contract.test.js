const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-live-context-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}
try{new Function(src);check('live context syntax',true)}catch(e){console.error(e);check('live context syntax',false)}
check('LIVE context uses spaced centered-dot delimiter',src.includes('`${side} ・ ${venue}`'));
check('legacy compact delimiter is removed',!src.includes('`${side}・${venue}`'));
check('Medium metaLine routes LIVE through shared context',src.includes("if(d?.mode==='LIVE')return cpLiveContext(m)"));
check('Small LIVE reuses the same shared context',src.includes('m.kickoff=cpLiveContext(m)'));
check('unknown venue falls back to side only',src.includes("venue&&venue!=='会場未定'?")&&src.includes(':side'));
check('launcher uses live context v2 cache',launcher.includes('ClubPulseLiveContextPatch_v2.js')&&launcher.includes("'livectx2'"));
check('launcher pins live context v2 immutable commit',launcher.includes('732c8a23f78d3141926e09fe90e394c62975bd25/scriptable/club-pulse-live-context-patch.js'));
if(failed){console.error(`\nLive context contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse live context v2 contract PASSED');
