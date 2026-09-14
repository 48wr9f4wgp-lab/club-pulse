const fs=require('fs');
const path=require('path');
const root=__dirname;
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const files={
  launcher:read('club-pulse.js'),core:read('club-pulse-core.js'),clubs:read('club-pulse-club-registry-patch.js'),extraClubs:read('club-pulse-extra-clubs-patch.js'),
  ui:read('club-pulse-ui-patch.js'),comp:read('club-pulse-competition-logo-patch.js'),manutd:read('club-pulse-manutd-theme-patch.js'),
  themes:read('club-pulse-theme-registry-patch.js'),extraThemes:read('club-pulse-extra-theme-patch.js'),identity:read('club-pulse-identity-color-patch.js'),
  design:read('club-pulse-design-system-patch.js'),premium:read('club-pulse-premium-visual-patch.js'),
  top:read('club-pulse-top-layout-patch.js'),readability:read('club-pulse-readability-guard-patch.js'),cacheMigration:read('club-pulse-cache-migration-patch.js'),crestCache:read('club-pulse-crest-cache-namespace-patch.js'),finalPolish:read('club-pulse-final-polish-patch.js'),
  live:read('club-pulse-live-context-patch.js'),resilience:read('club-pulse-resilience-patch.js')
};
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}
function has(src,x){return src.includes(x)}
function syntax(name,src){try{new Function(`return (async()=>{\n${src}\n})`);check(`${name}: syntax`,true)}catch(e){console.error(`${name}: ${e.message}`);check(`${name}: syntax`,false)}}
for(const [name,src] of Object.entries(files))syntax(name,src);

check('launcher injects both registries before parameter resolution',has(files.launcher,"c=c.slice(0,pk)+cr+'\\n'+ec+'\\n'+c.slice(pk)"));
check('launcher uses Man U v4',has(files.launcher,'ClubPulseManUThemePatch_v4.js')&&has(files.launcher,"'mutheme4'"));
check('launcher uses theme registry v13',has(files.launcher,'ClubPulseThemeRegistryPatch_v13.js')&&has(files.launcher,"'themes13'"));
check('launcher uses identity v7',has(files.launcher,'ClubPulseIdentityColorPatch_v7.js')&&has(files.launcher,"'identity7'"));
check('launcher loads canonical design system v7',has(files.launcher,'ClubPulseDesignSystemPatch_v7.js')&&has(files.launcher,"'design-system7'"));
check('launcher pins canonical design-system v7 commit',has(files.launcher,'3cfc3e4ea100fdc95686614c42561036052222ae'));
check('launcher uses premium visual v6',has(files.launcher,'ClubPulsePremiumVisualPatch_v6.js')&&has(files.launcher,"'premium6'")&&has(files.launcher,'ecc546bf6f1bfb3d82e7a601d07622b3d716dcba'));
check('launcher uses readability v8',has(files.launcher,'ClubPulseReadabilityGuardPatch_v8.js')&&has(files.launcher,"'readability8'"));
check('launcher pins readability v8 commit',has(files.launcher,'9b6e1f82ad2d07d67628cd501723d5eba095908f'));
check('launcher uses cache migration v1',has(files.launcher,'ClubPulseCacheMigrationPatch_v1.js')&&has(files.launcher,"'cache-migration1'")&&has(files.launcher,'986e4aa662f695d84b1174bf79917cb8e31a10f7'));
check('launcher keeps final polish v3',has(files.launcher,'ClubPulseFinalPolishPatch_v3.js')&&has(files.launcher,"'final-polish3'"));
check('canonical load order remains stable',has(files.launcher,"+u+'\\n'+i+'\\n'+ds+'\\n'+pv+'\\n'+rg+'\\n'+cm+'\\n'+ccn+'\\n'+fp+'\\n'+q+'\\n'+r"));
check('launcher retains remote-to-local fallback',has(files.launcher,'if(F.fileExists(file))return F.readString(file)'));
check('launcher retains QA persistence',has(files.launcher,'ClubPulseQAOverride_v1.json')&&has(files.launcher,'15*60*1000'));

