const CP_TOP_LAYOUT_BASE_HEADER_MEDIUM=buildHeaderMedium;
const CP_TOP_LAYOUT_BASE_MATCH_MEDIUM=buildMatchMedium;
const CP_TOP_LAYOUT_BASE_MATCH_SMALL=buildMatchSmall;
const CP_TOP_LAYOUT_BASE_BUILD_MEDIUM=buildMedium;
const CP_TOP_LAYOUT_BASE_BUILD_SMALL=buildSmall;

function cpMuTopInfoRail(parent,d,m,small=false){
  let top=parent.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();
  top.setPadding(0,small?1:2,0,small?1:2);

  let left=top.addStack();
  left.layoutHorizontally();
  left.centerAlignContent();
  let state=d.mode==='NEXT'?(small?'次戦':'次の試合'):statusTitle(d,m);
  text(left,state,small?8.0:7.9,true,1,CP_MU_THEME.ivory);
  left.addSpacer(small?5:7);
  competitionPill(left,m,small);
  if(d.mode==='POST'){
    left.addSpacer(small?4:6);
    resultPill(left,m,small)
  }

  top.addSpacer();
  if(d.mode==='LIVE'){
    let minute=heavy(top,m.minute||'LIVE',small?9.5:10.0,CP_MU_THEME.ivory);
    minute.rightAlignText()
  }else if(d.mode!=='POST'){
    sidePill(top,m,small)
  }
  return top
}

