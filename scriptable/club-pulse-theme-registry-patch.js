// Shared visual theme registry for multi-club rollout.
// Premium v13: readability first, with a refined neutral shell and thin metallic card edging.
// Club identity stays inside simple information surfaces. No decorative streaks or lines cross content.

const CP_COMMON_SHELL={surface:'#080C14',panel:'#0D1420',glow:'#111A28',text:'#F8FAFC',muted:'#B8C2D1',rail:'#080D17',border:'#465164',edge:'#9AA6B8'};

const CP_CLUB_THEME_REGISTRY={
  66:{
    key:'manutd',
    text:'#FFF8F2',muted:'#D8CBC8',accent:'#D6B45A',accentSoft:'#F0D58A',
    surface:'#07080A',glow:'#DA291C',panel:'#13090C',panelDeep:'#080D17',
    cardSurface:'#5B0A0E',cardPanel:'#B5121B',cardGlow:'#DA291C',
    border:'#A82A31',cardBorder:'#D0AE55',sideBorder:'#D6B45A'
  },
  81:{
    key:'barcelona',
    text:'#FFF8F1',muted:'#D7D0E2',accent:'#D7B04A',accentSoft:'#EFD47D',
    surface:'#070A12',glow:'#421A68',panel:'#0C1427',panelDeep:'#080D17',
    cardSurface:'#150A2E',cardPanel:'#2D1458',cardGlow:'#3D1C6B',
    border:'#5D3A8F',cardBorder:'#8064AA',sideBorder:'#D7B04A'
  },
  86:{
    key:'realmadrid',
    text:'#FBFCFF',muted:'#C9D1DE',accent:'#D8B557',accentSoft:'#EFD78F',
    surface:'#070A10',glow:'#123D78',panel:'#0A172A',panelDeep:'#080D17',
    cardSurface:'#FCFBF7',cardPanel:'#F3F0E8',cardGlow:'#FFFFFF',
    border:'#D8B557',cardBorder:'#C7A653',sideBorder:'#D8B557'
  }
};

function CP_ACTIVE_THEME(){return CP_CLUB_THEME_REGISTRY[club?.team]||null}
function cpThemeGradient(stops,alpha=.98){let loc=stops.length===2?[0,1]:stops.length===3?[0,.58,1]:stops.map((_,i)=>i/(stops.length-1));return gradient(stops.map(x=>C(x,alpha)),loc)}
function cpLegacyShellFallback(t){return cpThemeGradient([t.surface,t.panel,t.glow],.99)}

function cpCommonShellGradient(){
  let g=new LinearGradient();
  g.startPoint=new Point(0,0);
  g.endPoint=new Point(1,1);
  g.colors=[C(CP_COMMON_SHELL.surface),C(CP_COMMON_SHELL.panel),C(CP_COMMON_SHELL.glow)];
  g.locations=[0,.58,1];
  return g
}

function cpSimpleCardGradient(t,mode){
  let a=t.cardSurface||t.panelDeep,
      b=t.cardPanel||t.panel,
      c=mode==='LIVE'?(t.cardGlow||t.glow):(t.cardGlow||t.cardPanel||t.panel),
      g=new LinearGradient();
  g.startPoint=new Point(0,.5);
  g.endPoint=new Point(1,.5);
  g.colors=[C(a),C(b),C(c)];
  g.locations=[0,.64,1];
  return g
}

const CP_THEME_BASE_BG=bg,
      CP_THEME_BASE_CARD_BG=cardBg,
      CP_THEME_BASE_BADGE=badge,
      CP_THEME_BASE_SIDE=sidePill,
      CP_THEME_BASE_FORM=formChip,
      CP_THEME_BASE_HEADER_MEDIUM=buildHeaderMedium,
      CP_THEME_BASE_HEADER_SMALL=buildHeaderSmall,
      CP_THEME_BASE_FOOTER_MEDIUM=buildFooterMedium,
      CP_THEME_BASE_FOOTER_SMALL=buildFooterSmall,
      CP_THEME_BASE_BUILD_MEDIUM=buildMedium,
      CP_THEME_BASE_BUILD_SMALL=buildSmall;

bg=function(){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_BG();
  return cpCommonShellGradient()
};

cardBg=function(mode){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_CARD_BG(mode);
  return cpSimpleCardGradient(t,mode)
};

badge=function(p,fallback,img,size=28,p1=club.p,p2=club.s,scale=1){
  let t=CP_ACTIVE_THEME();
  if(!t||fallback!==club.badge)return CP_THEME_BASE_BADGE(p,fallback,img,size,p1,p2,scale);
  let o=p.addStack();
  o.size=new Size(size+2,size+2);
  o.backgroundColor=C('#000000',0);
  o.borderWidth=0;
  o.centerAlignContent();
  let i=o.addStack();
  i.size=new Size(size,size);
  i.backgroundColor=C('#000000',0);
  i.centerAlignContent();
  if(img){
    let im=i.addImage(img),z=Math.round(size*scale);
    im.imageSize=new Size(z,z)
  }else{
    let tx=heavy(i,fallback,size<30?8:10,CP_COMMON_SHELL.text);tx.centerAlignText()
  }
  return o
};

