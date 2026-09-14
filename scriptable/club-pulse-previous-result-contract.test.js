const fs=require('fs');
const path=require('path');
const patch=fs.readFileSync(path.join(__dirname,'club-pulse-previous-result-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
const check=(name,ok)=>{if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}};

try{new Function(patch);check('previous-result patch syntax',true)}catch(e){console.error(e);check('previous-result patch syntax',false)}
check('launcher pins Previous Result v2 immutably',launcher.includes('d62020a0b222a33bdfb3c1e12bd852e0dc881b01/scriptable/club-pulse-previous-result-patch.js'));
check('launcher uses dedicated previous-result v2 cache',launcher.includes('ClubPulsePreviousResultPatch_v2.js')&&launcher.includes("'previous-result2'"));
check('previous-result patch loads after UI unification',launcher.includes("+fs+'\\n'+sui+'\\n'+pr"));
check('latest FINISHED match persists as previousResult',patch.includes("finished=rows.filter(m=>m?.status==='FINISHED')")&&patch.includes('previousResult:'));
check('legacy cache is backfilled without deletion',patch.includes('network-previous-result')&&patch.includes('writeJSON(cachePath(),fresh)')&&!patch.includes('remove(cachePath'));
check('recent POST result can seed previousResult without another fetch',patch.includes('if(d.recentResult)return{...d,previousResult:d.recentResult}'));
check('Medium footer exposes previous result',patch.includes("text(prev,'前節'")&&patch.includes('cpPrScore(m)')&&patch.includes('cpPrOpponent(m)'));
check('POST hides duplicate previous-result summary',patch.includes("d?.mode==='POST'"));
check('atomic latest arrow and five form chips remain',patch.includes("text(f,'最新 →'")&&patch.includes('form.slice(0,5)')&&patch.includes("while(values.length<5)values.push('-')"));
check('previous-season standings use official season filter',patch.includes('standings?season=${season}'));
check('historical standings cache is shared by competition and season',patch.includes('last_season_standings_${String(club?.comp')&&patch.includes('CP_PR_LSR_TTL=30*24*60*60*1000'));
check('supported league set covers Big Five plus Eredivisie',patch.includes("['PL','PD','BL1','SA','FL1','DED']"));
check('Medium header exposes last-season rank',patch.includes('CP_PR_BASE_HEADER_MEDIUM=buildHeaderMedium')&&patch.includes('昨季 ${d.lastSeasonRank}位'));
check('promoted clubs receive a non-false rank label',patch.includes("lastSeasonStatus:row?'ranked':'promoted'")&&patch.includes("return'昨季 昇格'"));
check('Small renderer/footer is untouched',!patch.includes('buildFooterSmall=')&&!patch.includes('buildSmall=')&&!patch.includes('buildHeaderSmall='));
check('no club-specific renderer branches',!/(club\?\.team\s*===|club\.id\s*===|team\s*===\s*\d+)/.test(patch));

if(failed){console.error(`\nPrevious result contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse previous result + season context contract PASSED');
