// Club Pulse Previous Result + Previous Season Context v2.
// Medium-only additions:
// - Persist the latest completed match independently of the POST window.
// - Show a compact previous-result summary in the footer.
// - Replace the secondary Medium header line (points) with last season's league position.
// Small remains unchanged. Historical league standings are shared per competition/season.

const CP_PR_BASE_MAP_DATA=mapData;
mapData=function(mj,sj){
  const d=CP_PR_BASE_MAP_DATA(mj,sj),rows=Array.isArray(mj?.matches)?mj.matches:[],
        finished=rows.filter(m=>m?.status==='FINISHED').sort((a,b)=>new Date(b.utcDate)-new Date(a.utcDate)),
        previous=finished.length?mapMatch(finished[0]):d?.recentResult||null;
  return{...d,previousResult:typeof cpUiuNormalizeMatch==='function'?cpUiuNormalizeMatch(previous):previous}
};

// Existing local caches predate previousResult. Backfill once from football-data when
// an old cache clearly has form history but no persisted previous match. The refreshed
// object is written to the normal cache; nothing is destructively deleted.
const CP_PR_BASE_LOAD_DATA=loadData;
loadData=async function(t){
  let d=await CP_PR_BASE_LOAD_DATA(t);
  if(!d)return d;
  if(d.previousResult)return d;
  if(d.recentResult)return{...d,previousResult:d.recentResult};
  const hasHistory=Array.isArray(d.form)&&d.form.some(v=>v&&v!=='-');
  if(!hasHistory)return{...d,previousResult:null};
  try{
    if(typeof cpDpFetchMatches!=='function')return{...d,previousResult:null};
    const matches=await cpDpFetchMatches(t),
          sj=typeof cpDpStandings==='function'?await cpDpStandings(t):{},
          safeMatches=typeof cpDpTemporalizeMatches==='function'?cpDpTemporalizeMatches(matches):matches,
          fresh=mapData(safeMatches,sj||{});
    if(!fresh?.previousResult)return{...d,previousResult:null};
    if(!sj&&d){fresh.rank=d.rank;fresh.points=d.points}
    writeJSON(cachePath(),fresh);
    return{...fresh,stale:false,dataPolicy:'network-previous-result'}
  }catch{
    return{...d,previousResult:null}
  }
};

function cpPrScore(m){
  if(!m||!Number.isFinite(m.ourScore)||!Number.isFinite(m.opponentScore))return'–';
  return`${m.ourScore}-${m.opponentScore}`
}

function cpPrOpponent(m){
  const raw=typeof cpUiuCanonicalName==='function'?cpUiuCanonicalName(m?.opponentName):String(m?.opponentName||'未定'),
        alias=typeof CP_SP_SMALL_ALIASES==='object'?CP_SP_SMALL_ALIASES?.[raw]:null;
  return alias&&/[^\x20-\x7E]/.test(alias)?alias:raw
}

const CP_PR_BASE_FOOTER_MEDIUM=buildFooterMedium;
buildFooterMedium=function(w,d){
  const m=d?.previousResult;
  if(!m||d?.mode==='POST')return CP_PR_BASE_FOOTER_MEDIUM(w,d);

  const q=CP_FORM_SYSTEM?.medium||{label:8.2,chip:9.2,v:2.8,h:7,gap:4,footerV:2,footerH:8,radius:9},
        t=typeof cpFormTheme==='function'?cpFormTheme():(typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null),
        form=typeof cpFormValues==='function'?cpFormValues(d):[...(d?.form||[])],
        style=typeof cpFormResultStyle==='function'?cpFormResultStyle(m.result):{fg:'#ECECF0'},
        shell=typeof cpFormShellText==='function'?cpFormShellText():'#F8FAFC',
        f=w.addStack();

  f.layoutHorizontally();f.centerAlignContent();
  f.setPadding(q.footerV,q.footerH,q.footerV,q.footerH);
  f.cornerRadius=9;
  f.backgroundColor=C(t?.panelDeep||CP_COMMON_SHELL?.rail||'#080D17',.96);
  f.borderWidth=.55;
  f.borderColor=C(CP_COMMON_SHELL?.border||'#465164',.84);

  const prev=f.addStack();
  prev.layoutHorizontally();prev.centerAlignContent();prev.size=new Size(103,0);
  let lb=text(prev,'前節',7.0,true,.82,shell);lb.lineLimit=1;
  prev.addSpacer(4);
  let sc=heavy(prev,cpPrScore(m),8.2,style.fg||shell);sc.lineLimit=1;
  prev.addSpacer(3);
  let op=text(prev,cpPrOpponent(m),7.2,true,.9,shell);op.lineLimit=1;op.minimumScaleFactor=.55;

  f.addSpacer(5);
  const latest=text(f,'最新 →',q.label,true,1,shell);latest.lineLimit=1;latest.minimumScaleFactor=.92;
  f.addSpacer(5);
  const values=Array.isArray(form)?form.slice(0,5):[];
  while(values.length<5)values.push('-');
  for(let i=0;i<values.length;i++){
    if(typeof cpRenderCanonicalFormChip==='function')cpRenderCanonicalFormChip(f,values[i],i===0,'medium');
    else formChip(f,values[i],i===0,false);
    if(i<values.length-1)f.addSpacer(3)
  }
  f.addSpacer();
  return f
};

