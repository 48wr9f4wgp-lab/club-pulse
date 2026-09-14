const fs=require('fs');
const path=require('path');
const vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-premier-league-venues-patch.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

try{new Function(src);check('Premier League venue patch syntax',true)}catch(e){console.error(e);check('Premier League venue patch syntax',false)}

const CP_VENUE_DISPLAY_NAMES={},CP_HOME_VENUE_BY_TEAM={};
const context={CP_VENUE_DISPLAY_NAMES,CP_HOME_VENUE_BY_TEAM,Object};
vm.createContext(context);
vm.runInContext(src+'\nthis.__season=CP_PL_VENUE_REGISTRY_SEASON;this.__home=CP_PL_2026_27_HOME_VENUES;this.__aliases=CP_PL_2026_27_VENUE_ALIASES;',context);

const expected={
  'アーセナル':'エミレーツ・スタジアム',
  'アストン・ヴィラ':'ヴィラ・パーク',
  'ボーンマス':'バイタリティ・スタジアム',
  'ブレントフォード':'Gtechコミュニティ・スタジアム',
  'ブライトン':'アメリカン・エキスプレス・スタジアム',
  'チェルシー':'スタンフォード・ブリッジ',
  'コヴェントリー':'コヴェントリー・ビルディング・ソサエティ・アリーナ',
  'クリスタル・パレス':'セルハースト・パーク',
  'エヴァートン':'ヒル・ディッキンソン・スタジアム',
  'フラム':'クレイヴン・コテージ',
  'ハル':'MKMスタジアム',
  'イプスウィッチ':'ポートマン・ロード',
  'リーズ':'エランド・ロード',
  'リヴァプール':'アンフィールド',
  'マンC':'エティハド・スタジアム',
  'マンU':'オールド・トラッフォード',
  'ニューカッスル':'セント・ジェームズ・パーク',
  'フォレスト':'シティ・グラウンド',
  'サンダーランド':'スタジアム・オブ・ライト',
  'トッテナム':'トッテナム・ホットスパー・スタジアム'
};

check('venue registry season is 2026-27',context.__season==='2026-27');
check('Premier League registry has exactly 20 current clubs',Object.keys(context.__home||{}).length===20);
for(const [team,venue] of Object.entries(expected))check(`${team} -> ${venue}`,context.CP_HOME_VENUE_BY_TEAM[team]===venue);
check('promoted Coventry Hull Ipswich present',['コヴェントリー','ハル','イプスウィッチ'].every(k=>context.CP_HOME_VENUE_BY_TEAM[k]));
check('relegated Burnley West Ham Wolves absent',['バーンリー','ウェストハム','ウルブズ'].every(k=>!Object.prototype.hasOwnProperty.call(context.__home,k)));
check('Bournemouth legacy Dean Court normalizes to current Vitality Stadium',context.CP_VENUE_DISPLAY_NAMES['Dean Court']==='バイタリティ・スタジアム'&&context.CP_VENUE_DISPLAY_NAMES['Vitality Stadium']==='バイタリティ・スタジアム');
check('Brentford legacy name normalizes to current Gtech Community Stadium',context.CP_VENUE_DISPLAY_NAMES['Brentford Community Stadium']==='Gtechコミュニティ・スタジアム'&&context.CP_VENUE_DISPLAY_NAMES['Gtech Community Stadium']==='Gtechコミュニティ・スタジアム');
check('Brighton legacy Falmer name normalizes to current American Express Stadium',context.CP_VENUE_DISPLAY_NAMES['Falmer Stadium']==='アメリカン・エキスプレス・スタジアム'&&context.CP_VENUE_DISPLAY_NAMES['American Express Stadium']==='アメリカン・エキスプレス・スタジアム');
check('Everton current Hill Dickinson name retained',context.CP_VENUE_DISPLAY_NAMES['Hill Dickinson Stadium']==='ヒル・ディッキンソン・スタジアム');

if(failed){console.error(`\nPremier League venue contract FAILED: ${failed}`);process.exit(1)}
console.log('\nPremier League 2026-27 venue contract PASSED');
