// Club Pulse cache migration v1.
// Re-normalize persisted match objects when venue/readability rules evolve.
// This prevents old cached values such as 会場未定 or プレゼロ・アレーナ from bypassing the current venue registry.

const CP_CACHE_SCHEMA_VERSION='venue-2026-27-v1';
const CP_CM_BASE_LOAD_DATA=loadData;
const CP_CM_LEGACY_VENUES={
  'プレゼロ・アレーナ':'SNPアレーナ'
};

function cpCmNormalizeVenue(v){
  let n=String(v||'').trim();
  if(!n)return'';
  return CP_CM_LEGACY_VENUES[n]||CP_VENUE_DISPLAY_NAMES[n]||n
}

function cpCmNormalizeMatch(m){
  if(!m)return m;
  let out={...m};
  out.opponentName=cpCanonicalTeamName(out.opponentName);
  out.venue=cpCmNormalizeVenue(out.venue);
  if((!out.venue||out.venue==='会場未定')&&out.homeAway==='AWAY'){
    out.venue=CP_HOME_VENUE_BY_TEAM[out.opponentName]||'会場未定'
  }
  return out
}

function cpCmNormalizeData(d){
  if(!d)return d;
  return {
    ...d,
    cacheSchema:CP_CACHE_SCHEMA_VERSION,
    liveMatch:cpCmNormalizeMatch(d.liveMatch),
    recentResult:cpCmNormalizeMatch(d.recentResult),
    nextMatch:cpCmNormalizeMatch(d.nextMatch)
  }
}

function cpCmPersist(data){
  try{
    let stored={...data};
    delete stored.stale;
    writeJSON(cachePath(),stored)
  }catch{}
}

loadData=async function(t){
  let data=await CP_CM_BASE_LOAD_DATA(t);
  if(!data)return data;
  let before=JSON.stringify({
    cacheSchema:data.cacheSchema||null,
    liveMatch:data.liveMatch||null,
    recentResult:data.recentResult||null,
    nextMatch:data.nextMatch||null
  });
  let out=cpCmNormalizeData(data);
  let after=JSON.stringify({
    cacheSchema:out.cacheSchema,
    liveMatch:out.liveMatch||null,
    recentResult:out.recentResult||null,
    nextMatch:out.nextMatch||null
  });
  if(before!==after)cpCmPersist(out);
  return out
};
