const fs=require('fs');
const path=require('path');
const vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'club-pulse-data-policy-patch.js'),'utf8');

function makeContext({now=Date.now(),mode='NEXT',kickoffMs=now+72*3600e3,cachedAge=10*60e3,nextCache=null,quotaCount=0,liveRows=null}={}){
  const RealDate=Date;
  class FakeDate extends RealDate{constructor(v){super(v===undefined?now:v)}static now(){return now}}
  let apiCalls=[],baseNextCalls=0,baseLiveCalls=0,liveApiCalls=0,resolveCalls=0,writes=[];
  const cached={fetchedAt:now-cachedAge,mode,rank:9,points:12,stale:false,nextMatch:{utcDate:new RealDate(kickoffMs).toISOString(),kickoff:'9/1(火) 04:00',venue:'テスト会場',opponentName:'X'},liveMatch:mode==='LIVE'?{utcDate:new RealDate(kickoffMs).toISOString(),kickoff:'9/1(火) 04:00',venue:'テスト会場',ourScore:2,opponentScore:1,minute:"67'"}:null,recentResult:mode==='POST'?{utcDate:new RealDate(kickoffMs).toISOString(),kickoff:'9/1(火) 04:00',venue:'テスト会場',ourScore:2,opponentScore:1,result:'W'}:null};
  const standings={standings:[{type:'TOTAL',table:[{team:{id:66},position:4,points:21}]}]};
  const defaultLiveRows=liveRows??[{fixture:{id:777,date:new RealDate(kickoffMs).toISOString(),status:{short:'2H',elapsed:67},venue:{name:'Old Trafford'}},league:{name:'Premier League'},teams:{home:{id:33,name:'Manchester United',logo:'mu'},away:{id:44,name:'Everton',logo:'eve'}},goals:{home:2,away:1}}];
  const store={'/cache/data_manutd.json':cached,'/cache/standings_pl.json':{fetchedAt:now-5*60e3,payload:standings},'/cache/api_football_quota.json':{day:'2026-08-31',count:quotaCount}};
  if(nextCache!==null)store['/cache/next_all_manutd.json']=nextCache;
  const ctx={
    console,JSON,Object,Date:FakeDate,POST:10*60*60e3,
    club:{comp:'PL',team:66,liveSearch:'Manchester United'},
    loadData:async()=>({...cached,stale:true,resilience:'cache'}),
    applyNextOverlay:async d=>{baseNextCalls++;return{...d,baseNext:true}},
    applyLiveOverlay:async d=>{baseLiveCalls++;return{...d,baseLive:true}},
    refreshDelay:()=>15*60e3,
    buildMatchSmall:(w,d)=>d,
    statusTitle:d=>d.mode==='LIVE'?'試合中':d.mode==='POST'?'試合終了':'次の試合',
    centerMainText:d=>d.mode==='NEXT'?'VS':'2-1',
    metaLine:(d,m)=>d.mode==='NEXT'?`${m.kickoff} ・ ${m.venue}`:`${m.venue}`,
    cpResForcedOutage:()=>false,
    cpCmNormalizeData:d=>d,
    readJSON:p=>store[String(p)]??null,
    writeJSON:(p,v)=>{store[String(p)]=v;writes.push({p:String(p),v})},
    path:n=>`/cache/${n}`,
    cachePath:()=>'/cache/data_manutd.json',nextPath:()=>'/cache/next_all_manutd.json',quotaPath:()=>'/cache/api_football_quota.json',
    fmt:(d,f)=>f==='yyyy-MM-dd'?'2026-08-31':'FMT',
    NEXT_TTL:6*3600e3,TTL_LIVE:3*60e3,
    addDays:(d,n)=>new RealDate(d.getTime()+n*864e5),ymd:d=>d.toISOString().slice(0,10),
    api:async p=>{apiCalls.push(p);if(p.includes('/matches?'))return{matches:[]};if(p.includes('/standings'))return standings;throw new Error('unexpected')},
    liveApi:async p=>{liveApiCalls++;if(p==='/fixtures?live=all')return{response:defaultLiveRows};throw new Error('unexpected live call')},
    getLiveToken:()=> 'live-token',shouldCheckLive:()=>true,resolveLiveTeamId:async()=>{resolveCalls++;return 33},
    mapApiFixture:(f,teamId)=>({id:f.fixture.id,utcDate:f.fixture.date,kickoff:'9/1(火) 04:00',venue:f.fixture.venue.name,minute:"67'",ourScore:teamId===f.teams.home.id?f.goals.home:f.goals.away,opponentScore:teamId===f.teams.home.id?f.goals.away:f.goals.home,clubCrest:'mu'}),
    standing:sj=>sj?.standings?.[0]?.table?.[0]||null,
    mapData:(m,sj)=>({fetchedAt:now,mode:'NEXT',rank:sj?.standings?.[0]?.table?.[0]?.position??null,points:sj?.standings?.[0]?.table?.[0]?.points??null,nextMatch:{utcDate:new RealDate(kickoffMs).toISOString(),kickoff:'9/1(火) 04:00',venue:'テスト会場'}}),
    chooseNext:(d,m)=>({...d,nextMatch:m,chosen:true})
  };
  Object.defineProperty(ctx,'updated',{value:()=> 'BASE',writable:false,configurable:false});
  ctx.__state={apiCalls,writes,store,get baseNextCalls(){return baseNextCalls},get baseLiveCalls(){return baseLiveCalls},get liveApiCalls(){return liveApiCalls},get resolveCalls(){return resolveCalls},cached};
  vm.createContext(ctx);vm.runInContext(src,ctx);return ctx
}

