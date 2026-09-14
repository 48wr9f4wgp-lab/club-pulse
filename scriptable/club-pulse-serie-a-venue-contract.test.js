const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-readability-guard-patch.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

const start=src.indexOf('// Serie A 20');
const end=src.indexOf('// Ligue 1 18',start);
const block=start>=0&&end>start?src.slice(start,end):'';

const expected={
  'アタランタ':'ニュー・バランス・アレーナ',
  'ボローニャ':'レナート・ダッラーラ',
  'カリアリ':'ウニポル・ドムス',
  'コモ':'ジュゼッペ・シニガーリャ',
  'フィオレンティーナ':'アルテミオ・フランキ',
  'フロジノーネ':'ベニート・スティルペ',
  'ジェノア':'ルイジ・フェッラーリス',
  'ミラン':'サン・シーロ',
  'インテル':'サン・シーロ',
  'ユベントス':'アリアンツ・スタジアム',
  'ラツィオ':'スタディオ・オリンピコ',
  'ローマ':'スタディオ・オリンピコ',
  'レッチェ':'ヴィア・デル・マーレ',
  'モンツァ':'ブリアンテオ',
  'ナポリ':'ディエゴ・アルマンド・マラドーナ',
  'パルマ':'エンニオ・タルディーニ',
  'サッスオーロ':'マペイ・スタジアム',
  'トリノ':'オリンピコ・グランデ・トリノ',
  'ウディネーゼ':'ブルーエナジー・スタジアム',
  'ヴェネツィア':'ピエル・ルイジ・ペンツォ'
};

check('Serie A 2026-27 venue block exists',!!block);
for(const [team,venue] of Object.entries(expected))check(`${team} -> ${venue}`,block.includes(`'${team}':'${venue}'`));
check('Serie A registry has all 20 current clubs',Object.keys(expected).length===20&&Object.keys(expected).every(k=>block.includes(`'${k}':`)));
check('promoted Venezia Frosinone Monza present',['ヴェネツィア','フロジノーネ','モンツァ'].every(k=>block.includes(`'${k}':`)));
check('Atalanta current New Balance Arena retained',block.includes("'アタランタ':'ニュー・バランス・アレーナ'")&&src.includes("'New Balance Arena':'ニュー・バランス・アレーナ'"));
check('Udinese current Bluenergy naming retained',block.includes("'ウディネーゼ':'ブルーエナジー・スタジアム'")&&src.includes("'Bluenergy Stadium':'ブルーエナジー・スタジアム'"));
check('Milan and Inter share the same San Siro Giuseppe Meazza ground',block.includes("'ミラン':'サン・シーロ'")&&block.includes("'インテル':'サン・シーロ'")&&src.includes("'Stadio Giuseppe Meazza':'サン・シーロ'"));
check('Monza provider U-Power alias resolves to the same Brianteo ground',src.includes("'U-Power Stadium':'ブリアンテオ'"));
check('Roma and Lazio share Stadio Olimpico',block.includes("'ローマ':'スタディオ・オリンピコ'")&&block.includes("'ラツィオ':'スタディオ・オリンピコ'"));

if(failed){console.error(`\nSerie A venue contract FAILED: ${failed}`);process.exit(1)}
console.log('\nSerie A 2026-27 venue contract PASSED');
