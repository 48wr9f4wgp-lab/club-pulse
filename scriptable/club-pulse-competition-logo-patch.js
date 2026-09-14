const CP_COMP_ASSETS={
  PL:{id:39},PD:{id:140},CL:{id:2},EL:{id:3},ECL:{id:848},FAC:{id:45},EFL:{id:48},CDR:{id:143}
};
const CP_COMP_CDN='https://media.api-sports.io/football/leagues/';
function cpCompetitionKey(m){
  let s=String(m?.competitionShort||'').toUpperCase(),f=String(m?.competition||'').toLowerCase();
  if(s==='PL'||f.includes('プレミア')||f.includes('premier league'))return'PL';
  if(s==='LALIGA'||s==='PD'||f.includes('ラ・リーガ')||f.includes('laliga'))return'PD';
  if(s==='CL'||f.includes('チャンピオンズ')||f.includes('champions league'))return'CL';
  if(s==='EL'||f.includes('ヨーロッパリーグ')||f.includes('europa league'))return'EL';
  if(s==='ECL'||f.includes('カンファレンス')||f.includes('conference league'))return'ECL';
  if(s==='FA杯'||s==='FAC'||f.includes('faカップ')||f.includes('fa cup'))return'FAC';
  if(s==='EFL杯'||s==='EFL'||f.includes('eflカップ')||f.includes('efl cup')||f.includes('carabao')||f.includes('league cup'))return'EFL';
  if(s==='国王杯'||s==='CDR'||f.includes('国王杯')||f.includes('copa del rey'))return'CDR';
  return null
}
function cpCompPath(key){return path(`competition_${key}.png`)}
async function cpCacheLogo(url,key){
  if(!url||!key)return;
  try{let fm=files().fm,p=cpCompPath(key);if(fm.fileExists(p))return;let r=new Request(url);r.timeoutInterval=10;let i=await r.loadImage();fm.writeImage(p,i)}catch{}
}
async function cpPreloadKnownCompetitionLogos(){
  await Promise.all(Object.entries(CP_COMP_ASSETS).map(([key,v])=>cpCacheLogo(`${CP_COMP_CDN}${v.id}.png`,key)))
}
async function cpCacheDataCompetitionLogos(d){
  if(!d)return;
  await Promise.all([d.liveMatch,d.recentResult,d.nextMatch].filter(m=>m?.competitionLogo).map(m=>cpCacheLogo(m.competitionLogo,cpCompetitionKey(m)||`dyn_${String(m.competitionShort||'cup').replace(/[^\w-]/g,'_')}`)))
}
const cpMapMatchBase=mapMatch;
mapMatch=function(m){let x=cpMapMatchBase(m);if(x)x.competitionLogo=m?.competition?.emblem||null;return x};
const cpMapApiFixtureBase=mapApiFixture;
mapApiFixture=function(f,teamId,live=false){let x=cpMapApiFixtureBase(f,teamId,live);if(x)x.competitionLogo=f?.league?.logo||null;return x};
const cpLoadDataBase=loadData;
loadData=async function(t){await cpPreloadKnownCompetitionLogos();let d=await cpLoadDataBase(t);await cpCacheDataCompetitionLogos(d);return d};
const cpApplyNextBase=applyNextOverlay;
applyNextOverlay=async function(d){let x=await cpApplyNextBase(d);await cpCacheDataCompetitionLogos(x);return x};
const cpApplyLiveBase=applyLiveOverlay;
applyLiveOverlay=async function(d){let x=await cpApplyLiveBase(d);await cpCacheDataCompetitionLogos(x);return x};
function cpCompetitionLogoImage(m){
  try{
    let fm=files().fm,key=cpCompetitionKey(m),p=key?cpCompPath(key):null;
    if(p&&fm.fileExists(p))return fm.readImage(p);
    if(m?.competitionLogo){let dk=`dyn_${String(m.competitionShort||'cup').replace(/[^\w-]/g,'_')}`,dp=cpCompPath(dk);if(fm.fileExists(dp))return fm.readImage(dp)}
  }catch{}
  return null
}
function competitionPill(parent,m,small=false){
  let label=competitionReadable(m,small),z=competitionStyle(label),p=parent.addStack();
  p.layoutHorizontally();p.centerAlignContent();p.setPadding(small?2:2.5,small?5:7,small?2:2.5,small?5:7);p.cornerRadius=9;p.backgroundColor=C(z.bg,.94);p.borderWidth=.8;p.borderColor=C(z.bd,.82);
  let logo=cpCompetitionLogoImage(m);
  if(logo){
    let plate=p.addStack(),box=small?19:24,sz=small?15:19;
    plate.size=new Size(box,box);plate.cornerRadius=box/2;plate.backgroundColor=C('#FFFFFF',1);plate.borderWidth=1;plate.borderColor=C('#FFFFFF',1);plate.centerAlignContent();
    let im=plate.addImage(logo);im.imageSize=new Size(sz,sz);im.centerAlignImage();
    p.addSpacer(small?4:5)
  }
  text(p,label,small?7.3:7.2,true,1,z.fg)
}
