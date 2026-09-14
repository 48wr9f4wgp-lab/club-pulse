const fs=require('fs');
const path=require('path');
const root=__dirname;
const form=fs.readFileSync(path.join(root,'club-pulse-form-system-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(root,'club-pulse.js'),'utf8');
let failed=0;
const check=(name,ok)=>{if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}};
try{new Function(form);check('form system syntax',true)}catch(e){console.error(e);check('form system syntax',false)}
check('medium result chip is visually promoted',form.includes("medium:{label:8.2,arrow:8.6,chip:9.2"));
check('small result chip has its own readable token',form.includes("small:{label:7.8,arrow:8.0,chip:8.4"));
check('canonical labels cover W D L unknown',form.includes("W:{label:'勝'")&&form.includes("D:{label:'分'")&&form.includes("L:{label:'負'")&&form.includes("'-':{label:'－'"));
check('form values are normalized to five entries',form.includes('src.slice(0,5)')&&form.includes("while(src.length<5)src.push('-')"));
check('latest result uses shared theme accent',form.includes('cpFormAccent()')&&form.includes('latest?C(cpFormAccent(),.86)'));
check('legacy formChip is overridden centrally',form.includes('formChip=function(parent,r,latest=false,small=false)'));
check('Medium footer routes through canonical row before final extension',form.includes("buildFooterMedium=function(w,d){return cpRenderCanonicalFormRow(w,d,'medium')}"));
check('Small footer routes through canonical row',form.includes("buildFooterSmall=function(w,d){return cpRenderCanonicalFormRow(w,d,'small')}"));
check('form system contains no club id branches',!/(club\?\.team\s*===|team\s*===\s*\d+)/.test(form));
check('launcher uses dedicated form-system cache',launcher.includes('ClubPulseFormSystemPatch_v1.js')&&launcher.includes("'form-system1'"));
check('launcher pins immutable form-system commit',launcher.includes('41ce4238ea15fb7dc8eb668011c98e203acd1aa4/scriptable/club-pulse-form-system-patch.js'));
check('form system loads before Small UI unification and Previous Result',launcher.includes("+plv+'\\n'+fs+'\\n'+sui+'\\n'+pr"));
check('launcher documents canonical form ownership and final scale layer',launcher.includes('Canonical Form System v1 owns W/D/L/unknown typography')&&launcher.includes('Medium Scale Unification v3 is loaded last'));
if(failed){console.error(`\nCanonical form system contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse canonical form system contract PASSED');
