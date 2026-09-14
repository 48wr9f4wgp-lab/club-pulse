const fs=require('fs');
const path=require('path');
const vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-data-policy-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
const check=(n,ok)=>{if(ok)console.log(`✓ ${n}`);else{console.error(`✗ ${n}`);failed++}};
function ctxFor({runsInApp=false,qa='post'}={}){
  const ctx={
    console,
    config:{runsInApp},
    qa,
    loadData:async d=>d,
    applyNextOverlay:async d=>d,
    applyLiveOverlay:async d=>d,
    refreshDelay:()=>0,
    buildMatchSmall:()=>null,
    statusTitle:()=>'',
    centerMainText:()=>'',
    metaLine:()=>'',
    applyTestMode:d=>({...d,mode:'POST',recentResult:d.nextMatch,simulated:true})
  };
  vm.createContext(ctx);
  vm.runInContext(src,ctx);
  return ctx
}
const base={mode:'NEXT',nextMatch:{utcDate:'2026-09-05T13:30:00.000Z'}};
let c=ctxFor({runsInApp:false,qa:'post'}),out=c.applyTestMode(base);
check('home-screen post suffix is suppressed',out.mode==='NEXT'&&!out.simulated&&out.qaModeSuppressed==='post');
c=ctxFor({runsInApp:false,qa:'live'});out=c.applyTestMode(base);
check('home-screen live suffix is suppressed',out.mode==='NEXT'&&!out.simulated&&out.qaModeSuppressed==='live');
c=ctxFor({runsInApp:false,qa:'offline'});out=c.applyTestMode(base);
check('resilience QA suffix is not blocked by simulated-match guard',out.simulated===true);
c=ctxFor({runsInApp:true,qa:'post'});out=c.applyTestMode(base);
check('in-app developer simulation remains available',out.mode==='POST'&&out.simulated===true);
check('RC QA menu exposes normal live post offline and nocache',launcher.includes("['通常表示','LIVE模擬','試合終了模擬','通信障害・保存あり','通信障害・保存なし']"));
check('RC QA menu maps LIVE and POST to in-app suffixes',launcher.includes("if(i===1)p=p+':live';else if(i===2)p=p+':post'"));
check('only outage QA modes persist to Home Screen override',launcher.includes("if(mode==='offline'||mode==='nocache')cpQaWrite"));
check('launcher documents LIVE POST preview-only behavior',launcher.includes('LIVE/POST remain in-app only and are never persisted to Home Screen'));
if(failed){console.error(`\nSimulation guard QA FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse simulation guard QA PASSED');