check('design system contains all eleven theme definitions',["66:{","81:{","86:{","5:{","524:{","98:{","65:{","57:{","64:{","108:{","4:{"].every(x=>has(files.design,x)));
check('frozen seven identities remain present',has(files.design,"key:'manutd',tone:'vivid-red'")&&has(files.design,"key:'barcelona',tone:'royal-purple'")&&has(files.design,"key:'realmadrid',tone:'pearl-white'")&&has(files.design,"key:'bayern',tone:'crest-red-blue-white'")&&has(files.design,"key:'psg',tone:'paris-royal-blue'")&&has(files.design,"key:'milan',tone:'rossoneri-gunmetal'")&&has(files.design,"key:'mancity',tone:'sky-blue'"));
check('Arsenal identity stays navy red ivory',has(files.design,"key:'arsenal',tone:'arsenal-red-ivory-navy'")&&has(files.design,"cardSurface:'#152A4A'")&&has(files.design,"cardBorder:'#F0E5D2'"));
check('Liverpool identity stays deep scarlet teal',has(files.design,"key:'liverpool',tone:'deep-scarlet-teal'")&&has(files.design,"cardSurface:'#430713'")&&has(files.design,"cardBorder:'#00A79F'"));
check('Inter identity remains black electric blue',has(files.design,"key:'inter',tone:'nerazzurri-electric-blue'"));
check('Dortmund identity remains signal yellow black',has(files.design,"key:'dortmund',tone:'signal-yellow-black'")&&has(files.design,"cardText:'#111111'"));
check('design defines shared metadata typography',has(files.design,'metaMedium:{font:9.2,minScale:.88}')&&has(files.design,'metaSmall:{font:9.0,minScale:.90}')&&has(files.design,'function cpMetaText'));
check('Dortmund has separate light shell-header accent',has(files.design,"headerAccent:'#E6EAF0'"));
check('theme header consumes optional shell-header accent',has(files.themes,'t.headerAccent||t.accentSoft||CP_COMMON_SHELL.muted'));
check('generic renderer uses canonical metadata typography',has(files.premium,'cpMetaText(meta,metaLine(d,m),fg,false)')&&has(files.premium,'cpMetaText(meta,m.kickoff,fg,true)'));
check('Real and Barcelona use canonical metadata typography',has(files.identity,"cpMetaText(meta,metaLine(d,m),'#FFFFFF',false)")&&has(files.identity,'cpMetaText(meta,metaLine(d,m),t.cardText,false)'));
check('Man U uses canonical metadata typography',has(files.manutd,"cpMetaText(meta,metaLine(d,m),CP_MU_IS()?'#F1E9D8':'#FFFFFF',false)"));

