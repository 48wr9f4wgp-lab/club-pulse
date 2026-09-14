// Club Pulse Manchester United theme v4.
// v4 keeps the visual treatment frozen and routes match metadata through the canonical typography contract.

const CP_MU_THEME={gold:'#E7B93F',goldSoft:'#F3D77B',ivory:'#F7F1E3',red:'#DA291C',redDeep:'#720810',black:'#050506'};
const CP_MU_IS=()=>club?.team===66;
const CP_MU_BASE_BG=bg,CP_MU_BASE_CARD_BG=cardBg,CP_MU_BASE_BADGE=badge,CP_MU_BASE_SIDE=sidePill,CP_MU_BASE_FORM=formChip;
const CP_FORM_VIEW=d=>{let f=[...(d?.form||[])];if(String(qa||'').toLowerCase()==='post'){let r=d?.recentResult?.result||'W';if(f.length)f[0]=r;else f=[r,'-','-','-','-']}return f};

bg=function(){
  if(!CP_MU_IS())return CP_MU_BASE_BG();
  return gradient([C('#030304'),C('#08080A'),C('#160305'),C('#3B0509'),C('#7B0B12')],[0,.34,.61,.82,1])
};
cardBg=function(mode){
  if(!CP_MU_IS())return CP_MU_BASE_CARD_BG(mode);
  if(mode==='LIVE')return gradient([C('#A50E18',.98),C('#5C070D',.96),C('#170508'),C('#08090B')],[0,.24,.58,1],true);
  if(mode==='POST')return gradient([C('#7E0A12',.98),C('#44060A',.95),C('#17070A'),C('#08090B')],[0,.25,.58,1],true);
  return gradient([C('#8A0C14',.98),C('#4B060B',.94),C('#16070A'),C('#08090B')],[0,.24,.58,1],true)
};
badge=function(p,fallback,img,size=28,p1=club.p,p2=club.s,scale=1){
  if(!CP_MU_IS()||fallback!==club.badge)return CP_MU_BASE_BADGE(p,fallback,img,size,p1,p2,scale);
  let o=p.addStack();o.size=new Size(size+5,size+5);o.cornerRadius=(size+5)/2;o.backgroundColor=C(CP_MU_THEME.gold,.08);o.borderWidth=.8;o.borderColor=C(CP_MU_THEME.gold,.54);o.centerAlignContent();
  let i=o.addStack();i.size=new Size(size,size);i.cornerRadius=size/2;i.centerAlignContent();
  if(img){let im=i.addImage(img),z=Math.round((size-1)*scale);im.imageSize=new Size(z,z)}else{i.backgroundGradient=gradient([C(p1),C(p2)],[0,1]);let t=heavy(i,fallback,size<30?8:10);t.centerAlignText()}
  return o
};
sidePill=function(parent,m,small=false){
  if(!CP_MU_IS())return CP_MU_BASE_SIDE(parent,m,small);
  let p=parent.addStack(),label=sideTag(m);p.setPadding(2,small?6:7,2,small?6:7);p.cornerRadius=8;p.backgroundColor=C('#0B0B0E',.96);p.borderWidth=.9;p.borderColor=C(CP_MU_THEME.gold,.72);text(p,label,small?6.8:6.8,true,1,CP_MU_THEME.ivory);return p
};
formChip=function(parent,r,latest=false,small=false){
  if(!CP_MU_IS())return CP_MU_BASE_FORM(parent,r,latest,small);
  let z={W:['勝','#8EE9A4','#11321E'],D:['分','#ECECF0','#35373C'],L:['負','#FF8E87','#451716'],'-':['–','#B7BAC2','#25272B']}[r]||['–','#B7BAC2','#25272B'],p=parent.addStack();
  p.setPadding(small?2.2:2,small?6.3:7,small?2.2:2,small?6.3:7);p.cornerRadius=latest?9:8;p.backgroundColor=C(z[2],.99);p.borderWidth=latest?1:.5;p.borderColor=latest?C(CP_MU_THEME.gold,.88):C(z[1],.38);text(p,z[0],small?7.5:7,true,1,z[1]);return p
};

