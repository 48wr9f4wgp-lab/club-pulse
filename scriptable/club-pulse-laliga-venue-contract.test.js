const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-readability-guard-patch.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

const start=src.indexOf('// LaLiga 20');
const end=src.indexOf('// Bundesliga 18',start);
const block=start>=0&&end>start?src.slice(start,end):'';

const expected={
  'アラベス':'メンディソロッツァ',
  'アスレティック':'サン・マメス',
  'アトレティコ':'メトロポリターノ',
  'バルサ':'カンプ・ノウ',
  'セルタ':'バライードス',
  'デポルティーボ':'リアソール',
  'エルチェ':'マルティネス・バレーロ',
  'エスパニョール':'RCDEスタジアム',
  'ヘタフェ':'コリセウム',
  'レバンテ':'シウタ・デ・バレンシア',
  'マラガ':'ラ・ロサレーダ',
  'オサスナ':'エル・サダール',
  'ラシン':'エル・サルディネロ',
  'ラージョ':'エスタディオ・デ・バジェカス',
  'ベティス':'ラ・カルトゥハ',
  'レアル':'サンティアゴ・ベルナベウ',
  'ソシエダ':'レアレ・アレーナ',
  'セビージャ':'サンチェス・ピスフアン',
  'バレンシア':'メスタージャ',
  'ビジャレアル':'エスタディオ・デ・ラ・セラミカ'
};

check('LaLiga 2026-27 venue block exists',!!block);
for(const [team,venue] of Object.entries(expected))check(`${team} -> ${venue}`,block.includes(`'${team}':'${venue}'`));
check('LaLiga registry has all 20 current clubs',Object.keys(expected).length===20&&Object.keys(expected).every(k=>block.includes(`'${k}':`)));
check('promoted Racing Deportivo Malaga present',['ラシン','デポルティーボ','マラガ'].every(k=>block.includes(`'${k}':`)));
check('2025-26 relegated Girona absent from current LaLiga venue block',!block.includes("'ジローナ':"));
check('2025-26 relegated Mallorca absent from current LaLiga venue block',!block.includes("'マジョルカ':"));
check('2025-26 relegated Real Oviedo absent from current LaLiga venue block',!block.includes("'オビエド':"));
check('current sponsor aliases still normalize safely',src.includes("'Estadio Riyadh Air Metropolitano':'メトロポリターノ'")&&src.includes("'Spotify Camp Nou':'カンプ・ノウ'")&&src.includes("'Estadio ABANCA Balaídos':'バライードス'"));
check('current Betis temporary home is La Cartuja',block.includes("'ベティス':'ラ・カルトゥハ'"));
check('current promoted Deportivo and Racing grounds registered',block.includes("'デポルティーボ':'リアソール'")&&block.includes("'ラシン':'エル・サルディネロ'"));

if(failed){console.error(`\nLaLiga venue contract FAILED: ${failed}`);process.exit(1)}
console.log('\nLaLiga 2026-27 venue contract PASSED');
