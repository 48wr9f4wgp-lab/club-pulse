// Club Pulse Large Presentation v4.
// Owns the Large family only and increases shared HOME/AWAY readability.
// v2 accepts Scriptable Large-family variants (large / extraLarge) while keeping Medium/Small unchanged.
// v3 decouples the dark HOME/AWAY pill text from light-card theme text so side labels stay readable across clubs.
// v4 uses already-fetched fixtures/standings to add match context and recent-form summary without new API calls.

const CP_LARGE_BASE_BUILD_MEDIUM=buildMedium;
const CP_LARGE_BASE_SIDE_PILL=typeof sidePill==='function'?sidePill:null;
const CP_LARGE_BASE_MAP_DATA=mapData;

function cpLargeTheme(){return typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null}
function cpLargeShellText(){return CP_COMMON_SHELL?.text||'#F8FAFC'}
function cpLargeShellMuted(){return CP_COMMON_SHELL?.muted||'#AEB5C2'}
function cpLargeCardText(){let t=cpLargeTheme();return t?.cardText||t?.text||cpLargeShellText()}
function cpLargeGuard(t,min=.68){if(!t)return t;t.lineLimit=1;t.minimumScaleFactor=min;return t}
function cpLargeFamily(){const f=String(config?.widgetFamily||family||'').toLowerCase().replace(/[\s_-]/g,'');return f==='large'||f==='extralarge'}
function cpLargeResultStyle(result){return result==='W'?{label:'勝利',fg:'#8EF7A5',bg:'#103A1F'}:result==='L'?{label:'敗戦',fg:'#FF8A84',bg:'#481817'}:{label:'引分',fg:'#F2F2F5',bg:'#36383E'}}

function cpLargeStandingRow(sj,teamId){
  if(!teamId)return null;
  const standings=Array.isArray(sj?.standings)?sj.standings:[],total=standings.find(x=>x?.type==='TOTAL')||standings[0],table=Array.isArray(total?.table)?total.table:[];
  return table.find(x=>x?.team?.id===teamId)||null
}

function cpLargeRoundLabel(raw){
  if(Number.isFinite(raw?.matchday))return `第${raw.matchday}節`;
  const stage=String(raw?.stage||'').toUpperCase(),labels={
    REGULAR_SEASON:'リーグ戦',LEAGUE_STAGE:'リーグフェーズ',GROUP_STAGE:'グループステージ',
    ROUND_OF_32:'ラウンド32',ROUND_OF_16:'ラウンド16',QUARTER_FINALS:'準々決勝',
    SEMI_FINALS:'準決勝',FINAL:'決勝',THIRD_PLACE:'3位決定戦'
  };
  return labels[stage]||''
}

function cpLargeEnrichMatch(mapped,raw,sj){
  if(!mapped)return mapped;
  const row=cpLargeStandingRow(sj,mapped.opponentId),roundLabel=cpLargeRoundLabel(raw);
  return{...mapped,roundLabel,opponentRank:row?.position??null}
}

function cpLargeFormSummary(rows){
  const finished=(Array.isArray(rows)?rows:[]).filter(m=>m?.status==='FINISHED').sort((a,b)=>new Date(b.utcDate)-new Date(a.utcDate)).slice(0,5);
  let wins=0,draws=0,losses=0,goalsFor=0,goalsAgainst=0,scored=0;
  for(const raw of finished){
    const r=result(raw);if(r==='W')wins++;else if(r==='L')losses++;else draws++;
    const m=mapMatch(raw);
    if(Number.isFinite(m?.ourScore)&&Number.isFinite(m?.opponentScore)){goalsFor+=m.ourScore;goalsAgainst+=m.opponentScore;scored++}
  }
  return{count:finished.length,wins,draws,losses,goalsFor,goalsAgainst,scored}
}

mapData=function(mj,sj){
  const d=CP_LARGE_BASE_MAP_DATA(mj,sj),rows=Array.isArray(mj?.matches)?mj.matches:[],byId=id=>rows.find(x=>String(x?.id)===String(id))||null;
  return{
    ...d,
    nextMatch:cpLargeEnrichMatch(d?.nextMatch,byId(d?.nextMatch?.id),sj),
    liveMatch:cpLargeEnrichMatch(d?.liveMatch,byId(d?.liveMatch?.id),sj),
    recentResult:cpLargeEnrichMatch(d?.recentResult,byId(d?.recentResult?.id),sj),
    previousResult:cpLargeEnrichMatch(d?.previousResult,byId(d?.previousResult?.id),sj),
    formSummary:cpLargeFormSummary(rows),
    largeContextVersion:1
  }
};

