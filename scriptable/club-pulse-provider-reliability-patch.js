// Club Pulse provider reliability v1.
// Wraps football-data.org calls with one conservative retry for transient failures only.
// Loaded after Data Policy so stale fallbacks can retain diagnostics without changing renderers.

const CP_PR_BASE_API=api;
const CP_PR_BASE_LOAD_DATA=loadData;
let CP_PR_LAST_ERROR=null;

function cpPrMessage(e){
  return String(e?.message||e||'unknown provider error').trim().slice(0,180)
}

function cpPrRetryable(e){
  const s=cpPrMessage(e).toLowerCase();
  return /(^|\D)429(\D|$)|request limit|rate limit|too many|throttl|timeout|timed out|network|connection|temporar|(^|\D)5\d\d(\D|$)|gateway|service unavailable/.test(s)
}

function cpPrDelay(e){
  const s=cpPrMessage(e).toLowerCase();
  return /429|request limit|rate limit|too many|throttl/.test(s)?6500:1400
}

function cpPrSleep(ms){
  return new Promise(resolve=>{
    if(typeof Timer!=='undefined'&&typeof Timer.schedule==='function')Timer.schedule(ms,false,resolve);
    else if(typeof setTimeout==='function')setTimeout(resolve,ms);
    else resolve()
  })
}

function cpPrRemember(endpoint,e,retried){
  CP_PR_LAST_ERROR={at:Date.now(),clubId:club?.id||null,endpoint:String(endpoint||''),message:cpPrMessage(e),retried:!!retried};
  try{writeJSON(path('provider_last_error.json'),CP_PR_LAST_ERROR)}catch{}
}

api=async function(endpoint,t){
  try{
    return await CP_PR_BASE_API(endpoint,t)
  }catch(e){
    if(!cpPrRetryable(e)){
      cpPrRemember(endpoint,e,false);
      throw e
    }
    await cpPrSleep(cpPrDelay(e));
    try{
      return await CP_PR_BASE_API(endpoint,t)
    }catch(e2){
      cpPrRemember(endpoint,e2,true);
      throw e2
    }
  }
};

loadData=async function(t){
  CP_PR_LAST_ERROR=null;
  const d=await CP_PR_BASE_LOAD_DATA(t);
  if(d?.stale&&CP_PR_LAST_ERROR){
    return{...d,providerError:CP_PR_LAST_ERROR.message,providerRetryAttempted:CP_PR_LAST_ERROR.retried}
  }
  return d
};
