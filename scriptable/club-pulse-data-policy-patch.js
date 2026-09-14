// Club Pulse data policy v8.
// Adaptive refresh/cache policy for multi-club home-screen operation.
// Goals: keep LIVE/near-kickoff data responsive, reduce provider traffic,
// share league standings and global LIVE snapshots, reserve API-Football quota,
// keep stale semantics honest, reject impossible future-result states,
// and prevent legacy simulated match modes from leaking onto Home Screen widgets.

const CP_DP_BASE_LOAD_DATA=loadData,
      CP_DP_BASE_NEXT_OVERLAY=applyNextOverlay,
      CP_DP_BASE_LIVE_OVERLAY=applyLiveOverlay,
      CP_DP_BASE_REFRESH_DELAY=refreshDelay,
      CP_DP_BASE_BUILD_MATCH_SMALL=buildMatchSmall,
      CP_DP_BASE_STATUS_TITLE=statusTitle,
      CP_DP_BASE_CENTER_MAIN=centerMainText,
      CP_DP_BASE_META_LINE=metaLine,
      CP_DP_BASE_APPLY_TEST_MODE=typeof applyTestMode==='function'?applyTestMode:(d=>d);

const CP_DP_STANDINGS_TTL=30*60*1000;
const CP_DP_NEXT_OVERLAY_TTL=12*60*60*1000;
const CP_DP_NEXT_QUOTA_CEILING=40;
const CP_DP_GLOBAL_LIVE_TTL=3*60*1000;
const CP_DP_SIMULATED_MATCH_MODES=['live','post','cl','fa','efl'];

function cpDpForcedOutage(){
  return typeof cpResForcedOutage==='function'&&cpResForcedOutage()
}

function cpDpNormalize(d){
  if(!d)return d;
  return typeof cpCmNormalizeData==='function'?cpCmNormalizeData(d):d
}

function cpDpKickoffMs(d){
  const m=d?.mode==='LIVE'?d.liveMatch:d?.mode==='POST'?d.recentResult:d?.nextMatch;
  if(!m?.utcDate)return 0;
  const t=new Date(m.utcDate).getTime();
  return Number.isFinite(t)?t:0
}

function cpDpMatchTtl(d){
  if(d?.mode==='LIVE')return 3*60*1000;
  if(d?.mode==='POST')return 10*60*1000;
  const t=cpDpKickoffMs(d);
  if(!t)return 60*60*1000;
  const delta=t-Date.now();
  if(delta<=30*60*1000)return 3*60*1000;
  if(delta<=2*60*60*1000)return 5*60*1000;
  if(delta<=12*60*60*1000)return 15*60*1000;
  if(delta<=48*60*60*1000)return 30*60*1000;
  return 60*60*1000
}

function cpDpStandingsPath(){
  return path(`standings_${String(club.comp||'league').toLowerCase()}.json`)
}

function cpDpCachedStandings(){
  const c=readJSON(cpDpStandingsPath());
  return c?.payload||null
}

async function cpDpStandings(t){
  const p=cpDpStandingsPath(),c=readJSON(p),now=Date.now();
  if(c?.payload&&now-c.fetchedAt<CP_DP_STANDINGS_TTL)return c.payload;
  try{
    const payload=await api(`/competitions/${club.comp}/standings`,t);
    writeJSON(p,{fetchedAt:Date.now(),payload});
    return payload
  }catch{
    return c?.payload||null
  }
}

function cpDpApplyStanding(d,sj){
  if(!d||!sj)return d;
  const row=standing(sj);
  if(!row)return d;
  return{...d,rank:row.position??d.rank,points:row.points??d.points}
}

async function cpDpFetchMatches(t){
  const d=new Date(),from=ymd(addDays(d,-120)),to=ymd(addDays(d,120));
  return api(`/teams/${club.team}/matches?dateFrom=${from}&dateTo=${to}&limit=100`,t)
}

function cpDpIsFutureResult(m,now=Date.now()){
  if(m?.status!=='FINISHED'||!m?.utcDate)return false;
  const t=new Date(m.utcDate).getTime();
  return Number.isFinite(t)&&t>now
}

