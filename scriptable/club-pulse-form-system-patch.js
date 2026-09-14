// Club Pulse Canonical Form System v1.
// One shared footer/form renderer for every supported club and every match state.
// Loaded last so older UI/theme/club patches cannot shrink W/D/L/unknown chips again.

const CP_FORM_SYSTEM={
  medium:{label:8.2,arrow:8.6,chip:9.2,v:2.8,h:7,gap:4,footerV:2,footerH:8,radius:9},
  small:{label:7.8,arrow:8.0,chip:8.4,v:2.4,h:5.7,gap:3,footerV:1,footerH:1,radius:8}
};
const CP_FORM_RESULT_STYLE={
  W:{label:'勝',fg:'#8EE9A4',bg:'#11321E'},
  D:{label:'分',fg:'#ECECF0',bg:'#35373C'},
  L:{label:'負',fg:'#FF8E87',bg:'#451716'},
  '-':{label:'－',fg:'#B7BAC2',bg:'#25272B'}
};

function cpFormTheme(){return typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null}
function cpFormValues(d){
  let src=typeof CP_FORM_VIEW==='function'?CP_FORM_VIEW(d):[...(d?.form||[])];
  src=Array.isArray(src)?src.slice(0,5):[];
  while(src.length<5)src.push('-');
  return src
}
function cpFormResultStyle(r){return CP_FORM_RESULT_STYLE[r]||CP_FORM_RESULT_STYLE['-']}
function cpFormAccent(){
  const t=cpFormTheme();
  return t?.accent||t?.accentSoft||club?.a||CP_DESIGN_TOKENS?.shell?.edge||'#9AA6B8'
}
function cpFormShellText(){return CP_DESIGN_TOKENS?.shell?.text||CP_COMMON_SHELL?.text||'#F8FAFC'}

function cpRenderCanonicalFormChip(parent,r,latest=false,family='medium'){
  const q=CP_FORM_SYSTEM[family]||CP_FORM_SYSTEM.medium,z=cpFormResultStyle(r),p=parent.addStack();
  p.setPadding(q.v,q.h,q.v,q.h);
  p.cornerRadius=latest?q.radius:q.radius-1;
  p.backgroundColor=C(z.bg,.99);
  p.borderWidth=latest?1:.55;
  p.borderColor=latest?C(cpFormAccent(),.86):C(z.fg,.42);
  const tx=heavy(p,z.label,q.chip,z.fg);
  tx.lineLimit=1;
  tx.minimumScaleFactor=1;
  tx.centerAlignText();
  return p
}

formChip=function(parent,r,latest=false,small=false){
  return cpRenderCanonicalFormChip(parent,r,latest,small?'small':'medium')
};

function cpRenderCanonicalFormRow(w,d,family='medium'){
  const q=CP_FORM_SYSTEM[family]||CP_FORM_SYSTEM.medium,t=cpFormTheme(),form=cpFormValues(d),f=w.addStack();
  f.layoutHorizontally();f.centerAlignContent();
  if(family==='medium'){
    f.setPadding(q.footerV,q.footerH,q.footerV,q.footerH);
    f.cornerRadius=9;
    f.backgroundColor=C(t?.panelDeep||CP_COMMON_SHELL?.rail||'#080D17',.96);
    f.borderWidth=.55;
    f.borderColor=C(CP_COMMON_SHELL?.border||'#465164',.84)
  }else{
    f.setPadding(q.footerV,q.footerH,q.footerV,q.footerH);
    f.addSpacer()
  }
  const latest=text(f,'最新',q.label,true,1,cpFormShellText());
  latest.lineLimit=1;
  f.addSpacer(2);
  const arrow=text(f,'→',q.arrow,true,1,cpFormAccent());
  arrow.lineLimit=1;
  f.addSpacer(family==='medium'?7:5);
  for(let i=0;i<form.length;i++){
    cpRenderCanonicalFormChip(f,form[i],i===0,family);
    if(i<form.length-1)f.addSpacer(q.gap)
  }
  f.addSpacer();
  return f
}

buildFooterMedium=function(w,d){return cpRenderCanonicalFormRow(w,d,'medium')};
buildFooterSmall=function(w,d){return cpRenderCanonicalFormRow(w,d,'small')};
