const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=__dirname;
const clubSrc=fs.readFileSync(path.join(root,'club-pulse-wave4-lens-club-patch.js'),'utf8');
const patchSrc=fs.readFileSync(path.join(root,'club-pulse-wave4-lens-patch.js'),'utf8');
let failed=0;
const check=(name,ok)=>{if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}};
try{new Function(clubSrc);check('Lens club patch syntax',true)}catch(e){console.error(e);check('Lens club patch syntax',false)}
try{new Function(patchSrc);check('Lens presentation syntax',true)}catch(e){console.error(e);check('Lens presentation syntax',false)}

const CLUBS={},ALIASES={};
vm.runInNewContext(clubSrc,{CLUBS,ALIASES});
check('Lens registered',Object.keys(CLUBS).length===1&&CLUBS.lens);
check('Lens football-data identity',CLUBS.lens.team===546&&CLUBS.lens.comp==='FL1');
check('Lens parameter and Japanese label',CLUBS.lens.id==='lens'&&CLUBS.lens.jp==='ランス');
check('Lens home venue set',CLUBS.lens.venue==='スタッド・ボラール＝ドゥルリス');
check('Lens registry adds no renderer exception',!clubSrc.includes('buildMedium=')&&!clubSrc.includes('buildSmall='));

const CP_CLUB_THEME_REGISTRY={},CP_STANDARD_TEAM_IDS=new Set(Array.from({length:43},(_,i)=>10000+i)),CP_PREMIUM_GENERIC_KEYS=new Set(),JP={},CP_TEAM_DISPLAY_NAMES={},CP_SP_SMALL_ALIASES={},CP_VENUE_DISPLAY_NAMES={},CP_HOME_VENUE_BY_TEAM={};
const context={CP_CLUB_THEME_REGISTRY,CP_STANDARD_TEAM_IDS,CP_PREMIUM_GENERIC_KEYS,JP,CP_TEAM_DISPLAY_NAMES,CP_SP_SMALL_ALIASES,CP_VENUE_DISPLAY_NAMES,CP_HOME_VENUE_BY_TEAM,CP_WAVE4_LENS_TEAM_ID:546,Number,String,Object,Set};
vm.createContext(context);vm.runInContext(patchSrc,context);
check('Lens theme registered',context.CP_CLUB_THEME_REGISTRY[546]);
check('Lens uses blood gold theme',context.CP_CLUB_THEME_REGISTRY[546].cardGlow==='#C91A25'&&context.CP_CLUB_THEME_REGISTRY[546].cardBorder==='#F7C600');
check('canonical presentation expands 43 to 44',context.CP_STANDARD_TEAM_IDS.size===44);
check('Lens routes generic premium renderer',context.CP_PREMIUM_GENERIC_KEYS.has('lens'));
check('Lens localization registered',context.JP['RC Lens']==='ランス'&&context.CP_TEAM_DISPLAY_NAMES['Racing Club de Lens']==='ランス');
check('Lens Small alias registered',context.CP_SP_SMALL_ALIASES['ランス']==='ランス');
check('Lens venue registry populated',context.CP_HOME_VENUE_BY_TEAM['ランス']==='スタッド・ボラール＝ドゥルリス');
check('Lens presentation adds no renderer exception',!patchSrc.includes('buildMedium=')&&!patchSrc.includes('buildSmall=')&&!patchSrc.includes('renderTeamBlock='));

if(failed){console.error(`\nClub Pulse RC Lens QA FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse RC Lens expansion QA PASSED');