function cpDpFutureAsScheduled(m){
  const score={...(m?.score||{})};
  for(const k of['fullTime','regularTime','halfTime','extraTime','penalties']){
    if(score[k])score[k]={...score[k],home:null,away:null}
  }
  return{...m,status:'SCHEDULED',score}
}

function cpDpTemporalizeMatches(mj){
  if(!Array.isArray(mj?.matches))return mj;
  const now=Date.now();
  return{...mj,matches:mj.matches.map(m=>cpDpIsFutureResult(m,now)?cpDpFutureAsScheduled(m):m)}
}

function cpDpSanitizeTemporal(d){
  if(!d)return d;
  if(d.mode==='POST'&&d.recentResult?.utcDate){
    const t=new Date(d.recentResult.utcDate).getTime();
    if(Number.isFinite(t)&&t>Date.now()){
      const m={...d.recentResult,status:'SCHEDULED',minute:null,ourScore:null,opponentScore:null,result:null};
      return{...d,mode:'NEXT',nextMatch:m,recentResult:null,liveMatch:null,futureResultCorrected:true}
    }
  }
  return d
}

function cpDpSanitizeStale(d){
  d=cpDpSanitizeTemporal(d);
  if(!d?.stale)return d;
  if(d.mode==='LIVE'&&d.liveMatch?.utcDate){
    const kickoff=new Date(d.liveMatch.utcDate).getTime();
    if(Number.isFinite(kickoff)&&Date.now()>=kickoff+4*60*60*1000){
      const m={...d.liveMatch,minute:null,ourScore:null,opponentScore:null};
      return{...d,mode:'NEXT',nextMatch:m,liveMatch:null,liveExpired:true}
    }
  }
  if(d.mode==='POST'&&d.recentResult?.utcDate&&d.nextMatch){
    const resultKickoff=new Date(d.recentResult.utcDate).getTime();
    const postWindow=typeof POST==='number'?POST:10*60*60*1000;
    if(Number.isFinite(resultKickoff)&&Date.now()>=resultKickoff+postWindow){
      return{...d,mode:'NEXT',postExpired:true}
    }
  }
  return d
}

loadData=async function(t){
  if(cpDpForcedOutage())return cpDpSanitizeStale(await CP_DP_BASE_LOAD_DATA(t));

  let cached=cpDpSanitizeTemporal(cpDpNormalize(readJSON(cachePath())));
  const now=Date.now(),ttl=cpDpMatchTtl(cached);
  const standingsPromise=cpDpStandings(t);
  if(cached&&Number.isFinite(cached.fetchedAt)&&now-cached.fetchedAt<ttl){
    const sj=await standingsPromise;
    return cpDpApplyStanding({...cached,stale:false,dataPolicy:'cache'},sj)
  }

  try{
    const [matches,sj]=await Promise.all([cpDpFetchMatches(t),standingsPromise]);
    let fresh=cpDpSanitizeTemporal(mapData(cpDpTemporalizeMatches(matches),sj||{}));
    if(!sj&&cached)fresh={...fresh,rank:cached.rank,points:cached.points};
    writeJSON(cachePath(),fresh);
    return{...fresh,stale:false,dataPolicy:'network'}
  }catch(e){
    if(cached){
      const sj=cpDpCachedStandings();
      return cpDpSanitizeStale(cpDpApplyStanding({...cached,stale:true,dataPolicy:'stale'},sj))
    }
    throw e
  }
};

function cpDpQuotaCount(){
  try{
    const q=readJSON(quotaPath(),{day:'',count:0}),today=fmt(new Date(),'yyyy-MM-dd');
    return q?.day===today?Number(q.count||0):0
  }catch{return 0}
}

applyNextOverlay=async function(d){
  if(cpDpForcedOutage())return CP_DP_BASE_NEXT_OVERLAY(d);
  const c=readJSON(nextPath());
  if(c&&Date.now()-c.fetchedAt<CP_DP_NEXT_OVERLAY_TTL&&Object.prototype.hasOwnProperty.call(c,'match')){
    return c.match?chooseNext(d,c.match):d
  }
  if(cpDpQuotaCount()>=CP_DP_NEXT_QUOTA_CEILING)return{...d,nextProvider:d.nextProvider||'quota-conserve'};
  return CP_DP_BASE_NEXT_OVERLAY(d)
};

