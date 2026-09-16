// Club Pulse provider reliability v2.
// Wraps football-data.org calls with one conservative retry for transient failures only.
// Loaded after Data Policy so stale fallbacks can retain diagnostics without changing renderers.
// Uses a provider-specific namespace to avoid collisions with Previous Result (CP_PR_*).

const CP_PROV_BASE_API=api;
const CP_PROV_BASE_LOAD_DATA=loadData;
let CP_PROV_LAST_ERROR=null;

function cpProvMessage(e){
  return String(e?.message||e||'unknown provider error').trim().slice(0,180)
}

function cpProvRetryable(e){
  const s=cpProvMessage(e).toLowerCase();
  return /(^|\D)429(\D|$)|request limit|rate limit|too many|throttl|timeout|timed out|network|connection|temporar|(^|\D)5\d\d(\D|$)|gateway|service unavailable/.test(s)
}

function cpProvDelay(e){
  const s=cpProvMessage(e).toLowerCase();
  return /429|request limit|rate limit|too many|throttl/.test(s)?6500:1400
}

function cpProvSleep(ms){
  return new Promise(resolve=>{
    if(typeof Timer!=='undefined'&&typeof Timer.schedule==='function')Timer.schedule(ms,false,resolve);
    else if(typeof setTimeout==='function')setTimeout(resolve,ms);
    else resolve()
  })
}

function cpProvRemember(endpoint,e,retried){
  CP_PROV_LAST_ERROR={at:Date.now(),clubId:club?.id||null,endpoint:String(endpoint||''),message:cpProvMessage(e),retried:!!retried};
  try{writeJSON(path('provider_last_error.json'),CP_PROV_LAST_ERROR)}catch{}
}

api=async function(endpoint,t){
  try{
    return await CP_PROV_BASE_API(endpoint,t)
  }catch(e){
    if(!cpProvRetryable(e)){
      cpProvRemember(endpoint,e,false);
      throw e
    }
    await cpProvSleep(cpProvDelay(e));
    try{
      return await CP_PROV_BASE_API(endpoint,t)
    }catch(e2){
      cpProvRemember(endpoint,e2,true);
      throw e2
    }
  }
};

loadData=async function(t){
  CP_PROV_LAST_ERROR=null;
  const d=await CP_PROV_BASE_LOAD_DATA(t);
  if(d?.stale&&CP_PROV_LAST_ERROR){
    return{...d,providerError:CP_PROV_LAST_ERROR.message,providerRetryAttempted:CP_PROV_LAST_ERROR.retried}
  }
  return d
};
