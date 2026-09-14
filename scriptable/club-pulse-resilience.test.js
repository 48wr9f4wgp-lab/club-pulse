const fs=require('fs');
const path=require('path');
const vm=require('vm');

const src=fs.readFileSync(path.join(__dirname,'club-pulse-resilience-patch.js'),'utf8');

function makeContext(mode,cached){
  let persisted=[];
  let delegated=0;
  let nextDelegated=0;
  let liveDelegated=0;
  const context={
    console,JSON,Date,
    qa:mode,
    loadData:async()=>{delegated++;return{mode:'NEXT',fetchedAt:999,stale:false}},
    applyNextOverlay:async d=>{nextDelegated++;return{...d,nextProvider:'network'}},
    applyLiveOverlay:async d=>{liveDelegated++;return{...d,liveProvider:'network'}},
    errorWidget:()=>({base:true}),
    refreshDelay:()=>15*60*1000,
    statusTitle:d=>d.mode==='NEXT'?'次の試合':d.mode,
    readJSON:()=>cached,
    cachePath:()=>'/cache/data.json',
    cpCmNormalizeData:d=>({
      ...d,
      cacheSchema:'venue-2026-27-v1',
      nextMatch:d?.nextMatch?{...d.nextMatch,venue:d.nextMatch.venue==='会場未定'?'アリアンツ・スタジアム':d.nextMatch.venue}:d?.nextMatch
    }),
    cpCmPersist:d=>persisted.push(d),
    CP_MU_IS:()=>false,
    CP_ACTIVE_THEME:()=>null,
    CP_DESIGN_TOKENS:{shell:{text:'#F8FAFC'}},
    club:{badge:'X',jp:'X',p:'#000',s:'#000',team:1},
    CREST_SCALE:{},
    C:()=>({}),
    badge:()=>{},heavy:()=>({rightAlignText(){},centerAlignText(){}}),text:()=>({centerAlignText(){}}),
    ListWidget:function(){this.addStack=()=>({layoutHorizontally(){},centerAlignContent(){},addSpacer(){},setPadding(){},addStack(){return this}});this.addSpacer=()=>{};this.setPadding=()=>{}},
    gradient:()=>({}),family:'medium',bg:()=>({})
  };
  context.__state={
    persisted,
    get delegated(){return delegated},
    get nextDelegated(){return nextDelegated},
    get liveDelegated(){return liveDelegated}
  };
  vm.createContext(context);
  vm.runInContext(src,context);
  return context;
}

(async()=>{
  let failed=0;
  function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

  const oldCache={fetchedAt:123,mode:'NEXT',nextMatch:{opponentName:'ユベントス',venue:'会場未定',homeAway:'AWAY'}};
  const offline=makeContext('offline',oldCache);
  const out=await offline.loadData('token');
  check('offline QA serves cache',out.stale===true&&out.resilience==='cache');
  check('offline QA normalizes cached venue',out.nextMatch.venue==='アリアンツ・スタジアム');
  check('offline QA stamps migrated schema',out.cacheSchema==='venue-2026-27-v1');
  check('offline QA persists migration without network',offline.__state.persisted.length===1&&offline.__state.delegated===0);
  check('stale data retries after five minutes',offline.refreshDelay(out)===5*60*1000);
  const offNext=await offline.applyNextOverlay(out);
  const offLive=await offline.applyLiveOverlay(offNext);
  check('offline QA blocks next-provider overlay',offline.__state.nextDelegated===0&&!offLive.nextProvider);
  check('offline QA blocks live-provider overlay',offline.__state.liveDelegated===0&&!offLive.liveProvider);

  const past={...out,mode:'NEXT',stale:true,nextMatch:{...out.nextMatch,utcDate:new Date(Date.now()-60*1000).toISOString()}};
  const future={...out,mode:'NEXT',stale:true,nextMatch:{...out.nextMatch,utcDate:new Date(Date.now()+60*60*1000).toISOString()}};
  check('stale NEXT after kickoff becomes update-waiting',offline.statusTitle(past,past.nextMatch)==='更新待ち');
  check('stale NEXT before kickoff remains next match',offline.statusTitle(future,future.nextMatch)==='次の試合');

  const dort=makeContext('auto',oldCache);
  dort.CP_ACTIVE_THEME=()=>({text:'#121212',headerAccent:'#E6EAF0',accentSoft:'#2A2A2A'});
  check('Dortmund small shell header uses light headerAccent',dort.cpResTheme().title==='#E6EAF0');
  const generic=makeContext('auto',oldCache);
  generic.CP_ACTIVE_THEME=()=>({text:'#111111',accentSoft:'#222222'});
  check('generic small shell header falls back to shell text',generic.cpResTheme().title==='#F8FAFC');

  const nocache=makeContext('nocache',null);
  let threw=false;
  try{await nocache.loadData('token')}catch(e){threw=String(e.message).includes('QA forced network outage')}
  check('no-cache QA throws forced outage',threw);
  check('no-cache QA never delegates to network path',nocache.__state.delegated===0);

  const normal=makeContext('auto',oldCache);
  const normalOut=await normal.loadData('token');
  const normalNext=await normal.applyNextOverlay(normalOut);
  const normalLive=await normal.applyLiveOverlay(normalNext);
  check('normal mode delegates to production loadData',normal.__state.delegated===1&&normalOut.fetchedAt===999);
  check('normal mode delegates next overlay',normal.__state.nextDelegated===1&&normalLive.nextProvider==='network');
  check('normal mode delegates live overlay',normal.__state.liveDelegated===1&&normalLive.liveProvider==='network');
  check('normal fresh cadence remains unchanged',normal.refreshDelay(normalOut)===15*60*1000);

  if(failed){console.error(`\nResilience QA FAILED: ${failed}`);process.exit(1)}
  console.log('\nClub Pulse resilience, stale-state, and shell-contrast QA PASSED');
})().catch(e=>{console.error(e);process.exit(1)});
