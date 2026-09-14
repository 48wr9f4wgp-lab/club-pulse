const fs=require('fs');
const path=require('path');
const patch=fs.readFileSync(path.join(__dirname,'club-pulse-small-ui-unification-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

check('launcher pins Small UI Unification immutably',launcher.includes('0e7a075736a9c467053588918a48ceb3446cfc38/scriptable/club-pulse-small-ui-unification-patch.js'));
check('launcher uses dedicated unification v3 cache',launcher.includes('ClubPulseSmallUIUnificationPatch_v3.js')&&launcher.includes("'small-ui-unification3'"));
check('unification loads after canonical form system',launcher.includes("+plv+'\\n'+fs+'\\n'+sui"));
check('Paderborn provider aliases normalize to Japanese',patch.includes("'SC Paderborn':'パーダーボルン'")&&patch.includes("'SC Paderborn 07':'パーダーボルン'"));
check('Small labels prefer Japanese canonical names',patch.includes("'レヴァークーゼン':'レヴァークーゼン'")&&patch.includes("'フェイエノールト':'フェイエノールト'")&&!patch.includes("'レヴァークーゼン':'Leverkusen'")&&!patch.includes("'フェイエノールト':'Feyenoord'"));
check('legacy ASCII aliases are rejected when a Japanese label exists',patch.includes("if(alias&&/[^\\x20-\\x7E]/.test(alias))return alias"));
check('Eredivisie venue aliases are localized',patch.includes("'MAC³PARK Stadion':'MAC³PARKスタジアム'")&&patch.includes("'AFAS Stadion':'AFASスタジアム'")&&patch.includes("'Abe Lenstra Stadion':'アベ・レンストラ・スタジアム'"));
check('football-data and API-Football both normalize match objects',patch.includes('const CP_UIU_BASE_MAP_MATCH=mapMatch')&&patch.includes('const CP_UIU_BASE_MAP_API_FIXTURE=mapApiFixture')&&patch.includes('cpUiuNormalizeMatch'));
check('final loadData boundary normalizes NEXT LIVE POST and stale cache',patch.includes('const CP_UIU_BASE_LOAD_DATA=loadData')&&patch.includes('liveMatch:cpUiuNormalizeMatch(d.liveMatch)')&&patch.includes('recentResult:cpUiuNormalizeMatch(d.recentResult)')&&patch.includes('nextMatch:cpUiuNormalizeMatch(d.nextMatch)'));
check('metadata normalization does not mutate cached match object',patch.includes('const normalized=cpUiuNormalizeMatch(m)')&&patch.includes('return CP_UIU_BASE_META_LINE(d,normalized)'));
check('footer renders atomic latest arrow label',patch.includes("text(f,'最新 →'"));
check('footer always normalizes to five form chips',patch.includes('form.slice(0,5)')&&patch.includes("while(values.length<5)values.push('-')"));
check('Small and Medium share final canonical footer renderer',patch.includes("buildFooterMedium=function(w,d){return cpUiuFormRow(w,d,'medium')}")&&patch.includes("buildFooterSmall=function(w,d){return cpUiuFormRow(w,d,'small')}"));

if(failed){console.error(`\nSmall UI unification contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse Small UI unification contract PASSED');
