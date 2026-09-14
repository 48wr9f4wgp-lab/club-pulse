const fs=require('fs');
const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-readability-guard-patch.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

const start=src.indexOf('// Bundesliga 18');
const end=src.indexOf('// Serie A 20',start);
const block=start>=0&&end>start?src.slice(start,end):'';

const expected={
  'アウクスブルク':'WWKアレーナ',
  'ウニオン・ベルリン':'アルテ・フェルステライ',
  'ブレーメン':'ヴェーザーシュタディオン',
  'ドルトムント':'ジグナル・イドゥナ・パルク',
  'エルヴァースベルク':'ウルザファーム・アレーナ',
  'フランクフルト':'ドイチェ・バンク・パルク',
  'フライブルク':'ヨーロッパ・パルク・シュタディオン',
  'ハンブルク':'フォルクスパルクシュタディオン',
  'ホッフェンハイム':'SNPアレーナ',
  'ケルン':'ラインエネルギーシュタディオン',
  'ライプツィヒ':'レッドブル・アレーナ',
  'レヴァークーゼン':'バイアレーナ',
  'マインツ':'MEWAアレーナ',
  'ボルシアMG':'ボルシア・パルク',
  'バイエルン':'アリアンツ・アレーナ',
  'パーダーボルン':'ホーム・デラックス・アレーナ',
  'シャルケ':'フェルティンス・アレーナ',
  'シュトゥットガルト':'MHPアレーナ'
};

check('Bundesliga 2026-27 venue block exists',!!block);
for(const [team,venue] of Object.entries(expected)){
  check(`${team} -> ${venue}`,block.includes(`'${team}':'${venue}'`));
}
check('Bundesliga registry has all 18 current clubs',Object.keys(expected).length===18&&Object.keys(expected).every(k=>block.includes(`'${k}':`)));
check('2025-26 relegated Wolfsburg absent from current Bundesliga venue block',!block.includes("'ヴォルフスブルク':"));
check('2025-26 relegated Heidenheim absent from current Bundesliga venue block',!block.includes("'ハイデンハイム':"));
check('2025-26 relegated St Pauli absent from current Bundesliga venue block',!block.includes("'ザンクト・パウリ':"));
check('promoted Schalke Elversberg Paderborn present',block.includes("'シャルケ':")&&block.includes("'エルヴァースベルク':")&&block.includes("'パーダーボルン':"));
check('Hoffenheim current venue is SNP Arena',block.includes("'ホッフェンハイム':'SNPアレーナ'"));
check('legacy PreZero provider name normalizes to current SNP Arena',src.includes("'PreZero Arena':'SNPアレーナ'"));
check('official SNP provider name localizes correctly',src.includes("'SNP Arena':'SNPアレーナ'"));

if(failed){console.error(`\nBundesliga venue contract FAILED: ${failed}`);process.exit(1)}
console.log('\nBundesliga 2026-27 venue contract PASSED');