(async()=>{
  let failed=0;const check=(n,ok)=>{if(ok)console.log(`✓ ${n}`);else{console.error(`✗ ${n}`);failed++}};
  let c=makeContext();
  check('policy loads with readonly core updated binding',c.updated()==='BASE');
  check('far fixture cadence is one hour',c.refreshDelay(c.__state.cached)===60*60e3);
  let out=await c.loadData('t');
  check('far fresh match cache avoids match request',!c.__state.apiCalls.some(x=>x.includes('/matches?')));
  check('shared standings overlay updates rank and points',out.rank===4&&out.points===21);

  c=makeContext({kickoffMs:Date.now()+20*60e3,cachedAge:4*60e3});out=await c.loadData('t');
  check('near kickoff cache older than three minutes refreshes match data',c.__state.apiCalls.some(x=>x.includes('/matches?')));
  check('near kickoff cadence is three minutes',c.refreshDelay(out)===3*60e3);

  const now=Date.now();
  c=makeContext({now,nextCache:{fetchedAt:now-10*3600e3,match:null}});out=await c.applyNextOverlay(c.__state.cached);
  check('12h negative next cache suppresses repeat call',c.__state.baseNextCalls===0&&!out.baseNext);
  c=makeContext({now,nextCache:{fetchedAt:now-13*3600e3,match:null},quotaCount:40});out=await c.applyNextOverlay(c.__state.cached);
  check('quota ceiling preserves LIVE reserve',c.__state.baseNextCalls===0&&out.nextProvider==='quota-conserve');
  c=makeContext({now,nextCache:{fetchedAt:now-13*3600e3,match:null},quotaCount:39});out=await c.applyNextOverlay(c.__state.cached);
  check('below quota ceiling supplemental next may run',c.__state.baseNextCalls===1&&out.baseNext===true);

  c=makeContext({now,kickoffMs:now+10*60e3});out=await c.applyLiveOverlay(c.__state.cached);
  check('global live snapshot produces LIVE mode',out.mode==='LIVE'&&out.liveProvider==='apiFootball-global'&&out.liveMatch.ourScore===2);
  check('first live widget performs one global request',c.__state.liveApiCalls===1);
  check('exact liveSearch match avoids team-id lookup call',c.__state.resolveCalls===0);
  out=await c.applyLiveOverlay(c.__state.cached);
  check('second widget-cycle reuses three-minute global snapshot',c.__state.liveApiCalls===1&&out.mode==='LIVE');

  c=makeContext({now,kickoffMs:now+10*60e3,liveRows:[]});await c.applyLiveOverlay(c.__state.cached);out=await c.applyLiveOverlay(c.__state.cached);
  check('empty global live result is negative-cached too',c.__state.liveApiCalls===1&&out.liveProvider==='ready');

  c=makeContext({now,mode:'LIVE',kickoffMs:now-5*3600e3,cachedAge:5*60e3});c.cpResForcedOutage=()=>true;out=await c.loadData('t');
  check('expired stale LIVE degrades to neutral NEXT',out.mode==='NEXT'&&out.liveExpired===true&&out.nextMatch.ourScore===null);
  check('stale data retries after five minutes',c.refreshDelay({...out,stale:true})===5*60e3);

  c=makeContext({now});
  out=c.cpDpSanitizeStale({stale:true,mode:'POST',recentResult:{utcDate:new Date(now-11*3600e3).toISOString()},nextMatch:{utcDate:new Date(now+48*3600e3).toISOString()}});
  check('expired stale POST yields cached NEXT fixture',out.mode==='NEXT'&&out.postExpired===true);

  c=makeContext({now});
  const futureRaw={matches:[{status:'FINISHED',utcDate:new Date(now+48*3600e3).toISOString(),score:{fullTime:{home:2,away:1}}}]};
  const guarded=c.cpDpTemporalizeMatches(futureRaw);
  check('future FINISHED provider row is reclassified to SCHEDULED',guarded.matches[0].status==='SCHEDULED');
  check('future FINISHED provider score is cleared',guarded.matches[0].score.fullTime.home===null&&guarded.matches[0].score.fullTime.away===null);
  const futurePost={fetchedAt:now-60e3,stale:false,mode:'POST',recentResult:{utcDate:new Date(now+48*3600e3).toISOString(),kickoff:'9/3(木) 22:30',ourScore:2,opponentScore:1,result:'W'},nextMatch:null};
  out=c.cpDpSanitizeTemporal(futurePost);
  check('cached future POST is repaired to NEXT',out.mode==='NEXT'&&out.futureResultCorrected===true&&out.recentResult===null);
  check('repaired future POST removes result payload',out.nextMatch.ourScore===null&&out.nextMatch.opponentScore===null&&out.nextMatch.result===null);

  c=makeContext({now,kickoffMs:now-60*1000});const staleNext={...c.__state.cached,stale:true};const small=c.buildMatchSmall(null,staleNext,{});
  check('small stale NEXT becomes waiting state',small.mode==='STALE_NEXT'&&small.cpSmallWaiting===true);
  check('small waiting label and center are neutral',c.statusTitle(small,small.nextMatch)==='更新待ち'&&c.centerMainText(small,small.nextMatch)==='VS');
  check('small waiting keeps metadata',c.metaLine(small,small.nextMatch)==='9/1(火) 04:00 ・ テスト会場');

  if(failed){console.error(`\nData policy QA FAILED: ${failed}`);process.exit(1)}
  console.log('\nClub Pulse data policy QA PASSED')
})().catch(e=>{console.error(e);process.exit(1)});