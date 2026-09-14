// Club Pulse Small Presentation System v11.
// Canonical small-widget renderer for all supported clubs.
// v11 keeps v10 geometry and scored-state protection, but stops shrinking long
// Japanese club names into micro-text. Readable natural labels win before codes.

const CP_SP_FULL_NAME_LIMIT=6;
const CP_SP_SOFT_NAME_LIMIT=9;
const CP_SP_PREFERRED_LABELS={
  'アストン・ヴィラ':'ヴィラ',
  'レアル・ソシエダ':'ソシエダ',
  'レヴァークーゼン':'Leverkusen',
  'フランクフルト':'Frankfurt',
  'シュトゥットガルト':'Stuttgart',
  'フィオレンティーナ':'Fiorentina',
  'フェイエノールト':'Feyenoord'
};
const CP_SP_TYPO={
  headerName:9.0,
  headerRank:10.0,
  state:8.3,
  team:9.8,
  teamMinScale:.70,
  scoreNext:14.0,
  scoreLive:14.5,
  scorePost:14.5,
  scoreMinScale:.72,
  meta:8.7,
  metaMinScale:.90,
  footer:7.6,
  teamWidthNext:55,
  teamWidthScore:48,
  scoreWidthNext:32,
  scoreWidthScore:42,
  logo:40
};

const CP_SP_SMALL_ALIASES={
  'アストン・ヴィラ':'ヴィラ',
  'ブレントフォード':'ブレント',
  'クリスタル・パレス':'パレス',
  'ノッティンガム・フォレスト':'フォレスト',
  'ニューカッスル':'NUFC',
  'フェイエノールト':'FEY',
  'アスレティック':'ビルバオ',
  'アスレティック・ビルバオ':'ビルバオ',
  'ボルシア・ドルトムント':'ドルトムント',
  'ホッフェンハイム':'TSG',
  'シュトゥットガルト':'VfB',
  'ヴォルフスブルク':'VfL',
  'ウニオン・ベルリン':'ウニオン',
  'エルヴァースベルク':'SVE',
  'フィオレンティーナ':'ヴィオラ',
  'サンテティエンヌ':'ASSE'
};