sidePill=function(parent,m,small=false){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_SIDE(parent,m,small);
  let p=parent.addStack(),label=sideTag(m);
  p.setPadding(2,small?6:7,2,small?6:7);
  p.cornerRadius=8;
  p.backgroundColor=C(t.panelDeep,.96);
  p.borderWidth=.8;
  p.borderColor=C(t.sideBorder,.72);
  text(p,label,small?6.8:6.8,true,1,CP_COMMON_SHELL.text);
  return p
};

formChip=function(parent,r,latest=false,small=false){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_FORM(parent,r,latest,small);
  let z={W:['勝','#8EE9A4','#11321E'],D:['分','#ECECF0','#35373C'],L:['負','#FF8E87','#451716'],'-':['–','#B7BAC2','#25272B']}[r]||['–','#B7BAC2','#25272B'],p=parent.addStack();
  p.setPadding(small?2.2:2,small?6.3:7,small?2.2:2,small?6.3:7);
  p.cornerRadius=latest?9:8;
  p.backgroundColor=C(z[2],.99);
  p.borderWidth=latest?1:.45;
  p.borderColor=latest?C(t.accent,.80):C(z[1],.30);
  text(p,z[0],small?7.5:7,true,1,z[1]);
  return p
};

buildHeaderMedium=function(w,d,img){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_HEADER_MEDIUM(w,d,img);
  let h=w.addStack();
  h.layoutHorizontally();
  h.centerAlignContent();
  h.setPadding(0,3,0,3);
  badge(h,club.badge,img,20,club.p,club.s,CREST_SCALE[club.team]||.91);
  h.addSpacer(7);
  let l=h.addStack();l.layoutVertically();
  heavy(l,club.name,10.5,CP_COMMON_SHELL.text);
  text(l,`${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,6.6,false,.76,CP_COMMON_SHELL.muted);
  h.addSpacer();
  let r=h.addStack();r.layoutVertically();r.centerAlignContent();
  let rk=heavy(r,d.rank!=null?`${d.rank}位`:'–',12.5,CP_COMMON_SHELL.text);rk.rightAlignText();
  let pt=semibold(r,`勝点 ${d.points??'–'}`,7.2,.92,t.headerAccent||t.accentSoft||CP_COMMON_SHELL.muted);pt.rightAlignText()
};

buildHeaderSmall=function(w,d,img){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_HEADER_SMALL(w,d,img);
  let h=w.addStack();h.layoutHorizontally();h.centerAlignContent();
  badge(h,club.badge,img,18,club.p,club.s,CREST_SCALE[club.team]||.91);
  h.addSpacer(5);
  heavy(h,club.jp,8.5,CP_COMMON_SHELL.text);
  h.addSpacer();
  let rk=heavy(h,d.rank!=null?`${d.rank}位`:'–',9.5,CP_COMMON_SHELL.text);rk.rightAlignText()
};

buildFooterMedium=function(w,d){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_FOOTER_MEDIUM(w,d);
  let f=w.addStack();f.layoutHorizontally();f.centerAlignContent();
  f.setPadding(2,8,2,8);f.cornerRadius=9;
  f.backgroundColor=C(t.panelDeep,.94);
  f.borderWidth=.45;f.borderColor=C(CP_COMMON_SHELL.border,.82);
  text(f,'最新',6.8,true,.92,CP_COMMON_SHELL.text);f.addSpacer(2);text(f,'→',7,true,1,t.accent);f.addSpacer(6);
  for(let i=0;i<d.form.length;i++){formChip(f,d.form[i],i===0,false);if(i<d.form.length-1)f.addSpacer(3)}
  f.addSpacer()
};

buildFooterSmall=function(w,d){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_FOOTER_SMALL(w,d);
  let f=w.addStack();f.layoutHorizontally();f.centerAlignContent();
  f.setPadding(1,1,1,1);
  f.addSpacer();
  text(f,'最新',7.6,true,.94,CP_COMMON_SHELL.text);f.addSpacer(2);text(f,'→',7.6,true,1,t.accent);f.addSpacer(5);
  for(let i=0;i<d.form.length;i++){formChip(f,d.form[i],i===0,true);if(i<d.form.length-1)f.addSpacer(3)}
  f.addSpacer()
};

buildMedium=function(d,imgs){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_BUILD_MEDIUM(d,imgs);
  let w=new ListWidget();
  w.backgroundGradient=bg();
  w.setPadding(5,10,8,10);
  let line=w.addStack();line.size=new Size(0,1);line.backgroundColor=C(CP_COMMON_SHELL.edge,.62);
  w.addSpacer(2);
  buildHeaderMedium(w,d,imgs.club);
  w.addSpacer(2);
  buildMatchMedium(w,d,imgs);
  w.addSpacer(2);
  buildFooterMedium(w,d);
  w.refreshAfterDate=new Date(Date.now()+refreshDelay(d));
  return w
};

buildSmall=function(d,imgs){
  let t=CP_ACTIVE_THEME();
  if(!t)return CP_THEME_BASE_BUILD_SMALL(d,imgs);
  let w=new ListWidget();
  w.backgroundGradient=bg();
  w.setPadding(8,8,8,8);
  buildHeaderSmall(w,d,imgs.club);
  w.addSpacer(5);
  buildMatchSmall(w,d,imgs);
  w.addSpacer(5);
  buildFooterSmall(w,d);
  w.refreshAfterDate=new Date(Date.now()+refreshDelay(d));
  return w
};