function cpLargeCountdown(m){
  const t=m?.utcDate?new Date(m.utcDate).getTime():NaN;
  if(!Number.isFinite(t))return null;
  const delta=t-Date.now();
  if(delta<0)return delta>-2*60*60*1000?'まもなく':null;
  const mins=Math.max(1,Math.ceil(delta/60000));
  if(mins<60)return`あと${mins}分`;
  const hours=Math.ceil(delta/3600000);
  if(hours<48)return`あと${hours}時間`;
  return`あと${Math.floor(hours/24)}日`
}

function cpLargeHeroContext(parent,d,m,fg){
  const items=[];
  if(m?.roundLabel)items.push(m.roundLabel);
  if(d?.mode==='NEXT'&&Number.isFinite(m?.opponentRank))items.push(`相手 ${m.opponentRank}位`);
  if(d?.mode==='NEXT'){
    const countdown=cpLargeCountdown(m);if(countdown)items.push(countdown)
  }
  if(!items.length)return;
  const row=parent.addStack();row.layoutHorizontally();row.centerAlignContent();row.addSpacer();
  for(let i=0;i<items.length;i++){
    const p=row.addStack();p.setPadding(2.5,7,2.5,7);p.cornerRadius=8;p.backgroundColor=C(fg,.08);p.borderWidth=.6;p.borderColor=C(fg,.2);
    cpLargeGuard(text(p,items[i],7.6,true,.84,fg),.86);
    if(i<items.length-1)row.addSpacer(5)
  }
  row.addSpacer()
}

function cpLargeFormRecord(d){
  const values=Array.isArray(d?.form)?d.form.slice(0,5):[],wins=values.filter(v=>v==='W').length,draws=values.filter(v=>v==='D').length,losses=values.filter(v=>v==='L').length,count=wins+draws+losses;
  return count?`${wins}勝${draws}分${losses}敗`:'成績集計中'
}

// The side label sits on a dark panel, so its foreground must stay independent from
// club card text (some themes intentionally use dark card text on light match cards).
sidePill=function(parent,m,small=false){
  const t=cpLargeTheme(),fg=cpLargeShellText(),accent=t?.accentSoft||t?.headerAccent||club.a,
        p=parent.addStack(),label=sideTag(m);
  p.setPadding(small?2.4:2.8,small?7:9,small?2.4:2.8,small?7:9);
  p.cornerRadius=9;
  p.backgroundColor=C(t?.panelDeep||'#121318',.96);
  p.borderWidth=1;
  p.borderColor=C(accent,.78);
  const tx=text(p,label,small?7.8:8.8,true,1,fg);
  tx.minimumScaleFactor=.9;
  return p
};

function cpLargeCompetitionPill(parent,m){
  if(typeof competitionReadable!=='function'||typeof competitionStyle!=='function')return competitionPill(parent,m,false);
  const label=competitionReadable(m,false),z=competitionStyle(label),p=parent.addStack();
  p.setPadding(3,9,3,9);p.cornerRadius=9;p.backgroundColor=C(z.bg,.96);p.borderWidth=1;p.borderColor=C(z.bd,.78);
  const tx=text(p,label,8.3,true,1,z.fg);tx.minimumScaleFactor=.78;
  return p
}

function cpLargeResultPill(parent,m){
  if(typeof resultPill==='function')return resultPill(parent,m,false);
  const z=cpLargeResultStyle(m?.result),p=parent.addStack();
  p.setPadding(3,9,3,9);p.cornerRadius=9;p.backgroundColor=C(z.bg,.98);p.borderWidth=1;p.borderColor=C(z.fg,.72);
  text(p,z.label,8.3,true,1,z.fg);
  return p
}

function cpLargeTeamNameSize(name){const n=String(name||'').length;return n>12?10.8:n>9?11.6:12.5}
function cpLargeTeamBlock(parent,opt,fg){
  const s=parent.addStack();s.size=new Size(104,0);s.layoutVertically();
  const logo=s.addStack();logo.size=new Size(104,72);logo.layoutHorizontally();logo.centerAlignContent();logo.addSpacer();
  const scale=typeof cpMsuOpticalScale==='function'?cpMsuOpticalScale(opt.img):(opt.scale||.92);
  badge(logo,opt.fallback,opt.img,64,opt.p1,opt.p2,scale);logo.addSpacer();
  s.addSpacer(3);
  const nmRow=s.addStack();nmRow.size=new Size(104,18);nmRow.layoutHorizontally();nmRow.centerAlignContent();nmRow.addSpacer();
  const nm=cpLargeGuard(heavy(nmRow,opt.name,cpLargeTeamNameSize(opt.name),fg),.58);nm.centerAlignText();nmRow.addSpacer();
  return s
}

