// Club Pulse Medium Scale Unification v3.
// Final Medium-only visual normalization layer.
// v3 measures both alpha-visible bounds and visible-pixel density so sparse, intricate crests do not look undersized.
// No club-specific scale table or renderer branches are used. Small is intentionally untouched.

const CP_MSU_HEADER_CREST_SIZE=19;
const CP_MSU_HEADER_CREST_SCALE=.90;
const CP_MSU_TEAM_CREST_SIZE=52;
const CP_MSU_TEAM_CREST_FALLBACK_SCALE=.90;
const CP_MSU_TEAM_WIDTH=96;
const CP_MSU_LOGO_SLOT_HEIGHT=58;
const CP_MSU_NAME_SLOT_HEIGHT=16;
const CP_MSU_OPTICAL_TARGET=.83;
const CP_MSU_DENSITY_TARGET=.74;
const CP_MSU_DENSITY_EXPONENT=.20;
const CP_MSU_OPTICAL_MIN=.88;
const CP_MSU_OPTICAL_MAX=1.14;
const CP_MSU_OPTICAL_CACHE_VERSION=3;
const CP_MSU_OPTICAL_BY_IMAGE=new Map();
const CP_MSU_BASE_IMAGE=image;

function cpMsuTheme(){return typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null}
function cpMsuCardText(t){return t?.cardText||t?.text||CP_COMMON_SHELL?.text||'#F8FAFC'}
function cpMsuShellText(){return CP_COMMON_SHELL?.text||'#F8FAFC'}
function cpMsuShellMuted(){return CP_COMMON_SHELL?.muted||'#AEB5C2'}
function cpMsuGuard(t,min=.62){if(!t)return t;t.lineLimit=1;t.minimumScaleFactor=min;return t}
function cpMsuHeaderNameSize(name){let n=String(name||'').length;return n>16?9.4:n>12?9.9:10.5}
function cpMsuTeamNameSize(name){let n=String(name||'').length;return n>9?10.6:n>7?11.1:11.6}
function cpMsuClamp(n,a,b){return Math.max(a,Math.min(b,n))}
function cpMsuProvider(url){let u=String(url||'').toLowerCase();if(u.includes('football-data'))return'football_data';if(u.includes('api-sports')||u.includes('api-football'))return'api_football';return'external'}
function cpMsuOpticalCachePath(){return path('medium_crest_optical_scale_v3.json')}
function cpMsuOpticalCacheKey(url,key){return`${cpMsuProvider(url)}_${String(key??'unknown').replace(/[^\w-]/g,'_')}`}
function cpMsuReadOpticalCache(){let c=readJSON(cpMsuOpticalCachePath(),null);return c?.version===CP_MSU_OPTICAL_CACHE_VERSION&&c?.values?c:{version:CP_MSU_OPTICAL_CACHE_VERSION,values:{}}}
function cpMsuWriteOpticalCache(c){try{writeJSON(cpMsuOpticalCachePath(),c)}catch{}}
function cpMsuOpticalScale(img){return img&&CP_MSU_OPTICAL_BY_IMAGE.has(img)?CP_MSU_OPTICAL_BY_IMAGE.get(img):CP_MSU_TEAM_CREST_FALLBACK_SCALE}

