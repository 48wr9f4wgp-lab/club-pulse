// Club Pulse resilience v6.
// Forced outage QA follows the same normalized cache contract as a real provider failure,
// blocks secondary network providers, prevents stale pre-match cache from being presented
// as a trustworthy upcoming fixture after kickoff, and keeps shell text readable for every theme.

const CP_RES_BASE_LOAD_DATA=loadData,
      CP_RES_BASE_NEXT_OVERLAY=applyNextOverlay,
      CP_RES_BASE_LIVE_OVERLAY=applyLiveOverlay,
      CP_RES_BASE_ERROR_WIDGET=errorWidget,
      CP_RES_BASE_REFRESH_DELAY=refreshDelay,
      CP_RES_BASE_STATUS_TITLE=statusTitle;

function cpResForcedOutage(){return qa==='offline'||qa==='nocache'}

function cpResNormalizeCached(cached){
  if(!cached)return cached;
  if(typeof cpCmNormalizeData!=='function')return cached;
  let normalized=cpCmNormalizeData(cached);
  try{
    if(JSON.stringify(normalized)!==JSON.stringify(cached)&&typeof cpCmPersist==='function')cpCmPersist(normalized)
  }catch{}
  return normalized
}

loadData=async function(t){
  if(cpResForcedOutage()){
    const cached=readJSON(cachePath());
    const forced=new Error('QA forced network outage');
    if(qa==='offline'&&cached){
      const normalized=cpResNormalizeCached(cached);
      return{...normalized,stale:true,resilience:'cache'}
    }
    throw forced;
  }
  return CP_RES_BASE_LOAD_DATA(t)
};

applyNextOverlay=async function(d){
  if(cpResForcedOutage())return d;
  return CP_RES_BASE_NEXT_OVERLAY(d)
};

applyLiveOverlay=async function(d){
  if(cpResForcedOutage())return d;
  return CP_RES_BASE_LIVE_OVERLAY(d)
};

refreshDelay=function(d){
  if(d?.stale)return 5*60*1000;
  return CP_RES_BASE_REFRESH_DELAY(d)
};

function cpResKickoffReached(d,m){
  if(!d?.stale||d.mode!=='NEXT'||!m?.utcDate)return false;
  let t=new Date(m.utcDate).getTime();
  return Number.isFinite(t)&&Date.now()>=t
}

statusTitle=function(d,m){
  if(cpResKickoffReached(d,m))return'更新待ち';
  return CP_RES_BASE_STATUS_TITLE(d,m)
};

function cpResShellText(){
  return typeof CP_DESIGN_TOKENS==='object'&&CP_DESIGN_TOKENS?.shell?.text
    ?CP_DESIGN_TOKENS.shell.text
    :'#F8FAFC'
}

function cpResTheme(){
  if(typeof CP_MU_IS==='function'&&CP_MU_IS())return{title:CP_MU_THEME.ivory,accent:CP_MU_THEME.goldSoft};
  const shellText=cpResShellText();
  if(typeof CP_ACTIVE_THEME==='function'){
    let t=CP_ACTIVE_THEME();
    if(t)return{title:t.headerAccent||shellText,accent:t.headerAccent||t.accentSoft||t.accent||shellText}
  }
  return{title:shellText,accent:shellText}
}

buildHeaderSmall=function(w,d,img){
  let th=cpResTheme();
  let h=w.addStack();h.layoutHorizontally();h.centerAlignContent();
  badge(h,club.badge,img,18,club.p,club.s,CREST_SCALE[club.team]||.91);
  h.addSpacer(5);heavy(h,club.jp,8.5,th.title);
  if(d.stale){
    h.addSpacer(5);let s=h.addStack();s.setPadding(1.5,5,1.5,5);s.cornerRadius=7;
    s.backgroundColor=C('#211B0C',.96);s.borderWidth=.7;s.borderColor=C('#E7B93F',.75);
    text(s,'保存',6.2,true,1,'#F3D77B')
  }
  h.addSpacer();let rk=heavy(h,d.rank!=null?`${d.rank}位`:'–',9.5,th.title);rk.rightAlignText()
};

errorWidget=function(msg){
  if(String(msg||'').includes('API Token'))return CP_RES_BASE_ERROR_WIDGET(msg);
  let th=cpResTheme();
  let w=new ListWidget();w.backgroundGradient=typeof bg==='function'?bg():gradient([C('#070709'),C('#21070B')],[0,1]);
  w.setPadding(12,12,12,12);
  let h=w.addStack();h.layoutHorizontally();h.centerAlignContent();
  heavy(h,'Club Pulse',family==='small'?11:13,th.title);
  h.addSpacer();let p=h.addStack();p.setPadding(2,6,2,6);p.cornerRadius=8;p.backgroundColor=C('#4A1717',.95);p.borderWidth=.7;p.borderColor=C('#FF8E87',.68);text(p,'通信エラー',family==='small'?6.5:7,true,1,'#FFB0AA');
  w.addSpacer(family==='small'?8:10);
  let main=heavy(w,'保存データがありません',family==='small'?10:13,th.title);main.centerAlignText();
  w.addSpacer(5);let sub=text(w,'次回更新で自動再試行します',family==='small'?7:8,false,.78,'#D7D3CC');sub.centerAlignText();
  w.refreshAfterDate=new Date(Date.now()+5*60*1000);return w
};