function buildHeaderLarge(w,d,img){
  const t=cpLargeTheme(),fg=cpLargeShellText(),muted=cpLargeShellMuted(),accent=t?.headerAccent||t?.accentSoft||club.a,
        h=w.addStack();
  h.layoutHorizontally();h.centerAlignContent();h.setPadding(1,4,1,4);
  badge(h,club.badge,img,25,club.p,club.s,.92);h.addSpacer(8);
  const l=h.addStack();l.layoutVertically();l.size=new Size(210,0);
  cpLargeGuard(heavy(l,club.name,12.8,fg),.62);
  cpLargeGuard(text(l,`${club.league} · ${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,7.3,false,.82,muted),.72);
  h.addSpacer();
  const r=h.addStack();r.layoutVertically();r.centerAlignContent();
  const rk=cpLargeGuard(heavy(r,d.rank!=null?`${d.rank}位`:'–',16,fg),.88);rk.rightAlignText();
  const last=typeof cpPrLastSeasonLabel==='function'?cpPrLastSeasonLabel(d):null,
        sub=last?`勝点 ${d.points??'–'} · ${last}`:`勝点 ${d.points??'–'}`,
        st=cpLargeGuard(semibold(r,sub,7.7,.96,accent),.72);st.rightAlignText();
}

function buildMatchLarge(w,d,imgs){
  const t=cpLargeTheme()||{},fg=cpLargeCardText(),m=d.mode==='LIVE'?d.liveMatch:d.mode==='POST'?d.recentResult:d.nextMatch,
        c=w.addStack();
  c.layoutVertically();c.setPadding(9,11,8,11);c.cornerRadius=18;c.backgroundGradient=cardBg(d.mode);
  c.borderWidth=1;c.borderColor=C(t.cardBorder||t.border||CP_COMMON_SHELL?.edge||'#465164',.78);
  if(!m){heavy(c,'試合データ未取得',13,fg);return}

  const top=c.addStack();top.layoutHorizontally();top.centerAlignContent();
  cpLargeGuard(text(top,statusTitle(d,m),9.6,true,1,fg),.86);top.addSpacer(7);
  cpLargeCompetitionPill(top,m);
  if(d.mode==='POST'){top.addSpacer(6);cpLargeResultPill(top,m)}
  top.addSpacer();
  sidePill(top,m,false);
  if(d.mode==='LIVE'){top.addSpacer(6);cpLargeGuard(heavy(top,m.minute||'LIVE',11.5,fg),.88)}
  else if(d.mode==='POST'){top.addSpacer(6);cpLargeGuard(heavy(top,'FT',10.8,t.muted||fg),.9)}

  c.addSpacer(8);
  const outer=c.addStack();outer.layoutHorizontally();outer.centerAlignContent();outer.addSpacer();
  const row=outer.addStack();row.layoutHorizontally();row.centerAlignContent();
  cpLargeTeamBlock(row,{img:imgs.club,name:club.jp,fallback:club.badge,p1:club.p,p2:club.s,scale:CREST_SCALE[club.team]||.92},fg);
  row.addSpacer(12);
  const score=row.addStack();score.size=new Size(48,52);score.layoutVertically();score.centerAlignContent();score.addSpacer();
  const main=cpLargeGuard(heavy(score,centerMainText(d,m),d.mode==='POST'?31:d.mode==='LIVE'?28:24,fg),.76);main.centerAlignText();
  if(d.mode==='NEXT'){
    const vsSub=cpLargeGuard(text(score,'MATCH',6.6,true,.58,fg),.9);vsSub.centerAlignText();
  }
  score.addSpacer();
  row.addSpacer(12);
  cpLargeTeamBlock(row,{img:imgs.opp,name:m.opponentName,fallback:m.opponentShort,p1:'#4A5568',p2:'#20242D',scale:CREST_SCALE[m.opponentId]||CREST_SCALE.opponent_default||.9},fg);
  outer.addSpacer();

  c.addSpacer(6);
  const meta=c.addStack();meta.layoutHorizontally();meta.addSpacer();
  const value=metaLine(d,m),mt=cpLargeGuard(semibold(meta,value,10.0,.98,fg),.65);mt.centerAlignText();
  meta.addSpacer();
  c.addSpacer(5);cpLargeHeroContext(c,d,m,fg);
}

function cpLargeContextCard(w,d){
  const t=cpLargeTheme()||{},fg=cpLargeShellText(),muted=cpLargeShellMuted(),
        useNext=d.mode==='POST'&&d.nextMatch,
        m=useNext?d.nextMatch:d.previousResult;
  if(!m)return;

  const c=w.addStack();c.layoutVertically();c.setPadding(8,10,8,10);c.cornerRadius=14;
  c.backgroundColor=C(t.panelDeep||CP_COMMON_SHELL?.rail||'#0A0C12',.96);c.borderWidth=.7;c.borderColor=C(t.border||CP_COMMON_SHELL?.border||'#465164',.7);

  const top=c.addStack();top.layoutHorizontally();top.centerAlignContent();
  const label=useNext?'次戦':'前節';
  cpLargeGuard(text(top,label,8.4,true,.88,muted),.9);top.addSpacer(6);
  cpLargeCompetitionPill(top,m);top.addSpacer();sidePill(top,m,false);
  if(!useNext&&m.result){top.addSpacer(6);cpLargeResultPill(top,m)}

  c.addSpacer(7);
  const body=c.addStack();body.layoutHorizontally();body.centerAlignContent();
  const opp=cpLargeGuard(heavy(body,m.opponentName||'対戦相手未定',11.8,fg),.62);
  body.addSpacer();
  const center=useNext?'VS':(Number.isFinite(m.ourScore)&&Number.isFinite(m.opponentScore)?`${m.ourScore}-${m.opponentScore}`:'–'),
        sc=cpLargeGuard(heavy(body,center,useNext?14:18.5,fg),.86);sc.rightAlignText();

  c.addSpacer(4);
  const sub=c.addStack();sub.layoutHorizontally();
  const pieces=[m.kickoff,m.roundLabel,m.venue||'会場未定'].filter(Boolean),
        tx=cpLargeGuard(text(sub,pieces.join(' ・ '),8.2,false,.82,muted),.58);
  tx.lineLimit=1;
}

function buildFooterLarge(w,d){
  const t=cpLargeTheme()||{},fg=cpLargeShellText(),muted=cpLargeShellMuted(),f=w.addStack();
  f.layoutVertically();f.setPadding(7,10,7,10);f.cornerRadius=13;
  f.backgroundColor=C(t.panelDeep||CP_COMMON_SHELL?.rail||'#080D17',.96);f.borderWidth=.7;f.borderColor=C(t.border||CP_COMMON_SHELL?.border||'#465164',.72);

  const summary=f.addStack();summary.layoutHorizontally();summary.centerAlignContent();
  cpLargeGuard(text(summary,'直近5試合',8.4,true,.9,muted),.9);summary.addSpacer();
  cpLargeGuard(heavy(summary,cpLargeFormRecord(d),9.3,fg),.82);
  const s=d?.formSummary;
  if(s?.scored){summary.addSpacer(8);cpLargeGuard(text(summary,`${s.goalsFor}得点 ${s.goalsAgainst}失点`,7.8,true,.82,muted),.78)}

  f.addSpacer(5);
  const form=f.addStack();form.layoutHorizontally();form.centerAlignContent();
  cpLargeGuard(text(form,'最新 →',7.5,true,.82,muted),.9);form.addSpacer();
  const values=Array.isArray(d.form)?d.form.slice(0,5):[];while(values.length<5)values.push('-');
  for(let i=0;i<values.length;i++){
    if(typeof cpRenderCanonicalFormChip==='function')cpRenderCanonicalFormChip(form,values[i],i===0,'medium');
    else if(typeof formChip==='function')formChip(form,values[i],i===0,false);
    else chip(form,values[i],false,i===0);
    if(i<values.length-1)form.addSpacer(4)
  }
}

function buildLarge(d,imgs){
  const w=new ListWidget();w.backgroundGradient=bg();w.setPadding(10,11,10,11);
  const line=w.addStack();line.size=new Size(0,2);line.backgroundColor=C(club.p);
  w.addSpacer(7);buildHeaderLarge(w,d,imgs.club);
  w.addSpacer(7);buildMatchLarge(w,d,imgs);
  w.addSpacer(7);cpLargeContextCard(w,d);
  w.addSpacer(7);buildFooterLarge(w,d);
  w.refreshAfterDate=new Date(Date.now()+refreshDelay(d));
  return w
}

// Core currently routes every non-Small family through buildMedium.
// Preserve that dispatch for existing code while giving Large-family variants their own renderer.
buildMedium=function(d,imgs){
  if(cpLargeFamily())return buildLarge(d,imgs);
  return CP_LARGE_BASE_BUILD_MEDIUM(d,imgs)
};