buildHeaderMedium=function(w,d,img){
  if(!CP_MU_IS())return CP_TOP_LAYOUT_BASE_HEADER_MEDIUM(w,d,img);
  let h=w.addStack();
  h.layoutHorizontally();
  h.centerAlignContent();
  h.setPadding(0,3,0,3);
  badge(h,club.badge,img,20,club.p,club.s,CREST_SCALE[club.team]||.91);
  h.addSpacer(7);
  let l=h.addStack();
  l.layoutVertically();
  heavy(l,club.name,10.6,CP_MU_THEME.ivory);
  text(l,`${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,6.6,false,.72,'#C8C5BE');
  h.addSpacer();
  let r=h.addStack();
  r.layoutVertically();
  r.centerAlignContent();
  let rk=heavy(r,d.rank!=null?`${d.rank}位`:'–',12.5,CP_MU_THEME.ivory);
  rk.rightAlignText();
  let pt=semibold(r,`勝点 ${d.points??'–'}`,7.2,.76,CP_MU_THEME.goldSoft);
  pt.rightAlignText()
};

buildMatchMedium=function(w,d,imgs){
  if(!CP_MU_IS())return CP_TOP_LAYOUT_BASE_MATCH_MEDIUM(w,d,imgs);
  let m=d.mode==='LIVE'?d.liveMatch:d.mode==='POST'?d.recentResult:d.nextMatch;
  let c=w.addStack();
  c.layoutVertically();
  c.setPadding(4,10,3,10);
  c.cornerRadius=16;
  c.backgroundGradient=cardBg(d.mode);
  c.borderWidth=.65;
  c.borderColor=C(CP_MU_THEME.gold,.34);
  if(!m){heavy(c,'試合データ未取得',11);return}

  cpMuTopInfoRail(c,d,m,false);
  c.addSpacer(2);

  let outer=c.addStack();
  outer.layoutHorizontally();
  outer.centerAlignContent();
  outer.addSpacer();
  let row=outer.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  renderTeamBlock(row,{img:imgs.club,name:club.jp,sub:'',fallback:club.badge,logoSize:53,nameSize:11.7,subSize:0,p1:club.p,p2:club.s,scale:CREST_SCALE[club.team]||.91,nameGap:1,width:92});
  row.addSpacer(d.mode==='POST'?15:19);
  let mid=heavy(row,centerMainText(d,m),d.mode==='POST'?26:d.mode==='NEXT'?14:21.5,CP_MU_THEME.ivory);
  mid.centerAlignText();
  row.addSpacer(d.mode==='POST'?15:19);
  renderTeamBlock(row,{img:imgs.opp,name:m.opponentName,sub:'',fallback:m.opponentShort,logoSize:53,nameSize:11.7,subSize:0,p1:'#4A5568',p2:'#20242D',scale:CREST_SCALE[m.opponentId]||CREST_SCALE.opponent_default||.90,nameGap:1,width:92});
  outer.addSpacer();
  c.addSpacer(1);

  let meta=c.addStack();
  meta.layoutHorizontally();
  meta.addSpacer();
  let mt=semibold(meta,metaLine(d,m),8.8,.98,'#F1E9D8');
  mt.centerAlignText();
  meta.addSpacer()
};

buildMatchSmall=function(w,d,imgs){
  if(!CP_MU_IS())return CP_TOP_LAYOUT_BASE_MATCH_SMALL(w,d,imgs);
  let m=d.mode==='LIVE'?d.liveMatch:d.mode==='POST'?d.recentResult:d.nextMatch;
  let c=w.addStack();
  c.layoutVertically();
  c.setPadding(5,7,4,7);
  c.cornerRadius=14;
  c.backgroundGradient=cardBg(d.mode);
  c.borderWidth=.6;
  c.borderColor=C(CP_MU_THEME.gold,.30);
  if(!m){heavy(c,'試合データ未取得',10);return}

  cpMuTopInfoRail(c,d,m,true);
  c.addSpacer(4);

  let outer=c.addStack();
  outer.layoutHorizontally();
  outer.centerAlignContent();
  outer.addSpacer();
  let row=outer.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  renderTeamBlock(row,{img:imgs.club,name:smallTeamName(club.jp,true),fallback:club.badge,logoSize:38,nameSize:9.0,p1:club.p,p2:club.s,scale:CREST_SCALE[club.team]||.91,nameGap:1.5,width:47});
  row.addSpacer(4);
  let scoreBox=row.addStack();
  scoreBox.size=new Size(32,20);
  scoreBox.layoutHorizontally();
  scoreBox.centerAlignContent();
  scoreBox.addSpacer();
  let sc=heavy(scoreBox,centerMainText(d,m),d.mode==='POST'?15.5:d.mode==='NEXT'?13.2:14.5,CP_MU_THEME.ivory);
  sc.centerAlignText();
  scoreBox.addSpacer();
  row.addSpacer(4);
  renderTeamBlock(row,{img:imgs.opp,name:smallTeamName(m.opponentName),fallback:m.opponentShort,logoSize:38,nameSize:9.0,p1:'#4A5568',p2:'#20242D',scale:CREST_SCALE[m.opponentId]||CREST_SCALE.opponent_default||.90,nameGap:1.5,width:47});
  outer.addSpacer();
  c.addSpacer(3);

  let meta=c.addStack();
  meta.layoutHorizontally();
  meta.addSpacer();
  let mt=semibold(meta,m.kickoff,8.9,.99,'#F1E9D8');
  mt.centerAlignText();
  meta.addSpacer()
};

buildMedium=function(d,imgs){
  if(!CP_MU_IS())return CP_TOP_LAYOUT_BASE_BUILD_MEDIUM(d,imgs);
  let w=new ListWidget();
  w.backgroundGradient=bg();
  w.setPadding(4,10,4,10);
  let line=w.addStack();
  line.size=new Size(0,1);
  line.backgroundColor=C(club.p);
  w.addSpacer(2);
  buildHeaderMedium(w,d,imgs.club);
  w.addSpacer(2);
  buildMatchMedium(w,d,imgs);
  w.addSpacer(2);
  buildFooterMedium(w,d);
  w.addSpacer(1);
  w.refreshAfterDate=new Date(Date.now()+refreshDelay(d));
  return w
};

buildSmall=function(d,imgs){
  if(!CP_MU_IS())return CP_TOP_LAYOUT_BASE_BUILD_SMALL(d,imgs);
  let w=new ListWidget();
  w.backgroundGradient=bg();
  w.setPadding(7,8,7,8);
  buildHeaderSmall(w,d,imgs.club);
  w.addSpacer(4);
  buildMatchSmall(w,d,imgs);
  w.addSpacer(4);
  buildFooterSmall(w,d);
  w.addSpacer(1);
  w.refreshAfterDate=new Date(Date.now()+refreshDelay(d));
  return w
};
