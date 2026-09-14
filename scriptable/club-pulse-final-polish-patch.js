// Club Pulse final polish v3.
// Scope is intentionally narrow: Bayern blue accent visibility only.
// Opponent crest contrast is handled by each club's generic card field, never by per-opponent exceptions.

const CP_FP_BASE_SIDE_PILL=sidePill;

sidePill=function(parent,m,small=false){
  if(club?.team!==5)return CP_FP_BASE_SIDE_PILL(parent,m,small);
  let q=small?CP_PILL_METRICS.small:CP_PILL_METRICS.medium,p=parent.addStack(),label=sideTag(m),t=typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null;
  p.setPadding(q.sideV,q.h,q.sideV,q.h);
  p.cornerRadius=q.r;
  p.backgroundColor=C('#121318',.94);
  p.borderWidth=.9;
  p.borderColor=C(t?.sideBorder||'#2D86D3',.86);
  text(p,label,q.font,true,1,'#F6F7F9')
};