buildHeaderMedium=function(w,d,img){
  if(!CP_MU_IS()){
    let h=w.addStack();h.layoutHorizontally();h.centerAlignContent();badge(h,club.badge,img,20,club.p,club.s,CREST_SCALE[club.team]||1.06);h.addSpacer(6);let l=h.addStack();l.layoutVertically();heavy(l,club.name,10.5);text(l,`${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,6.6,false,.74,'#E0E0E4');h.addSpacer();let r=h.addStack();r.layoutVertically();let rk=heavy(r,d.rank!=null?`${d.rank}位`:'–',12.5);rk.rightAlignText();let pt=semibold(r,`勝点 ${d.points??'–'}`,7.2,.78);pt.rightAlignText();return
  }
  let h=w.addStack();h.layoutHorizontally();h.centerAlignContent();badge(h,club.badge,img,20,club.p,club.s,CREST_SCALE[club.team]||.91);h.addSpacer(6);let l=h.addStack();l.layoutVertically();heavy(l,club.name,10.6,CP_MU_THEME.ivory);text(l,`${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,6.6,false,.72,'#C8C5BE');h.addSpacer();let r=h.addStack();r.layoutVertically();let rk=heavy(r,d.rank!=null?`${d.rank}位`:'–',12.5,CP_MU_THEME.ivory);rk.rightAlignText();let pt=semibold(r,`勝点 ${d.points??'–'}`,7.2,.76,CP_MU_THEME.goldSoft);pt.rightAlignText()
};

buildFooterMedium=function(w,d){
  let form=CP_FORM_VIEW(d);
  if(!CP_MU_IS()){
    let f=w.addStack();f.layoutHorizontally();f.centerAlignContent();f.setPadding(2,8,2,8);f.cornerRadius=9;f.backgroundGradient=gradient([C('#090A0D',.99),C('#101116',.98),C(club.s,.28)],[0,.62,1]);text(f,'最新',6.8,true,.98,'#F4F4F6');f.addSpacer(2);text(f,'→',6.8,true,1,club.a);f.addSpacer(6);for(let i=0;i<form.length;i++){formChip(f,form[i],i===0,false);if(i<form.length-1)f.addSpacer(3)}f.addSpacer();return
  }
  let f=w.addStack();f.layoutHorizontally();f.centerAlignContent();f.setPadding(2,8,2,8);f.cornerRadius=9;f.backgroundGradient=gradient([C('#070709',.99),C('#0D0D10',.99),C('#3B080C',.64)],[0,.62,1]);f.borderWidth=.5;f.borderColor=C(CP_MU_THEME.gold,.25);text(f,'最新',6.8,true,.98,CP_MU_THEME.ivory);f.addSpacer(2);text(f,'→',7,true,1,CP_MU_THEME.gold);f.addSpacer(6);for(let i=0;i<form.length;i++){formChip(f,form[i],i===0,false);if(i<form.length-1)f.addSpacer(3)}f.addSpacer()
};

buildFooterSmall=function(w,d){
  let form=CP_FORM_VIEW(d);
  if(!CP_MU_IS()){
    let f=w.addStack();f.layoutHorizontally();f.centerAlignContent();f.setPadding(1,1,1,1);f.addSpacer();text(f,'最新',7.6,true,.99,'#F7F7F8');f.addSpacer(2);text(f,'→',7.6,true,1,club.a);f.addSpacer(5);for(let i=0;i<form.length;i++){formChip(f,form[i],i===0,true);if(i<form.length-1)f.addSpacer(3)}f.addSpacer();return
  }
  let f=w.addStack();f.layoutHorizontally();f.centerAlignContent();f.setPadding(1,1,1,1);f.addSpacer();text(f,'最新',7.6,true,.99,CP_MU_THEME.ivory);f.addSpacer(2);text(f,'→',7.6,true,1,CP_MU_THEME.gold);f.addSpacer(5);for(let i=0;i<form.length;i++){formChip(f,form[i],i===0,true);if(i<form.length-1)f.addSpacer(3)}f.addSpacer()
};

buildMatchMedium=function(w,d,imgs){
  let m=d.mode==='LIVE'?d.liveMatch:d.mode==='POST'?d.recentResult:d.nextMatch,c=w.addStack();c.layoutVertically();c.setPadding(4,9,4,9);c.cornerRadius=16;c.backgroundGradient=cardBg(d.mode);if(CP_MU_IS()){c.borderWidth=.65;c.borderColor=C(CP_MU_THEME.gold,.34)}if(!m){heavy(c,'試合データ未取得',11);return}
  let top=c.addStack();top.layoutHorizontally();top.centerAlignContent();text(top,statusTitle(d,m),8,true,1,CP_MU_IS()?CP_MU_THEME.ivory:(d.mode==='POST'?'#E4E4E8':d.mode==='LIVE'?'#FFE3E0':'#F2F2F5'));top.addSpacer(6);competitionPill(top,m);if(d.mode==='POST'){top.addSpacer(5);resultPill(top,m)}top.addSpacer();if(d.mode==='LIVE')heavy(top,m.minute||'LIVE',10);else if(d.mode!=='POST')sidePill(top,m);c.addSpacer(2);
  let outer=c.addStack();outer.layoutHorizontally();outer.centerAlignContent();outer.addSpacer();let row=outer.addStack();row.layoutHorizontally();row.centerAlignContent();renderTeamBlock(row,{img:imgs.club,name:club.jp,sub:'',fallback:club.badge,logoSize:56,nameSize:12,subSize:0,p1:club.p,p2:club.s,scale:CREST_SCALE[club.team]||.91,nameGap:1,width:94});row.addSpacer(d.mode==='POST'?16:20);let mid=heavy(row,centerMainText(d,m),d.mode==='POST'?27:d.mode==='NEXT'?14:22,CP_MU_IS()?CP_MU_THEME.ivory:'#FFFFFF');mid.centerAlignText();row.addSpacer(d.mode==='POST'?16:20);renderTeamBlock(row,{img:imgs.opp,name:m.opponentName,sub:'',fallback:m.opponentShort,logoSize:56,nameSize:12,subSize:0,p1:'#4A5568',p2:'#20242D',scale:CREST_SCALE[m.opponentId]||CREST_SCALE.opponent_default||.90,nameGap:1,width:94});outer.addSpacer();c.addSpacer(2);
  let meta=c.addStack();meta.layoutHorizontally();meta.addSpacer();cpMetaText(meta,metaLine(d,m),CP_MU_IS()?'#F1E9D8':'#FFFFFF',false);meta.addSpacer()
};

buildMatchSmall=function(w,d,imgs){
  let m=d.mode==='LIVE'?d.liveMatch:d.mode==='POST'?d.recentResult:d.nextMatch,c=w.addStack();c.layoutVertically();c.setPadding(6,6,6,6);c.cornerRadius=14;c.backgroundGradient=cardBg(d.mode);if(CP_MU_IS()){c.borderWidth=.6;c.borderColor=C(CP_MU_THEME.gold,.30)}if(!m){heavy(c,'試合データ未取得',10);return}
  let top=c.addStack();top.layoutHorizontally();top.centerAlignContent();text(top,d.mode==='POST'?'終了':d.mode==='NEXT'?'次戦':statusTitle(d,m),8.2,true,1,CP_MU_IS()?CP_MU_THEME.ivory:(d.mode==='POST'?'#E4E4E8':d.mode==='LIVE'?'#FFE3E0':'#F4F4F6'));top.addSpacer(5);competitionPill(top,m,true);top.addSpacer();if(d.mode==='LIVE')heavy(top,m.minute||'LIVE',9.5);else if(d.mode==='POST')resultPill(top,m,true);else sidePill(top,m,true);c.addSpacer(5);
  let outer=c.addStack();outer.layoutHorizontally();outer.centerAlignContent();outer.addSpacer();let row=outer.addStack();row.layoutHorizontally();row.centerAlignContent();renderTeamBlock(row,{img:imgs.club,name:smallTeamName(club.jp,true),fallback:club.badge,logoSize:40,nameSize:9.2,p1:club.p,p2:club.s,scale:CREST_SCALE[club.team]||.91,nameGap:2,width:48});row.addSpacer(4);let scoreBox=row.addStack();scoreBox.size=new Size(32,22);scoreBox.layoutHorizontally();scoreBox.centerAlignContent();scoreBox.addSpacer();let sc=heavy(scoreBox,centerMainText(d,m),d.mode==='POST'?16:d.mode==='NEXT'?13.5:15,CP_MU_IS()?CP_MU_THEME.ivory:'#FFFFFF');sc.centerAlignText();scoreBox.addSpacer();row.addSpacer(4);renderTeamBlock(row,{img:imgs.opp,name:smallTeamName(m.opponentName),fallback:m.opponentShort,logoSize:40,nameSize:9.2,p1:'#4A5568',p2:'#20242D',scale:CREST_SCALE[m.opponentId]||CREST_SCALE.opponent_default||.90,nameGap:2,width:48});outer.addSpacer();c.addSpacer(4);
  let meta=c.addStack();meta.layoutHorizontally();meta.addSpacer();cpMetaText(meta,m.kickoff,CP_MU_IS()?'#F1E9D8':'#F7F7F8',true);meta.addSpacer()
};
