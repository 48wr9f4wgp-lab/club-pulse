const CP_LIVE_CONTEXT_BASE_META=metaLine;
function cpLiveContext(m){
  if(!m)return'';
  const side=m.homeAway==='AWAY'?'アウェイ':'ホーム';
  const venue=String(m.venue||'').trim();
  return venue&&venue!=='会場未定'?`${side} ・ ${venue}`:side
}
metaLine=function(d,m){
  if(d?.mode==='LIVE')return cpLiveContext(m);
  return CP_LIVE_CONTEXT_BASE_META(d,m)
};

const CP_LIVE_CONTEXT_BASE_SMALL=buildMatchSmall;
buildMatchSmall=function(w,d,imgs){
  if(d?.mode!=='LIVE'||!d.liveMatch)return CP_LIVE_CONTEXT_BASE_SMALL(w,d,imgs);
  const m=d.liveMatch,oldKickoff=m.kickoff;
  m.kickoff=cpLiveContext(m);
  try{return CP_LIVE_CONTEXT_BASE_SMALL(w,d,imgs)}
  finally{m.kickoff=oldKickoff}
};
