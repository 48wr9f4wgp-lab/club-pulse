const fs=require('fs');
const path=require('path');
const vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-provider-reliability-patch.js'),'utf8');

function makeContext(sequence){
  let calls=0,delays=[],writes=[];
  const ctx={
    console,JSON,Object,Promise,Date,
    club:{id:'manutd'},
    path:n=>`/cache/${n}`,
    writeJSON:(p,v)=>writes.push({p,v}),
    Timer:{schedule:(ms,_repeat,cb)=>{delays.push(ms);cb()}},
    api:async()=>{const x=sequence[Math.min(calls++,sequence.length-1)];if(x instanceof Error)throw x;return x},
    loadData:async t=>{try{return{...(await ctx.api('/teams/66/matches',t)),stale:false}}catch{return{fetchedAt:1,stale:true}}}
  };
  ctx.__state={get calls(){return calls},delays,writes};
  vm.createContext(ctx);vm.runInContext(src,ctx);return ctx
}

(async()=>{
  let failed=0;const check=(n,ok)=>{if(ok)console.log(`✓ ${n}`);else{console.error(`✗ ${n}`);failed++}};
  let c=makeContext([new Error('429 request limit reached'),{ok:true}]);
  let out=await c.loadData('t');
  check('transient rate limit retries once',c.__state.calls===2&&out.stale===false);
  check('rate limit retry uses conservative delay',c.__state.delays[0]===6500);

  c=makeContext([new Error('503 Service Unavailable'),{ok:true}]);
  out=await c.loadData('t');
  check('transient 5xx retries once',c.__state.calls===2&&out.stale===false);
  check('generic transient retry uses short delay',c.__state.delays[0]===1400);

  c=makeContext([new Error('403 restricted resource')]);
  out=await c.loadData('t');
  check('permanent provider error is not retried',c.__state.calls===1&&out.stale===true);
  check('stale result carries diagnostic message',out.providerError==='403 restricted resource'&&out.providerRetryAttempted===false);
  check('last provider error is persisted without credentials',c.__state.writes.some(x=>x.p.endsWith('provider_last_error.json')&&x.v.clubId==='manutd'));

  c=makeContext([new Error('429 request limit'),new Error('429 request limit')]);
  out=await c.loadData('t');
  check('failed retry falls back stale with retry marker',c.__state.calls===2&&out.stale===true&&out.providerRetryAttempted===true);

  if(failed){console.error(`\nProvider reliability QA FAILED: ${failed}`);process.exit(1)}
  console.log('\nClub Pulse provider reliability QA PASSED')
})().catch(e=>{console.error(e);process.exit(1)});
