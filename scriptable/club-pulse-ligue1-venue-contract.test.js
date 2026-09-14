const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-readability-guard-patch.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

const start=src.indexOf('// Ligue 1 18');
const end=src.indexOf('};',start);
const block=start>=0&&end>start?src.slice(start,end):'';

const expected={
  'アンジェ':'レイモン・コパ',
  'オセール':'アベ・デシャン',
  'ブレスト':'フランシス・ル・ブレ',
  'ル・アーヴル':'スタッド・オセアン',
  'ル・マン':'マリー・マルヴァン',
  'ランス':'ボラール・デレリス',
  'リール':'ピエール・モーロワ',
  'ロリアン':'ムストワール',
  'リヨン':'グルパマ・スタジアム',
  'マルセイユ':'ヴェロドローム',
  'モナコ':'スタッド・ルイ・ドゥ',
  'ニース':'アリアンツ・リヴィエラ',
  'パリFC':'ジャン・ブアン',
  'PSG':'パルク・デ・プランス',
  'レンヌ':'ロアゾン・パルク',
  'ストラスブール':'スタッド・ド・ラ・メノ',
  'トゥールーズ':'スタジアム・ド・トゥールーズ',
  'トロワ':'スタッド・ド・ローブ'
};

check('Ligue 1 2026-27 venue block exists',!!block);
for(const [team,venue] of Object.entries(expected))check(`${team} -> ${venue}`,block.includes(`'${team}':'${venue}'`));
check('Ligue 1 registry has all 18 current clubs',Object.keys(expected).length===18&&Object.keys(expected).every(k=>block.includes(`'${k}':`)));
check('current Le Mans and Troyes grounds present',block.includes("'ル・マン':'マリー・マルヴァン'")&&block.includes("'トロワ':'スタッド・ド・ローブ'"));
check('relegated Nantes absent from current Ligue 1 venue block',!block.includes("'ナント':"));
check('relegated Metz absent from current Ligue 1 venue block',!block.includes("'メス':"));
check('Paris FC remains at Jean-Bouin',block.includes("'パリFC':'ジャン・ブアン'"));
check('Lens Bollaert-Delelis retained',block.includes("'ランス':'ボラール・デレリス'")&&src.includes("'Stade Bollaert-Delelis':'ボラール・デレリス'"));
check('PSG Parc des Princes retained',block.includes("'PSG':'パルク・デ・プランス'")&&src.includes("'Parc des Princes':'パルク・デ・プランス'"));

if(failed){console.error(`\nLigue 1 venue contract FAILED: ${failed}`);process.exit(1)}
console.log('\nLigue 1 2026-27 venue contract PASSED');
