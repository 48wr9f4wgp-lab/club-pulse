const fs=require('fs');
const path=require('path');
const root=__dirname;
const launcher=fs.readFileSync(path.join(root,'club-pulse.js'),'utf8');
const patch=fs.readFileSync(path.join(root,'club-pulse-provider-reliability-patch.js'),'utf8');
const previous=fs.readFileSync(path.join(root,'club-pulse-previous-result-patch.js'),'utf8');
let failed=0;const check=(n,ok)=>{if(ok)console.log(`✓ ${n}`);else{console.error(`✗ ${n}`);failed++}};
try{new Function(`return (async()=>{\n${patch}\n})`);check('provider reliability syntax',true)}catch(e){console.error(e.message);check('provider reliability syntax',false)}
check('launcher pins provider reliability v2 immutably',launcher.includes('3ef4c2fdbd21d4edfa3b352a91f2d92ac0d521f7/scriptable/club-pulse-provider-reliability-patch.js'));
check('launcher uses dedicated provider reliability v2 cache',launcher.includes('ClubPulseProviderReliabilityPatch_v2.js')&&launcher.includes("'provider-reliability2'"));
check('provider reliability loads after data policy',launcher.includes("+r+'\\n'+dp+'\\n'+prov+'\\n'+sp"));
check('provider reliability owns a distinct CP_PROV namespace',patch.includes('CP_PROV_BASE_API')&&patch.includes('CP_PROV_BASE_LOAD_DATA')&&!patch.includes('const CP_PR_'));
const topConsts=s=>[...s.matchAll(/^const\s+([A-Z][A-Z0-9_]+)/gm)].map(m=>m[1]);
const prevConsts=new Set(topConsts(previous)),providerConsts=topConsts(patch);
check('provider top-level consts do not collide with Previous Result',providerConsts.every(x=>!prevConsts.has(x)));
check('transient errors are narrowly classified',patch.includes('request limit')&&patch.includes('rate limit')&&patch.includes('service unavailable'));
check('rate limit retry waits before one retry',patch.includes('?6500:1400')&&patch.includes('await cpProvSleep(cpProvDelay(e))'));
check('permanent errors skip retry',patch.includes('if(!cpProvRetryable(e))'));
check('provider diagnostics persist without token material',patch.includes("provider_last_error.json")&&!patch.includes('X-Auth-Token'));
check('stale result carries provider diagnostic',patch.includes('providerError:CP_PROV_LAST_ERROR.message')&&patch.includes('providerRetryAttempted:CP_PROV_LAST_ERROR.retried'));
if(failed){console.error(`\nProvider reliability contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse provider reliability contract PASSED');