check('readability applies to eleven clubs',has(files.readability,'new Set([66,81,86,5,524,98,65,57,64,108,4])'));
check('five-league registry fixes observed German and Italian labels',has(files.readability,"'Hoffenheim':'ホッフェンハイム'")&&has(files.readability,"'Cagliari':'カリアリ'"));
check('five-league registry includes broad PL LaLiga Bundesliga SerieA Ligue1 coverage',has(files.readability,"'Aston Villa':'アストン・ヴィラ'")&&has(files.readability,"'Villarreal':'ビジャレアル'")&&has(files.readability,"'Bayer Leverkusen':'レヴァークーゼン'")&&has(files.readability,"'Napoli':'ナポリ'")&&has(files.readability,"'Marseille':'マルセイユ'"));
check('canonical team name precedes ellipsis fallback',has(files.readability,'function cpCanonicalTeamName')&&has(files.readability,'CP_TEAM_DISPLAY_NAMES[n]||n')&&has(files.readability,"n.length>max?n.slice(0,max-1)+'…':n"));
check('venue registry is pinned to 2026-27 current season',has(files.readability,"CP_VENUE_REGISTRY_SEASON='2026-27'")&&has(files.readability,"'Hill Dickinson Stadium':'ヒル・ディッキンソン・スタジアム'")&&has(files.readability,"'Estadio Olímpico de la Cartuja':'ラ・カルトゥハ'")&&has(files.readability,"'PreZero Arena':'SNPアレーナ'"));
check('2026-27 promoted and changed-venue coverage is registered',has(files.readability,"'Hull City':'ハル'")&&has(files.readability,"'Racing Santander':'ラシン'")&&has(files.readability,"'SV Elversberg':'エルヴァースベルク'")&&has(files.readability,"'Frosinone':'フロジノーネ'")&&has(files.readability,"'Le Mans FC':'ル・マン'")&&has(files.readability,"'エヴァートン':'ヒル・ディッキンソン・スタジアム'")&&has(files.readability,"'ベティス':'ラ・カルトゥハ'")&&has(files.readability,"'ホッフェンハイム':'SNPアレーナ'"));
check('away venue fallback is conservative registry lookup',has(files.readability,'const CP_HOME_VENUE_BY_TEAM=')&&has(files.readability,"out.homeAway==='AWAY'")&&has(files.readability,"CP_HOME_VENUE_BY_TEAM[out.opponentName]||'会場未定'"));
check('mapMatch normalization happens before cache/render',has(files.readability,'const CP_RG_BASE_MAP_MATCH=mapMatch')&&has(files.readability,'mapMatch=function(m)'));
check('cache migration wraps loadData',has(files.cacheMigration,'const CP_CM_BASE_LOAD_DATA=loadData')&&has(files.cacheMigration,'loadData=async function(t)'));
check('cache migration handles legacy and missing venues',has(files.cacheMigration,"'プレゼロ・アレーナ':'SNPアレーナ'")&&has(files.cacheMigration,"CP_HOME_VENUE_BY_TEAM[out.opponentName]||'会場未定'"));
check('cache migration stamps schema and avoids persisting stale flag',has(files.cacheMigration,"CP_CACHE_SCHEMA_VERSION='venue-2026-27-v1'")&&has(files.cacheMigration,'delete stored.stale'));
check('crest cache is provider namespaced',has(files.crestCache,"CP_CREST_CACHE_VERSION='v2'")&&has(files.crestCache,"return'api_football'")&&has(files.crestCache,"return'football_data'"));
check('pill geometry still reads canonical tokens',has(files.readability,"typeof CP_DESIGN_TOKENS==='object'")&&has(files.readability,'CP_DESIGN_TOKENS.pill'));
check('competition crest treatment remains unified',has(files.readability,'function cpUnifiedCompetitionPill')&&has(files.readability,'plate.addImage(logo)'));
check('readability contains no opponent-specific crest rescue',!has(files.readability,'CP_LOW_CONTRAST_CRESTS')&&!has(files.readability,'CP_RG_BASE_BADGE'));

check('final polish remains Bayern-only',!has(files.finalPolish,'badge=function')&&!has(files.finalPolish,'JUV')&&has(files.finalPolish,"club?.team!==5"));
check('core retains stale cache fallback',has(files.core,'if(c)return{...c,stale:true}'));
check('core retains daily quota guard',has(files.core,'API_DAILY_BUDGET'));
check('core keeps live token in Keychain',has(files.core,'clubpulse_api_football_token_v1'));
check('resilience keeps offline and no-cache QA',has(files.resilience,"qa==='offline'")&&has(files.resilience,"qa==='nocache'"));

if(failed){console.error(`\nClub Pulse contract QA FAILED: ${failed} check(s)`);process.exit(1)}
console.log('\nClub Pulse metadata typography, header contrast, venue registry, and cache migration contract QA PASSED');