// Previous-season league context. football-data supports the standings `season=YEAR`
// filter. Because historical tables are immutable, one cache is shared by every club
// in the same competition and refreshed only every 30 days.
const CP_PR_LSR_SUPPORTED=new Set(['PL','PD','BL1','SA','FL1','DED']);
const CP_PR_LSR_TTL=30*24*60*60*1000;
const CP_PR_LSR_ERROR_TTL=24*60*60*1000;

function cpPrPreviousSeasonYear(now=new Date()){
  const currentStart=now.getMonth()>=6?now.getFullYear():now.getFullYear()-1;
  return currentStart-1
}

function cpPrLastSeasonPath(season){
  return path(`last_season_standings_${String(club?.comp||'league').toLowerCase()}_${season}.json`)
}

async function cpPrLastSeasonStandings(token){
  if(!CP_PR_LSR_SUPPORTED.has(String(club?.comp||'')))return null;
  const season=cpPrPreviousSeasonYear(),p=cpPrLastSeasonPath(season),c=readJSON(p),now=Date.now();
  if(c?.payload&&now-Number(c.fetchedAt||0)<CP_PR_LSR_TTL)return{season,payload:c.payload};
  if(!c?.payload&&c?.error&&now-Number(c.fetchedAt||0)<CP_PR_LSR_ERROR_TTL)return null;
  try{
    const payload=await api(`/competitions/${club.comp}/standings?season=${season}`,token);
    if(!payload?.standings)throw new Error('Previous-season standings unavailable');
    writeJSON(p,{fetchedAt:Date.now(),season,payload});
    return{season,payload}
  }catch{
    if(c?.payload)return{season:c.season||season,payload:c.payload};
    writeJSON(p,{fetchedAt:Date.now(),season,error:true,payload:null});
    return null
  }
}

const CP_PR_LSR_BASE_LOAD_DATA=loadData;
loadData=async function(token){
  const d=await CP_PR_LSR_BASE_LOAD_DATA(token);
  if(!d)return d;
  const history=await cpPrLastSeasonStandings(token);
  if(!history?.payload)return d;
  const row=standing(history.payload);
  return{
    ...d,
    lastSeasonYear:history.season,
    lastSeasonRank:row?.position??null,
    lastSeasonStatus:row?'ranked':'promoted'
  }
};

function cpPrLastSeasonLabel(d){
  if(Number.isFinite(d?.lastSeasonRank))return`昨季 ${d.lastSeasonRank}位`;
  if(d?.lastSeasonStatus==='promoted')return'昨季 昇格';
  return null
}

const CP_PR_BASE_HEADER_MEDIUM=buildHeaderMedium;
buildHeaderMedium=function(w,d,img){
  const last=cpPrLastSeasonLabel(d);
  if(!last)return CP_PR_BASE_HEADER_MEDIUM(w,d,img);

  const t=typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null,
        isMu=typeof CP_MU_IS==='function'&&CP_MU_IS(),
        fg=isMu&&typeof CP_MU_THEME==='object'?CP_MU_THEME.ivory:(CP_COMMON_SHELL?.text||'#F8FAFC'),
        muted=isMu?'#C8C5BE':(CP_COMMON_SHELL?.muted||'#AEB5C2'),
        accent=isMu&&typeof CP_MU_THEME==='object'?CP_MU_THEME.goldSoft:(t?.headerAccent||t?.accentSoft||club?.a||muted),
        h=w.addStack();

  h.layoutHorizontally();h.centerAlignContent();h.setPadding(0,3,0,3);
  badge(h,club.badge,img,20,club.p,club.s,CREST_SCALE[club.team]||.91);
  h.addSpacer(7);

  const l=h.addStack();l.layoutVertically();
  let name=heavy(l,club.name,10.5,fg);name.lineLimit=1;name.minimumScaleFactor=.72;
  let stamp=text(l,`${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,6.6,false,.76,muted);stamp.lineLimit=1;stamp.minimumScaleFactor=.82;

  h.addSpacer();
  const r=h.addStack();r.layoutVertically();r.centerAlignContent();
  let rk=heavy(r,d.rank!=null?`${d.rank}位`:'–',12.5,fg);rk.lineLimit=1;rk.minimumScaleFactor=.88;rk.rightAlignText();
  let ls=semibold(r,last,7.2,.92,accent);ls.lineLimit=1;ls.minimumScaleFactor=.84;ls.rightAlignText();
  return h
};
