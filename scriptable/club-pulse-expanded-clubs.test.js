const fs=require('fs');
const path=require('path');
const root=__dirname;
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const launcher=read('club-pulse.js');
const clubs=read('club-pulse-extra-clubs-patch.js');
const design=read('club-pulse-design-system-patch.js');
const premium=read('club-pulse-premium-visual-patch.js');
const leagues=read('club-pulse-league-expansion-patch.js');
const readability=read('club-pulse-readability-guard-patch.js');
const finalPolish=read('club-pulse-final-polish-patch.js');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}
function has(src,x){return src.includes(x)}
function syntax(name,src){try{new Function(`return (async()=>{\n${src}\n})`);check(`${name}: syntax`,true)}catch(e){console.error(e.message);check(`${name}: syntax`,false)}}
syntax('extra clubs',clubs);syntax('design system',design);syntax('premium visual',premium);syntax('league expansion',leagues);syntax('readability guard',readability);syntax('final polish',finalPolish);

const expectedClubs=[
  ["id:'bayern',team:5,comp:'BL1'",'Bayern'],["id:'psg',team:524,comp:'FL1'",'PSG'],["id:'milan',team:98,comp:'SA'",'Milan'],["id:'mancity',team:65,comp:'PL'",'Man City'],
  ["id:'arsenal',team:57,comp:'PL'",'Arsenal'],["id:'liverpool',team:64,comp:'PL'",'Liverpool'],["id:'inter',team:108,comp:'SA'",'Inter'],["id:'dortmund',team:4,comp:'BL1'",'Dortmund']
];
for(const [needle,label] of expectedClubs)check(`${label} team id`,has(clubs,needle));
check('second batch aliases',has(clubs,"ars:'arsenal'")&&has(clubs,"lfc:'liverpool'")&&has(clubs,"internazionale:'inter'")&&has(clubs,"bvb:'dortmund'"));

check('canonical design owns all eleven themes',["66:{","81:{","86:{","5:{","524:{","98:{","65:{","57:{","64:{","108:{","4:{"].every(x=>has(design,x)));
check('Arsenal exposes navy field with ivory trim',has(design,"key:'arsenal',tone:'arsenal-red-ivory-navy'")&&has(design,"cardSurface:'#152A4A'")&&has(design,"cardBorder:'#F0E5D2'"));
check('Liverpool uses visibly deeper scarlet plus teal trim',has(design,"key:'liverpool',tone:'deep-scarlet-teal'")&&has(design,"cardSurface:'#430713'")&&has(design,"cardBorder:'#00A79F'"));
check('Inter remains black-to-electric-blue',has(design,"key:'inter',tone:'nerazzurri-electric-blue'")&&has(design,"cardGlow:'#0057B8'"));
check('Dortmund remains signal yellow with dark card text',has(design,"key:'dortmund',tone:'signal-yellow-black'")&&has(design,"cardText:'#111111'")&&has(design,"headerAccent:'#E6EAF0'"));
check('existing Milan generic gunmetal remains frozen',has(design,"key:'milan',tone:'rossoneri-gunmetal'")&&has(design,"cardGlow:'#62666D'"));
check('shared metadata typography exists',has(design,'metaMedium:{font:9.2,minScale:.88}')&&has(design,'metaSmall:{font:9.0,minScale:.90}')&&has(design,'function cpMetaText'));

check('premium renderer automatically includes canonical additions',has(premium,'Object.values(CP_THEME_DEFINITIONS||{})')&&has(premium,'CP_PREMIUM_GENERIC_KEYS'));
check('premium renderer uses shared metadata typography',has(premium,'cpMetaText(meta,metaLine(d,m),fg,false)')&&has(premium,'cpMetaText(meta,m.kickoff,fg,true)'));
check('readability contract spans eleven teams',has(readability,'new Set([66,81,86,5,524,98,65,57,64,108,4])'));
check('observed English leftovers now normalize',has(readability,"'Hoffenheim':'ホッフェンハイム'")&&has(readability,"'Cagliari':'カリアリ'"));
check('five-league aliases are broad and reusable',has(readability,"'Chelsea':'チェルシー'")&&has(readability,"'Sevilla':'セビージャ'")&&has(readability,"'RB Leipzig':'ライプツィヒ'")&&has(readability,"'Roma':'ローマ'")&&has(readability,"'Lyon':'リヨン'"));
check('known away venues can be inferred without opponent-specific UI code',has(readability,"'アストン・ヴィラ':'ヴィラ・パーク'")&&has(readability,"'ホッフェンハイム':'SNPアレーナ'")&&has(readability,"'カリアリ':'ウニポル・ドムス'"));
check('unknown away venues stay explicitly unknown',has(readability,"CP_HOME_VENUE_BY_TEAM[out.opponentName]||'会場未定'"));
check('long labels still use ellipsis only as fallback',has(readability,'CP_TEAM_DISPLAY_NAMES[n]||n')&&has(readability,"n.slice(0,max-1)+'…'"));
check('competition pill remains shared',has(readability,'function cpUnifiedCompetitionPill')&&has(readability,'plate.size=new Size(q.logoBox,q.logoBox)'));
check('no crest-specific rescue registry',!has(readability,'CP_LOW_CONTRAST_CRESTS')&&!has(readability,'CP_RG_BASE_BADGE'));
check('final polish remains Bayern-only',has(finalPolish,"club?.team!==5")&&!has(finalPolish,'badge=function'));

check('existing league support covers expansion',has(leagues,"return small?'BL':'ブンデスリーガ'")&&has(leagues,"return small?'Serie A':'セリエA'"));
check('launcher downloads design v7',has(launcher,'ClubPulseDesignSystemPatch_v7.js')&&has(launcher,"'design-system7'"));
check('launcher downloads premium v6',has(launcher,'ClubPulsePremiumVisualPatch_v6.js')&&has(launcher,"'premium6'")&&has(launcher,'ecc546bf6f1bfb3d82e7a601d07622b3d716dcba'));
check('launcher downloads readability v8',has(launcher,'ClubPulseReadabilityGuardPatch_v8.js')&&has(launcher,"'readability8'"));
check('launcher documents expansion',has(launcher,'arsenal, liverpool, inter, and dortmund'));

if(failed){console.error(`\nExpanded club QA FAILED: ${failed}`);process.exit(1)}
console.log('\nEleven-club metadata typography, localization, and 2026-27 venue QA PASSED');