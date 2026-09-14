const fs=require('fs');
const path=require('path');
const vm=require('vm');

const src=fs.readFileSync(path.join(__dirname,'club-pulse-cache-migration-patch.js'),'utf8');
let writes=[];
const sample={
  fetchedAt:123,
  stale:true,
  liveMatch:{opponentName:'ホッフェンハイム',venue:'プレゼロ・アレーナ',homeAway:'AWAY'},
  recentResult:{opponentName:'シャルケ',venue:'会場未定',homeAway:'AWAY'},
  nextMatch:{opponentName:'ユベントス',venue:'会場未定',homeAway:'AWAY'}
};
const context={
  console,JSON,
  loadData:async()=>({...sample}),
  CP_VENUE_DISPLAY_NAMES:{'PreZero Arena':'SNPアレーナ'},
  CP_HOME_VENUE_BY_TEAM:{
    'ホッフェンハイム':'SNPアレーナ',
    'シャルケ':'フェルティンス・アレーナ',
    'ユベントス':'アリアンツ・スタジアム'
  },
  cpCanonicalTeamName:n=>n,
  cachePath:()=>'/cache/data.json',
  writeJSON:(p,v)=>writes.push({p,v})
};
vm.createContext(context);
vm.runInContext(src,context);

(async()=>{
  const out=await context.loadData('token');
  let failed=0;
  function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}
  check('cache migration patch syntax and loadData override',typeof context.loadData==='function');
  check('legacy PreZero Japanese value migrates to SNP Arena',out.liveMatch.venue==='SNPアレーナ');
  check('missing Schalke cached venue is inferred',out.recentResult.venue==='フェルティンス・アレーナ');
  check('missing Juventus cached venue is inferred',out.nextMatch.venue==='アリアンツ・スタジアム');
  check('stale render state is preserved',out.stale===true);
  check('cache schema version is stamped',out.cacheSchema==='venue-2026-27-v1');
  check('migrated cache is persisted once',writes.length===1&&writes[0].p==='/cache/data.json');
  check('transient stale flag is not persisted',writes.length===1&&!Object.prototype.hasOwnProperty.call(writes[0].v,'stale'));
  if(failed){console.error(`\nCache migration QA FAILED: ${failed}`);process.exit(1)}
  console.log('\nClub Pulse cached venue migration QA PASSED');
})().catch(e=>{console.error(e);process.exit(1)});