function cpDpGlobalLivePath(){return path('live_global.json')}

async function cpDpGlobalLiveRows(token){
  const p=cpDpGlobalLivePath(),c=readJSON(p),now=Date.now();
  if(c&&now-c.fetchedAt<CP_DP_GLOBAL_LIVE_TTL&&Array.isArray(c.rows))return c.rows;
  const j=await liveApi('/fixtures?live=all',token),rows=Array.isArray(j?.response)?j.response:[];
  writeJSON(p,{fetchedAt:Date.now(),rows});
  return rows
}

function cpDpFindLiveByName(rows){
  const q=String(club?.liveSearch||'').trim().toLowerCase();
  if(!q)return null;
  for(const fixture of rows||[]){
    const home=fixture?.teams?.home,away=fixture?.teams?.away;
    if(String(home?.name||'').trim().toLowerCase()===q)return{fixture,teamId:home?.id||null};
    if(String(away?.name||'').trim().toLowerCase()===q)return{fixture,teamId:away?.id||null}
  }
  return null
}

async function cpDpFindLive(rows,token){
  const named=cpDpFindLiveByName(rows);
  if(named?.teamId)return named;
  const teamId=await resolveLiveTeamId(token);
  if(!teamId)return null;
  const fixture=(rows||[]).find(x=>x?.teams?.home?.id===teamId||x?.teams?.away?.id===teamId)||null;
  return fixture?{fixture,teamId}:null
}

applyLiveOverlay=async function(d){
  if(cpDpForcedOutage())return CP_DP_BASE_LIVE_OVERLAY(d);
  const token=getLiveToken();
  if(!token||!shouldCheckLive(d))return{...d,liveProvider:token?'ready':'unconfigured'};
  try{
    const rows=await cpDpGlobalLiveRows(token),hit=await cpDpFindLive(rows,token);
    if(!hit?.fixture)return{...d,liveProvider:'ready'};
    const m=mapApiFixture(hit.fixture,hit.teamId,true);
    return{...d,mode:'LIVE',liveMatch:m,clubCrest:m.clubCrest||d.clubCrest,liveProvider:'apiFootball-global'}
  }catch{
    return{...d,liveProvider:'error'}
  }
};

refreshDelay=function(d){
  if(d?.stale)return 5*60*1000;
  return cpDpMatchTtl(d)
};

function cpDpSmallWaiting(d){
  if(!d?.stale||d.mode!=='NEXT'||!d.nextMatch?.utcDate)return false;
  const t=new Date(d.nextMatch.utcDate).getTime();
  return Number.isFinite(t)&&Date.now()>=t
}

buildMatchSmall=function(w,d,imgs){
  if(cpDpSmallWaiting(d))return CP_DP_BASE_BUILD_MATCH_SMALL(w,{...d,mode:'STALE_NEXT',cpSmallWaiting:true},imgs);
  return CP_DP_BASE_BUILD_MATCH_SMALL(w,d,imgs)
};

statusTitle=function(d,m){
  if(d?.cpSmallWaiting)return'更新待ち';
  return CP_DP_BASE_STATUS_TITLE(d,m)
};

centerMainText=function(d,m){
  if(d?.cpSmallWaiting)return'VS';
  return CP_DP_BASE_CENTER_MAIN(d,m)
};

metaLine=function(d,m){
  if(d?.cpSmallWaiting)return`${m.kickoff} ・ ${m.venue}`;
  return CP_DP_BASE_META_LINE(d,m)
};

function cpDpSuppressWidgetSimulation(){
  const mode=String(typeof qa==='string'?qa:'auto').trim().toLowerCase();
  return !config.runsInApp&&CP_DP_SIMULATED_MATCH_MODES.includes(mode)
}

applyTestMode=function(d){
  if(cpDpSuppressWidgetSimulation())return{...d,qaModeSuppressed:String(qa||'').toLowerCase()};
  return CP_DP_BASE_APPLY_TEST_MODE(d)
};
