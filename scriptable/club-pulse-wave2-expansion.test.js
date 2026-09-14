const fs=require('fs');
const path=require('path');
const vm=require('vm');

const clubsSrc=fs.readFileSync(path.join(__dirname,'club-pulse-wave2-clubs-patch.js'),'utf8');
const themesSrc=fs.readFileSync(path.join(__dirname,'club-pulse-wave2-themes-patch.js'),'utf8');
const expected={
  chelsea:[61,'PL'],tottenham:[73,'PL'],newcastle:[67,'PL'],astonvilla:[58,'PL'],everton:[62,'PL'],brighton:[397,'PL'],westham:[563,'PL'],
  atletico:[78,'PD'],athletic:[77,'PD'],realsociedad:[92,'PD'],villarreal:[94,'PD'],sevilla:[559,'PD'],betis:[90,'PD'],
  leverkusen:[3,'BL1'],leipzig:[721,'BL1'],frankfurt:[19,'BL1'],stuttgart:[10,'BL1'],gladbach:[18,'BL1'],
  juventus:[109,'SA'],napoli:[113,'SA'],roma:[100,'SA'],lazio:[110,'SA'],atalanta:[102,'SA'],fiorentina:[99,'SA'],
  marseille:[516,'FL1'],monaco:[548,'FL1'],lyon:[523,'FL1'],lille:[521,'FL1'],nice:[522,'FL1']
};
const ids=Object.values(expected).map(x=>x[0]);
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

try{new Function(clubsSrc);check('wave2 club registry syntax',true)}catch(e){console.error(e);check('wave2 club registry syntax',false)}
try{new Function(themesSrc);check('wave2 theme syntax',true)}catch(e){console.error(e);check('wave2 theme syntax',false)}

const clubContext={CLUBS:{},ALIASES:{},CREST_SCALE:{}};
vm.createContext(clubContext);
vm.runInContext(clubsSrc,clubContext);
check('29 new selectable clubs registered',Object.keys(clubContext.CLUBS).length===29);
check('all wave2 team ids unique',new Set(ids).size===29);
for(const [key,[id,comp]] of Object.entries(expected)){
  const c=clubContext.CLUBS[key];
  check(`${key} registry identity`,!!c&&c.team===id&&c.comp===comp&&c.jp&&c.liveSearch&&c.venue);
}
check('Premier League adds seven clubs',Object.values(clubContext.CLUBS).filter(c=>c.comp==='PL').length===7);
check('LaLiga adds six clubs',Object.values(clubContext.CLUBS).filter(c=>c.comp==='PD').length===6);
check('Bundesliga adds five clubs',Object.values(clubContext.CLUBS).filter(c=>c.comp==='BL1').length===5);
check('Serie A adds six clubs',Object.values(clubContext.CLUBS).filter(c=>c.comp==='SA').length===6);
check('Ligue 1 adds five clubs',Object.values(clubContext.CLUBS).filter(c=>c.comp==='FL1').length===5);
check('club patch adds no renderer exception',!clubsSrc.includes('buildMedium=')&&!clubsSrc.includes('buildSmall=')&&!clubsSrc.includes('renderTeamBlock='));

const themeContext={
  CP_CLUB_THEME_REGISTRY:{},
  CP_STANDARD_TEAM_IDS:new Set([66,81,86,5,524,98,65,57,64,108,4]),
  CP_PREMIUM_GENERIC_KEYS:new Set(['bayern','psg','milan','mancity','arsenal','liverpool','inter','dortmund']),
  CP_WAVE2_TEAM_IDS:ids,
  CP_SP_SMALL_ALIASES:{},
  CP_HOME_VENUE_BY_TEAM:{},
  CP_VENUE_DISPLAY_NAMES:{}
};
vm.createContext(themeContext);
vm.runInContext(themesSrc,themeContext);
check('29 wave2 themes registered',ids.every(id=>themeContext.CP_CLUB_THEME_REGISTRY[id]));
check('canonical presentation set expands to 40',themeContext.CP_STANDARD_TEAM_IDS.size===40);
check('all wave2 clubs route through generic premium medium renderer',ids.every(id=>themeContext.CP_PREMIUM_GENERIC_KEYS.has(themeContext.CP_CLUB_THEME_REGISTRY[id].key)));
check('all wave2 themes have common contract fields',ids.every(id=>{const t=themeContext.CP_CLUB_THEME_REGISTRY[id];return t.key&&t.cardSurface&&t.cardPanel&&t.cardGlow&&t.cardBorder&&t.headerAccent&&t.cardText}));
check('Juventus opts into generic own-crest contrast token',themeContext.CP_CLUB_THEME_REGISTRY[109].ownCrestPlate==='#F2F2F2'&&themeContext.CP_CLUB_THEME_REGISTRY[109].ownCrestPlateAlpha===.16);
check('Napoli cyan gradient is restrained',themeContext.CP_CLUB_THEME_REGISTRY[113].cardGlow==='#0E91BB');
check('Marseille cyan gradient is restrained',themeContext.CP_CLUB_THEME_REGISTRY[516].cardGlow==='#0A8CB5');
check('late wave2 Small aliases preserve natural club names',themeContext.CP_SP_SMALL_ALIASES['レアル・ソシエダ']==='レアル・ソシエダ'&&themeContext.CP_SP_SMALL_ALIASES['レヴァークーゼン']==='レヴァークーゼン'&&themeContext.CP_SP_SMALL_ALIASES['フランクフルト']==='フランクフルト'&&themeContext.CP_SP_SMALL_ALIASES['シュトゥットガルト']==='シュトゥットガルト'&&themeContext.CP_SP_SMALL_ALIASES['フィオレンティーナ']==='フィオレンティーナ');
check('2026-27 venue overrides include Everton Betis Atalanta',themeContext.CP_HOME_VENUE_BY_TEAM['エヴァートン']==='ヒル・ディッキンソン・スタジアム'&&themeContext.CP_HOME_VENUE_BY_TEAM['ベティス']==='ラ・カルトゥハ'&&themeContext.CP_HOME_VENUE_BY_TEAM['アタランタ']==='ニュー・バランス・アリーナ');
check('legacy Atalanta venue migrates to current name',themeContext.CP_VENUE_DISPLAY_NAMES['Gewiss Stadium']==='ニュー・バランス・アリーナ');
check('theme patch adds no club-specific renderer exception',!themesSrc.includes('buildMedium=')&&!themesSrc.includes('buildSmall=')&&!themesSrc.includes('renderTeamBlock='));

if(failed){console.error(`\nClub Pulse Wave 2 expansion QA FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse 40-club expansion QA PASSED');