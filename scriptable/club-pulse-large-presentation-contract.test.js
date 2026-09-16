const fs=require('fs');
const path=require('path');
const patch=fs.readFileSync(path.join(__dirname,'club-pulse-large-presentation-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

check('Large has a dedicated renderer',patch.includes('function buildLarge(d,imgs)')&&patch.includes('function buildMatchLarge(w,d,imgs)'));
check('Large uses vertical secondary context instead of stretching Medium',patch.includes('cpLargeContextCard(w,d)')&&patch.includes("const label=useNext?'次戦':'前節'"));
check('Large keeps a fixed recent-five form section',patch.includes("text(f,'直近5試合'")&&patch.includes('values.length<5'));
check('Large shows HOME/AWAY in the hero for every state',patch.includes('sidePill(top,m,false)')&&patch.includes("d.mode==='LIVE'")&&patch.includes("d.mode==='POST'"));
check('Shared HOME/AWAY type is materially larger than legacy 6.8pt',patch.includes('small?7.8:8.8')&&patch.includes('p.borderWidth=1'));
check('Dark HOME/AWAY pill uses shell text rather than light-card text',patch.includes('fg=cpLargeShellText()')&&!patch.includes("fg=t?.cardText||t?.text||'#F4F4F6'"));
check('Large family normalizer supports large and extraLarge',patch.includes("f==='large'||f==='extralarge'")&&patch.includes("replace(/[\\s_-]/g,''"));
check('Large routes without altering the existing Medium renderer',patch.includes('if(cpLargeFamily())return buildLarge(d,imgs)')&&patch.includes('return CP_LARGE_BASE_BUILD_MEDIUM(d,imgs)'));
check('Large presentation adds no new API calls',!patch.includes('await api(')&&!patch.includes('await liveApi('));

check('Launcher pins Large Presentation v3 to an immutable commit',/const LARGE_PRESENTATION_PATCH='https:\/\/raw\.githubusercontent\.com\/48wr9f4wgp-lab\/club-pulse\/[0-9a-f]{40}\/scriptable\/club-pulse-large-presentation-patch\.js';/.test(launcher));
check('Launcher uses Large Presentation v3 local cache',launcher.includes('ClubPulseLargePresentationPatch_v3.js')&&launcher.includes("'large-presentation3'"));
check('Large patch is injected after the existing patch stack',launcher.includes("const runtime=b.replace(M,lrg+'\\n'+M)"));
check('In-app Large preview accepts large and extraLarge',launcher.includes("(family==='large'||family==='extraLarge')?await widget.presentLarge()"));

if(failed){console.error(`\nClub Pulse Large Presentation contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse Large Presentation contract PASSED');