function cpSpTheme(){
  return typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null
}
function cpSpHeaderColor(){
  const t=cpSpTheme();
  return t?.headerAccent||CP_DESIGN_TOKENS?.shell?.text||'#F8FAFC'
}
function cpSpCardColor(){
  const t=cpSpTheme();
  return t?.cardText||t?.text||'#F8FAFC'
}
function cpSpMutedCardColor(){
  const t=cpSpTheme();
  return t?.cardMuted||t?.muted||'#D8DDE6'
}
function cpSpCanonical(name){
  return typeof cpCanonicalTeamName==='function'?cpCanonicalTeamName(name):String(name||'').trim()
}
function cpSpTeamLabel(name,fallback,isClub=false){
  let n=isClub?(club?.jp||club?.short||''):cpSpCanonical(name);
  if(CP_SP_PREFERRED_LABELS[n])return CP_SP_PREFERRED_LABELS[n];
  const len=Array.from(n).length;
  if(len<=CP_SP_FULL_NAME_LIMIT)return n;
  if(CP_SP_SMALL_ALIASES[n])return CP_SP_SMALL_ALIASES[n];
  if(len<=CP_SP_SOFT_NAME_LIMIT)return n;
  const fb=String(fallback||'').trim();
  if(/^[A-Z0-9.-]{2,5}$/i.test(fb))return fb;
  return n
}
function cpSpLatinLabel(label){
  return /^[\x20-\x7E]+$/.test(String(label||''))
}
function cpSpTeamFont(label){
  const n=Array.from(String(label||'')).length;
  if(cpSpLatinLabel(label)){
    if(n<=3)return CP_SP_TYPO.team;
    if(n<=6)return 9.2;
    if(n<=8)return 8.7;
    if(n<=10)return 8.2;
    return 7.6
  }
  if(n<=3)return CP_SP_TYPO.team;
  if(n===4)return 9.1;
  if(n===5)return 8.2;
  if(n===6)return 7.4;
  if(n===7)return 7.0;
  if(n===8)return 6.6;
  if(n===9)return 6.2;
  return 7.0
}
function cpSpRowMetrics(mode){
  const scored=mode==='LIVE'||mode==='POST';
  return scored
    ?{teamWidth:CP_SP_TYPO.teamWidthScore,scoreWidth:CP_SP_TYPO.scoreWidthScore}
    :{teamWidth:CP_SP_TYPO.teamWidthNext,scoreWidth:CP_SP_TYPO.scoreWidthNext}
}
function cpSpGenericTeamBlock(parent,opt,label){
  const s=parent.addStack();
  if(opt.width)s.size=new Size(opt.width,0);
  s.layoutVertically();
  const logo=s.addStack();logo.layoutHorizontally();logo.addSpacer();
  badge(logo,opt.fallback,opt.img,opt.logoSize,opt.p1,opt.p2,opt.scale||1);
  logo.addSpacer();
  s.addSpacer(opt.nameGap??2);
  const name=s.addStack();name.layoutHorizontally();name.addSpacer();
  const nm=heavy(name,label,opt.nameSize||cpSpTeamFont(label),cpSpCardColor());
  nm.centerAlignText();nm.lineLimit=1;nm.minimumScaleFactor=CP_SP_TYPO.teamMinScale;
  name.addSpacer();
  return s
}
function cpSpTeamBlock(parent,opt,isClub=false){
  const t=cpSpTheme(),label=cpSpTeamLabel(opt.name,opt.fallback,isClub),base={
    ...opt,
    name:label,
    logoSize:CP_SP_TYPO.logo,
    nameSize:cpSpTeamFont(label),
    nameGap:2,
    width:opt.width||CP_SP_TYPO.teamWidthNext
  };
  if(t?.key==='realmadrid'&&typeof cpRealTeamBlock==='function')return cpRealTeamBlock(parent,base,true);
  if(t?.key==='barcelona'&&typeof cpBarcelonaTeamBlock==='function')return cpBarcelonaTeamBlock(parent,base,true);
  return cpSpGenericTeamBlock(parent,base,label)
}
function cpSpSidePill(parent,m){
  const t=cpSpTheme(),q=CP_PILL_METRICS?.small||CP_DESIGN_TOKENS?.pill?.small||{sideV:4.8,h:5,r:9,font:7.3};
  const p=parent.addStack();
  p.setPadding(q.sideV,q.h,q.sideV,q.h);
  p.cornerRadius=q.r;
  p.backgroundColor=C(t?.panelDeep||'#080D17',.96);
  p.borderWidth=.8;
  p.borderColor=C(t?.sideBorder||t?.accentSoft||'#B8C2D1',.72);
  text(p,sideTag(m),q.font,true,1,CP_DESIGN_TOKENS?.shell?.text||'#F8FAFC');
  return p
}
function cpSpStateLabel(d,m){
  if(d?.cpSmallWaiting)return'更新待ち';
  if(d?.mode==='NEXT'||d?.mode==='STALE_NEXT')return'次戦';
  return statusTitle(d,m)
}
function cpSpMatchFor(d){
  if(d?.mode==='LIVE')return d.liveMatch;
  if(d?.mode==='POST')return d.recentResult;
  return d.nextMatch
}
function cpSpScoreValue(d,m){
  if((d?.mode==='POST'||d?.mode==='LIVE')&&Number.isFinite(m?.ourScore)&&Number.isFinite(m?.opponentScore))return `${m.ourScore}-${m.opponentScore}`;
  return centerMainText(d,m)
}

buildHeaderSmall=function(w,d,img){
  const col=cpSpHeaderColor();
  const h=w.addStack();h.layoutHorizontally();h.centerAlignContent();
  badge(h,club.badge,img,18,club.p,club.s,CREST_SCALE[club.team]||.91);
  h.addSpacer(5);
  const nm=heavy(h,club.jp,CP_SP_TYPO.headerName,col);nm.minimumScaleFactor=.88;
  if(d.stale){
    h.addSpacer(4);
    const s=h.addStack();s.setPadding(1.5,5,1.5,5);s.cornerRadius=7;
    s.backgroundColor=C('#211B0C',.96);s.borderWidth=.7;s.borderColor=C('#E7B93F',.75);
    text(s,'保存',6.2,true,1,'#F3D77B')
  }
  h.addSpacer();
  const rk=heavy(h,d.rank!=null?`${d.rank}位`:'–',CP_SP_TYPO.headerRank,col);rk.minimumScaleFactor=.90;rk.rightAlignText()
};

