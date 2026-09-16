const fs=require('fs');
const path=require('path');
const root=__dirname;
const launcher=fs.readFileSync(path.join(root,'club-pulse.js'),'utf8');
const patch=fs.readFileSync(path.join(root,'club-pulse-provider-reliability-patch.js'),'utf8');
let failed=0;const check=(n,ok)=>{if(ok)console.log(`✓ ${n}`);else{console.error(`✗ ${n}`);failed++}};
try{new Function(`return (async()=>{\n${patch}\n})`);check('provider reliability syntax',true)}catch(e){console.error(e.message);check('provider reliability syntax',false)}
check('launcher pins provider reliability v1 immutably',launcher.includes('104f83c5ee62502ca7ca758d3b4e02e29893b770/scriptable/club-pulse-provider-reliability-patch.js'));
check('launcher uses dedicated provider reliability cache',launcher.includes('ClubPulseProviderReliabilityPatch_v1.js')&&launcher.includes("'provider-reliability1'"));
check('provider reliability loads after data policy',launcher.includes("+r+'\\n'+dp+'\\n'+prov+'\\n'+sp"));
check('transient errors are narrowly classified',patch.includes('request limit')&&patch.includes('rate limit')&&patch.includes('service unavailable'));
check('rate limit retry waits before one retry',patch.includes('?6500:1400')&&patch.includes('await cpPrSleep(cpPrDelay(e))'));
check('permanent errors skip retry',patch.includes('if(!cpPrRetryable(e))'));
check('provider diagnostics persist without token material',patch.includes("provider_last_error.json")&&!patch.includes('X-Auth-Token'));
check('stale result carries provider diagnostic',patch.includes('providerError:CP_PR_LAST_ERROR.message')&&patch.includes('providerRetryAttempted:CP_PR_LAST_ERROR.retried'));
if(failed){console.error(`\nProvider reliability contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse provider reliability contract PASSED');