async function cpMsuMeasureOpticalScale(img){
  if(!img)return CP_MSU_TEAM_CREST_FALLBACK_SCALE;
  try{
    const b64=Data.fromPNG(img).toBase64String();
    const web=new WebView();
    await web.loadHTML('<html><body></body></html>');
    const js=`
      const done=(v)=>completion(v);
      const im=new Image();
      im.onload=()=>{
        try{
          const maxSide=160, ratio=Math.min(1,maxSide/Math.max(im.naturalWidth||1,im.naturalHeight||1));
          const w=Math.max(1,Math.round((im.naturalWidth||1)*ratio));
          const h=Math.max(1,Math.round((im.naturalHeight||1)*ratio));
          const c=document.createElement('canvas');c.width=w;c.height=h;
          const x=c.getContext('2d',{willReadFrequently:true});x.clearRect(0,0,w,h);x.drawImage(im,0,0,w,h);
          const d=x.getImageData(0,0,w,h).data;
          let minX=w,minY=h,maxX=-1,maxY=-1,count=0;
          for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){
            const a=d[(y*w+xx)*4+3];if(a>12){count++;if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(y<minY)minY=y;if(y>maxY)maxY=y;}
          }
          if(!count||maxX<minX||maxY<minY){done(null);return;}
          done(JSON.stringify({w,h,bw:maxX-minX+1,bh:maxY-minY+1,count}));
        }catch(e){done(null)}
      };
      im.onerror=()=>done(null);
      im.src='data:image/png;base64,${b64}';
    `;
    const raw=await web.evaluateJavaScript(js,true);
    if(!raw)return CP_MSU_TEAM_CREST_FALLBACK_SCALE;
    const m=typeof raw==='string'?JSON.parse(raw):raw;
    if(!m?.w||!m?.h||!m?.bw||!m?.bh||!m?.count)return CP_MSU_TEAM_CREST_FALLBACK_SCALE;
    const wx=cpMsuClamp(m.bw/m.w,.08,1),hy=cpMsuClamp(m.bh/m.h,.08,1);
    const bboxOccupancy=Math.sqrt(wx*hy);
    const fill=cpMsuClamp(m.count/(m.bw*m.bh),.12,1);
    const densityBoost=fill<CP_MSU_DENSITY_TARGET?Math.pow(CP_MSU_DENSITY_TARGET/fill,CP_MSU_DENSITY_EXPONENT):1;
    const rawScale=(CP_MSU_OPTICAL_TARGET/bboxOccupancy)*densityBoost;
    return cpMsuClamp(rawScale,CP_MSU_OPTICAL_MIN,CP_MSU_OPTICAL_MAX);
  }catch{return CP_MSU_TEAM_CREST_FALLBACK_SCALE}
}

image=async function(url,key){
  const img=await CP_MSU_BASE_IMAGE(url,key);
  if(family!=='medium'||!img)return img;
  try{
    const ck=cpMsuOpticalCacheKey(url,key),cache=cpMsuReadOpticalCache();
    let scale=Number(cache.values[ck]);
    if(!Number.isFinite(scale)){
      scale=await cpMsuMeasureOpticalScale(img);
      cache.values[ck]=Math.round(scale*1000)/1000;
      cpMsuWriteOpticalCache(cache);
    }
    CP_MSU_OPTICAL_BY_IMAGE.set(img,cpMsuClamp(scale,CP_MSU_OPTICAL_MIN,CP_MSU_OPTICAL_MAX));
  }catch{CP_MSU_OPTICAL_BY_IMAGE.set(img,CP_MSU_TEAM_CREST_FALLBACK_SCALE)}
  return img
};

function cpMsuTeamBlock(parent,opt,fg){
  const s=parent.addStack();
  s.size=new Size(CP_MSU_TEAM_WIDTH,0);
  s.layoutVertically();

  const logo=s.addStack();
  logo.size=new Size(CP_MSU_TEAM_WIDTH,CP_MSU_LOGO_SLOT_HEIGHT);
  logo.layoutHorizontally();
  logo.centerAlignContent();
  logo.addSpacer();
  badge(logo,opt.fallback,opt.img,CP_MSU_TEAM_CREST_SIZE,opt.p1,opt.p2,cpMsuOpticalScale(opt.img));
  logo.addSpacer();

  s.addSpacer(1);
  const name=s.addStack();
  name.size=new Size(CP_MSU_TEAM_WIDTH,CP_MSU_NAME_SLOT_HEIGHT);
  name.layoutHorizontally();
  name.centerAlignContent();
  name.addSpacer();
  const nm=cpMsuGuard(heavy(name,opt.name,cpMsuTeamNameSize(opt.name),fg),.60);
  nm.centerAlignText();
  name.addSpacer();
  return s
}

