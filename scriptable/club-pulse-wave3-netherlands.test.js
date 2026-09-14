const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=__dirname;
const clubsSrc=fs.readFileSync(path.join(root,'club-pulse-wave3-netherlands-clubs-patch.js'),'utf8');
const patchSrc=fs.readFileSync(path.join(root,'club-pulse-wave3-netherlands-patch.js'),'utf8');
const premiumSrc=fs.readFileSync(path.join(root,'club-pulse-premium-visual-patch.js'),'utf8');
let failed=0;
const check=(name,ok)=>{if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}};
const syntax=(name,src)=>{try{new Function(src);check(`${name}: syntax`,true)}catch(e){console.error(e);check(`${name}: syntax`,false)}};
syntax('wave3 clubs',clubsSrc);syntax('wave3 netherlands',patchSrc);syntax('premium visual',premiumSrc);

const CLUBS={},ALIASES={};
vm.runInNewContext(clubsSrc,{CLUBS,ALIASES});
check('three Dutch clubs registered',Object.keys(CLUBS).length===3);
check('Ajax football-data identity',CLUBS.ajax.team===678&&CLUBS.ajax.comp==='DED'&&CLUBS.ajax.jp==='アヤックス');
check('PSV football-data identity',CLUBS.psv.team===674&&CLUBS.psv.comp==='DED'&&CLUBS.psv.jp==='PSV');
check('Feyenoord football-data identity',CLUBS.feyenoord.team===675&&CLUBS.feyenoord.comp==='DED'&&CLUBS.feyenoord.jp==='フェイエノールト');
check('Dutch team ids are unique',new Set(Object.values(CLUBS).map(x=>x.team)).size===3);
check('registry adds no renderer exception',!clubsSrc.includes('buildMedium=')&&!clubsSrc.includes('buildSmall='));

const CP_COMP_ASSETS={},CP_CLUB_THEME_REGISTRY={},CP_STANDARD_TEAM_IDS=new Set(Array.from({length:40},(_,i)=>10000+i)),CP_PREMIUM_GENERIC_KEYS=new Set(),JP={},CP_TEAM_DISPLAY_NAMES={},CP_SP_SMALL_ALIASES={},CP_VENUE_DISPLAY_NAMES={},CP_HOME_VENUE_BY_TEAM={};
let competitionReadable=()=> 'BASE',competitionStyle=()=>({base:true}),cpCompetitionKey=()=> 'BASE';
const context={
  CP_COMP_ASSETS,CP_CLUB_THEME_REGISTRY,CP_STANDARD_TEAM_IDS,CP_PREMIUM_GENERIC_KEYS,JP,CP_TEAM_DISPLAY_NAMES,CP_SP_SMALL_ALIASES,CP_VENUE_DISPLAY_NAMES,CP_HOME_VENUE_BY_TEAM,
  CP_WAVE3_NL_TEAM_IDS:[678,674,675],competitionReadable,competitionStyle,cpCompetitionKey,Number,String,Object,Set
};
vm.createContext(context);vm.runInContext(patchSrc,context);
check('Eredivisie API-Football asset registered',context.CP_COMP_ASSETS.DED?.id===88);
check('Eredivisie full label',context.competitionReadable({competitionShort:'DED'},false)==='エールディヴィジ');
check('Eredivisie small label',context.competitionReadable({competitionShort:'DED'},true)==='ERE');
check('Eredivisie competition key',context.cpCompetitionKey({competition:'Eredivisie'})==='DED');
check('Ajax PSV Feyenoord themes registered',[678,674,675].every(id=>context.CP_CLUB_THEME_REGISTRY[id]));
check('Ajax uses readable pearl red theme',context.CP_CLUB_THEME_REGISTRY[678].cardText==='#111827'&&context.CP_CLUB_THEME_REGISTRY[678].cardBorder==='#D2122E');
check('PSV uses red white theme',context.CP_CLUB_THEME_REGISTRY[674].cardGlow==='#ED1B2E');
check('Feyenoord uses black red theme',context.CP_CLUB_THEME_REGISTRY[675].cardSurface==='#090A0C'&&context.CP_CLUB_THEME_REGISTRY[675].cardGlow==='#C91623');
check('canonical presentation expands 40 to 43',context.CP_STANDARD_TEAM_IDS.size===43);
check('all Dutch themes route generic premium renderer',['ajax','psv','feyenoord'].every(k=>context.CP_PREMIUM_GENERIC_KEYS.has(k)));
check('Dutch localization registry populated',context.JP['AFC Ajax']==='アヤックス'&&context.JP['Feyenoord Rotterdam']==='フェイエノールト'&&context.CP_TEAM_DISPLAY_NAMES['N.E.C. Nijmegen']==='NEC');
check('Small Feyenoord alias avoids clipping',context.CP_SP_SMALL_ALIASES['フェイエノールト']==='フェイエ');

const expectedVenueTeams=['ADO','アヤックス','AZ','エクセルシオール','フローニンゲン','トゥウェンテ','ユトレヒト','フェイエノールト','フォルトゥナ','ゴー・アヘッド','NEC','ズウォレ','PSV','カンブール','ヘーレンフェーン','スパルタ','テルスター','ヴィレムII'];
check('all 18 current Eredivisie home venues registered',expectedVenueTeams.every(k=>context.CP_HOME_VENUE_BY_TEAM[k])&&expectedVenueTeams.length===18);
check('Feyenoord at NEC falls back to Goffertstadion',context.CP_HOME_VENUE_BY_TEAM.NEC==='Goffertstadion');
check('Feyenoord at PEC falls back to MAC3PARK',context.CP_HOME_VENUE_BY_TEAM['ズウォレ']==='MAC³PARK Stadion');
check('Feyenoord at Telstar falls back to BUKO',context.CP_HOME_VENUE_BY_TEAM['テルスター']==='BUKO Stadion');
check('Ajax PSV Feyenoord home venues retained',context.CP_HOME_VENUE_BY_TEAM['アヤックス']==='ヨハン・クライフ・アレナ'&&context.CP_HOME_VENUE_BY_TEAM['PSV']==='フィリップス・スタディオン'&&context.CP_HOME_VENUE_BY_TEAM['フェイエノールト']==='デ・カイプ');
check('provider venue aliases normalize to current names',context.CP_VENUE_DISPLAY_NAMES['Stadion de Goffert']==='Goffertstadion'&&context.CP_VENUE_DISPLAY_NAMES['MAC3PARK Stadion']==='MAC³PARK Stadion'&&context.CP_VENUE_DISPLAY_NAMES['Sparta-Stadion Het Kasteel']==='Spartastadion Het Kasteel');

check('presentation patch adds no club renderer exception',!patchSrc.includes('buildMedium=')&&!patchSrc.includes('buildSmall=')&&!patchSrc.includes('renderTeamBlock='));
check('premium Medium team block accepts theme text color',premiumSrc.includes('function cpPremiumTeamBlock(parent,opt,fg)')&&premiumSrc.includes('heavy(name,opt.name,opt.nameSize||12,fg)'));
check('premium Medium applies cardText to both team labels',(premiumSrc.match(/cpPremiumTeamBlock\(row,/g)||[]).length===2&&premiumSrc.includes('fg=cpPremiumTextColor(t)'));
check('Ajax fix remains data driven',!premiumSrc.includes("t?.key==='ajax'")&&!premiumSrc.includes("club.id==='ajax'"));

if(failed){console.error(`\nClub Pulse Wave 3 Netherlands QA FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse Ajax / PSV / Feyenoord expansion QA PASSED');