buildMatchSmall=function(w,d,imgs){
  let view=d;
  if(typeof cpDpSmallWaiting==='function'&&cpDpSmallWaiting(d))view={...d,mode:'STALE_NEXT',cpSmallWaiting:true};
  const m=cpSpMatchFor(view),t=cpSpTheme(),fg=cpSpCardColor(),muted=cpSpMutedCardColor();
  const q=CP_DESIGN_TOKENS?.card||{};
  const c=w.addStack();c.layoutVertically();c.setPadding(6,6,6,6);
  c.cornerRadius=q.radiusSmall??14;c.backgroundGradient=cardBg(view.mode);
  c.borderWidth=q.borderSmall??.75;c.borderColor=C(t?.cardBorder||t?.border||CP_DESIGN_TOKENS?.shell?.edge||'#9AA6B8',q.borderAlphaSmall??.66);
  if(!m){heavy(c,'試合データ未取得',10,fg);return}

  const top=c.addStack();top.layoutHorizontally();top.centerAlignContent();
  const st=text(top,cpSpStateLabel(view,m),CP_SP_TYPO.state,true,1,fg);st.minimumScaleFactor=.90;
  top.addSpacer(5);competitionPill(top,m,true);top.addSpacer();
  if(view.mode==='LIVE'){
    const mt=heavy(top,m.minute||'LIVE',9.5,fg);mt.minimumScaleFactor=.90
  }else if(view.mode==='POST'){
    resultPill(top,m,true);top.addSpacer(4);heavy(top,'FT',8.3,muted)
  }else cpSpSidePill(top,m);

  c.addSpacer(5);
  const gm=cpSpRowMetrics(view.mode);
  const outer=c.addStack();outer.layoutHorizontally();outer.centerAlignContent();outer.addSpacer();
  const row=outer.addStack();row.layoutHorizontally();row.centerAlignContent();
  cpSpTeamBlock(row,{img:imgs.club,name:club.jp,fallback:club.badge,p1:club.p,p2:club.s,scale:CREST_SCALE[club.team]||.91,width:gm.teamWidth},true);
  row.addSpacer(1);
  const sb=row.addStack();sb.size=new Size(gm.scoreWidth,22);sb.layoutHorizontally();sb.centerAlignContent();sb.addSpacer();
  const scoreSize=view.mode==='POST'?CP_SP_TYPO.scorePost:view.mode==='LIVE'?CP_SP_TYPO.scoreLive:CP_SP_TYPO.scoreNext;
  const sc=heavy(sb,cpSpScoreValue(view,m),scoreSize,fg);sc.minimumScaleFactor=CP_SP_TYPO.scoreMinScale;sc.lineLimit=1;sc.centerAlignText();sb.addSpacer();
  row.addSpacer(1);
  cpSpTeamBlock(row,{img:imgs.opp,name:m.opponentName,fallback:m.opponentShort,p1:'#4A5568',p2:'#20242D',scale:CREST_SCALE[m.opponentId]||CREST_SCALE.opponent_default||.90,width:gm.teamWidth},false);
  outer.addSpacer();

  c.addSpacer(4);
  const meta=c.addStack();meta.layoutHorizontally();meta.addSpacer();
  const metaValue=view?.cpSmallWaiting?metaLine(view,m):m.kickoff;
  const mt=meta.addText(String(metaValue||''));mt.font=Font.semiboldSystemFont(CP_SP_TYPO.meta);mt.textColor=C(fg);mt.lineLimit=1;mt.minimumScaleFactor=CP_SP_TYPO.metaMinScale;mt.centerAlignText();
  meta.addSpacer()
};

buildFooterSmall=function(w,d){
  const t=cpSpTheme(),form=typeof CP_FORM_VIEW==='function'?CP_FORM_VIEW(d):[...(d.form||[])];
  const f=w.addStack();f.layoutHorizontally();f.centerAlignContent();f.setPadding(1,1,1,1);f.addSpacer();
  text(f,'最新',CP_SP_TYPO.footer,true,.99,CP_DESIGN_TOKENS?.shell?.text||'#F8FAFC');
  f.addSpacer(2);text(f,'→',CP_SP_TYPO.footer,true,1,t?.accent||club.a||'#FFFFFF');f.addSpacer(5);
  for(let i=0;i<form.length;i++){formChip(f,form[i],i===0,true);if(i<form.length-1)f.addSpacer(3)}
  f.addSpacer()
};