buildHeaderMedium=function(w,d,img){
  const t=cpMsuTheme(),fg=cpMsuShellText(),muted=cpMsuShellMuted(),accent=t?.headerAccent||t?.accentSoft||club?.a||muted;
  const h=w.addStack();
  h.layoutHorizontally();
  h.centerAlignContent();
  h.setPadding(0,3,0,3);

  badge(h,club.badge,img,CP_MSU_HEADER_CREST_SIZE,club.p,club.s,CP_MSU_HEADER_CREST_SCALE);
  h.addSpacer(7);

  const l=h.addStack();
  l.size=new Size(205,0);
  l.layoutVertically();
  const name=cpMsuGuard(heavy(l,club.name,cpMsuHeaderNameSize(club.name),fg),.56);
  const stamp=cpMsuGuard(text(l,`${updated(d.fetchedAt)}${d.stale?' · 保存データ':''}`,6.6,false,.76,muted),.78);
  name.lineLimit=1;stamp.lineLimit=1;

  h.addSpacer();
  const r=h.addStack();
  r.layoutVertically();
  r.centerAlignContent();
  const rk=cpMsuGuard(heavy(r,d.rank!=null?`${d.rank}位`:'–',12.5,fg),.88);rk.rightAlignText();
  const last=typeof cpPrLastSeasonLabel==='function'?cpPrLastSeasonLabel(d):null;
  const sub=last||`勝点 ${d.points??'–'}`;
  const st=cpMsuGuard(semibold(r,sub,7.2,.92,accent),.82);st.rightAlignText();
  return h
};

buildMatchMedium=function(w,d,imgs){
  const t=cpMsuTheme()||{},fg=cpMsuCardText(t),m=d.mode==='LIVE'?d.liveMatch:d.mode==='POST'?d.recentResult:d.nextMatch;
  const q=typeof cpPremiumCardMetrics==='function'?cpPremiumCardMetrics(false):{radius:16,border:.85,alpha:.72};
  const c=w.addStack();
  c.layoutVertically();
  c.setPadding(4,9,4,9);
  c.cornerRadius=q.radius;
  c.backgroundGradient=cardBg(d.mode);
  c.borderWidth=q.border;
  c.borderColor=C(t.cardBorder||t.border||CP_COMMON_SHELL?.edge||'#465164',q.alpha);
  if(!m){heavy(c,'試合データ未取得',11,fg);return}

  const top=c.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();
  cpMsuGuard(text(top,statusTitle(d,m),8,true,1,fg),.86);
  top.addSpacer(6);
  competitionPill(top,m);
  if(d.mode==='POST'){top.addSpacer(5);resultPill(top,m)}
  top.addSpacer();
  if(d.mode==='LIVE')cpMsuGuard(heavy(top,m.minute||'LIVE',10,fg),.86);
  else if(d.mode==='POST'){const ft=cpMsuGuard(heavy(top,'FT',10,t.muted||'#E4E4E8'),.90);ft.rightAlignText()}
  else sidePill(top,m);

  c.addSpacer(2);
  const outer=c.addStack();
  outer.layoutHorizontally();
  outer.centerAlignContent();
  outer.addSpacer();

  const row=outer.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  cpMsuTeamBlock(row,{img:imgs.club,name:club.jp,fallback:club.badge,p1:club.p,p2:club.s},fg);
  row.addSpacer(18);

  const score=row.addStack();
  score.size=new Size(44,30);
  score.layoutHorizontally();
  score.centerAlignContent();
  score.addSpacer();
  const mid=cpMsuGuard(heavy(score,centerMainText(d,m),d.mode==='POST'?26:d.mode==='NEXT'?20:22,fg),.78);
  mid.centerAlignText();
  score.addSpacer();

  row.addSpacer(18);
  cpMsuTeamBlock(row,{img:imgs.opp,name:m.opponentName,fallback:m.opponentShort,p1:'#4A5568',p2:'#20242D'},fg);
  outer.addSpacer();

  c.addSpacer(2);
  const meta=c.addStack();
  meta.layoutHorizontally();
  meta.addSpacer();
  if(typeof cpMetaText==='function')cpMetaText(meta,metaLine(d,m),fg,false);
  else{const mt=cpMsuGuard(semibold(meta,metaLine(d,m),8.7,.92,fg),.72);mt.centerAlignText()}
  meta.addSpacer();
};
