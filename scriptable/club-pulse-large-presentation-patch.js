// Club Pulse Large Presentation v3.
// Owns the Large family only and increases shared HOME/AWAY readability.
// v2 accepts Scriptable Large-family variants (large / extraLarge) while keeping Medium/Small unchanged.
// v3 decouples the dark HOME/AWAY pill text from light-card theme text so side labels stay readable across clubs.

const CP_LARGE_BASE_BUILD_MEDIUM=buildMedium;
const CP_LARGE_BASE_SIDE_PILL=typeof sidePill==='function'?sidePill:null;

function cpLargeTheme(){return typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null}
function cpLargeShellText(){return CP_COMMON_SHELL?.text||'#F8FAFC'}
function cpLargeShellMuted(){return CP_COMMON_SHELL?.muted||'#AEB5C2'}
function cpLargeCardText(){let t=cpLargeTheme();return t?.cardText||t?.text||cpLargeShellText()}
function cpLargeGuard(t,min=.68){if(!t)return t;t.lineLimit=1;t.minimumScaleFactor=min;return t}
function cpLargeFamily(){const f=String(config?.widgetFamily||family||'').toLowerCase().replace(/[\s_-]/g,'');return f==='large'||f==='extralarge'}
function cpLargeResultStyle(result){return result==='W'?{label:'勝利',fg:'#8EF7A5',bg:'#103A1F'}:result==='L'?{label:'敗戦',fg:'#FF8A84',bg:'#481817'}:{label:'引分',fg:'#F2F2F5',bg:'#36383E'}}

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
  c.layoutVertically();c.setPadding(9,11,9,11);c.cornerRadius=18;c.backgroundGradient=cardBg(d.mode);
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

  c.addSpacer(10);
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

  c.addSpacer(8);
  const meta=c.addStack();meta.layoutHorizontally();meta.addSpacer();
  const value=metaLine(d,m),mt=cpLargeGuard(semibold(meta,value,10.2,.98,fg),.65);mt.centerAlignText();
  meta.addSpacer();
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
  const opp=cpLargeGuard(heavy(body,m.opponentName||'対戦相手未定',11.6,fg),.62);
  body.addSpacer();
  const center=useNext?'VS':(Number.isFinite(m.ourScore)&&Number.isFinite(m.opponentScore)?`${m.ourScore}-${m.opponentScore}`:'–'),
        sc=cpLargeGuard(heavy(body,center,useNext?14:18,fg),.86);sc.rightAlignText();

  c.addSpacer(4);
  const sub=c.addStack();sub.layoutHorizontally();
  const info=useNext?`${m.kickoff} ・ ${m.venue||'会場未定'}`:`${m.kickoff||''}${m.venue?` ・ ${m.venue}`:''}`,
        tx=cpLargeGuard(text(sub,info,8.2,false,.82,muted),.62);
  tx.lineLimit=1;
}

function buildFooterLarge(w,d){
  const t=cpLargeTheme()||{},fg=cpLargeShellText(),muted=cpLargeShellMuted(),f=w.addStack();
  f.layoutHorizontally();f.centerAlignContent();f.setPadding(7,10,7,10);f.cornerRadius=13;
  f.backgroundColor=C(t.panelDeep||CP_COMMON_SHELL?.rail||'#080D17',.96);f.borderWidth=.7;f.borderColor=C(t.border||CP_COMMON_SHELL?.border||'#465164',.72);
  const label=cpLargeGuard(text(f,'直近5試合',8.4,true,.9,muted),.9);label.lineLimit=1;f.addSpacer();
  const values=Array.isArray(d.form)?d.form.slice(0,5):[];while(values.length<5)values.push('-');
  for(let i=0;i<values.length;i++){
    if(typeof cpRenderCanonicalFormChip==='function')cpRenderCanonicalFormChip(f,values[i],i===0,'medium');
    else if(typeof formChip==='function')formChip(f,values[i],i===0,false);
    else chip(f,values[i],false,i===0);
    if(i<values.length-1)f.addSpacer(4)
  }
}

function buildLarge(d,imgs){
  const w=new ListWidget();w.backgroundGradient=bg();w.setPadding(10,11,10,11);
  const line=w.addStack();line.size=new Size(0,2);line.backgroundColor=C(club.p);
  w.addSpacer(7);buildHeaderLarge(w,d,imgs.club);
  w.addSpacer(8);buildMatchLarge(w,d,imgs);
  w.addSpacer(8);cpLargeContextCard(w,d);
  w.addSpacer(8);buildFooterLarge(w,d);
  w.refreshAfterDate=new Date(Date.now()+refreshDelay(d));
  return w
}

// Core currently routes every non-Small family through buildMedium.
// Preserve that dispatch for existing code while giving Large-family variants their own renderer.
buildMedium=function(d,imgs){
  if(cpLargeFamily())return buildLarge(d,imgs);
  return CP_LARGE_BASE_BUILD_MEDIUM(d,imgs)
};
