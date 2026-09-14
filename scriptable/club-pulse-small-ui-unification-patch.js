// Club Pulse Small UI Unification v3.
// Shared presentation behavior across every supported club.
// Keeps club identity in colors/crests, while standardizing labels, footer structure,
// provider-name normalization and venue presentation behavior.

const CP_UIU_JP_SMALL_LABELS={
  'アストン・ヴィラ':'ヴィラ',
  'クリスタル・パレス':'パレス',
  'ノッティンガム・フォレスト':'フォレスト',
  'レアル・ソシエダ':'ソシエダ',
  'ボルシア・ドルトムント':'ドルトムント',
  'レヴァークーゼン':'レヴァークーゼン',
  'フランクフルト':'フランクフルト',
  'シュトゥットガルト':'シュトゥットガルト',
  'フィオレンティーナ':'フィオレンティーナ',
  'フェイエノールト':'フェイエノールト',
  'エルヴァースベルク':'エルヴァース'
};

const CP_UIU_TEAM_ALIASES={
  'SC Paderborn':'パーダーボルン',
  'SC Paderborn 07':'パーダーボルン',
  'Paderborn 07':'パーダーボルン'
};

const CP_UIU_VENUE_ALIASES={
  'WerkTalent Stadion':'ワークタレント・スタジアム',
  'Johan Cruijff ArenA':'ヨハン・クライフ・アレナ',
  'Johan Cruijff Arena':'ヨハン・クライフ・アレナ',
  'AFAS Stadion':'AFASスタジアム',
  'Stadion Woudestein':'ワウデステイン・スタジアム',
  'Van Donge & De Roo Stadion':'ワウデステイン・スタジアム',
  'De Euroborg':'ユーロボルフ',
  'Euroborg':'ユーロボルフ',
  'De Grolsch Veste':'デ・フロルシュ・フェステ',
  'Grolsch Veste':'デ・フロルシュ・フェステ',
  'Stadion Galgenwaard':'ガルヘンワールト・スタジアム',
  'Galgenwaard Stadium':'ガルヘンワールト・スタジアム',
  'Stadion Feijenoord':'デ・カイプ',
  'De Kuip':'デ・カイプ',
  'Fortuna Sittard Stadion':'フォルトゥナ・シッタルト・スタジアム',
  'De Adelaarshorst':'デ・アデラールスホルスト',
  'Adelaarshorst':'デ・アデラールスホルスト',
  'Goffertstadion':'ホッフェルト・スタジアム',
  'Stadion de Goffert':'ホッフェルト・スタジアム',
  'MAC³PARK Stadion':'MAC³PARKスタジアム',
  'MAC3PARK Stadion':'MAC³PARKスタジアム',
  'Philips Stadion':'フィリップス・スタディオン',
  'Philips Stadium':'フィリップス・スタディオン',
  'Kooi Stadion':'コーイ・スタジアム',
  'Cambuur Stadion':'コーイ・スタジアム',
  'Abe Lenstra Stadion':'アベ・レンストラ・スタジアム',
  'Spartastadion Het Kasteel':'ヘット・カステール',
  'Sparta-Stadion Het Kasteel':'ヘット・カステール',
  'Het Kasteel':'ヘット・カステール',
  'BUKO Stadion':'BUKOスタジアム',
  'Koning Willem II Stadion':'コーニング・ヴィレムII・スタジアム'
};

function cpUiuCanonicalName(name){
  const n=String(name||'').trim();
  if(!n)return'未定';
  if(CP_UIU_TEAM_ALIASES[n])return CP_UIU_TEAM_ALIASES[n];
  const canonical=typeof cpCanonicalTeamName==='function'?cpCanonicalTeamName(n):n;
  return CP_UIU_TEAM_ALIASES[canonical]||canonical
}

function cpUiuCanonicalVenue(name){
  const n=String(name||'').trim();
  if(!n||n==='会場未定')return n||'会場未定';
  if(CP_UIU_VENUE_ALIASES[n])return CP_UIU_VENUE_ALIASES[n];
  const registry=typeof CP_VENUE_DISPLAY_NAMES==='object'?CP_VENUE_DISPLAY_NAMES[n]:null;
  return CP_UIU_VENUE_ALIASES[registry]||registry||n
}

function cpUiuNormalizeMatch(m){
  if(!m)return m;
  return {...m,
    opponentName:cpUiuCanonicalName(m.opponentName),
    venue:cpUiuCanonicalVenue(m.venue)
  }
}

if(typeof mapMatch==='function'){
  const CP_UIU_BASE_MAP_MATCH=mapMatch;
  mapMatch=function(m){return cpUiuNormalizeMatch(CP_UIU_BASE_MAP_MATCH(m))}
}

if(typeof mapApiFixture==='function'){
  const CP_UIU_BASE_MAP_API_FIXTURE=mapApiFixture;
  mapApiFixture=function(f,teamId,live=false){
    const out=CP_UIU_BASE_MAP_API_FIXTURE(f,teamId,live);
    if(!out)return out;
    const home=f?.teams?.home,away=f?.teams?.away,
          opp=home?.id===teamId?away:home,
          raw=String(opp?.name||out.opponentName||'').trim();
    return cpUiuNormalizeMatch({...out,opponentName:raw||out.opponentName})
  }
}

// Final data boundary: normalize NEXT/LIVE/POST regardless of provider, stale cache,
// resilience wrapper or earlier mapper. This keeps Medium and Small on one label source.
if(typeof loadData==='function'){
  const CP_UIU_BASE_LOAD_DATA=loadData;
  loadData=async function(...args){
    const d=await CP_UIU_BASE_LOAD_DATA(...args);
    if(!d)return d;
    return {...d,
      liveMatch:cpUiuNormalizeMatch(d.liveMatch),
      recentResult:cpUiuNormalizeMatch(d.recentResult),
      nextMatch:cpUiuNormalizeMatch(d.nextMatch)
    }
  }
}

// Cached match objects may predate v3 normalization. Keep the metadata boundary safe
// without deleting or rewriting user cache.
if(typeof metaLine==='function'){
  const CP_UIU_BASE_META_LINE=metaLine;
  metaLine=function(d,m){
    if(!m)return CP_UIU_BASE_META_LINE(d,m);
    const normalized=cpUiuNormalizeMatch(m);
    return CP_UIU_BASE_META_LINE(d,normalized)
  }
}

if(typeof cpSpTeamLabel==='function'){
  cpSpTeamLabel=function(name,fallback,isClub=false){
    const raw=isClub?(club?.jp||club?.short||''):cpUiuCanonicalName(name),
          n=CP_UIU_JP_SMALL_LABELS[raw]||raw,
          len=Array.from(String(n||'')).length;
    if(len<=CP_SP_FULL_NAME_LIMIT)return n;
    const alias=CP_SP_SMALL_ALIASES?.[n]||CP_SP_SMALL_ALIASES?.[raw];
    if(alias&&/[^\x20-\x7E]/.test(alias))return alias;
    if(len<=CP_SP_SOFT_NAME_LIMIT)return n;
    const fb=String(fallback||'').trim();
    if(/^[A-Z0-9.-]{2,5}$/i.test(fb))return fb;
    return n
  }
}

function cpUiuFormRow(w,d,family='medium'){
  const q=CP_FORM_SYSTEM?.[family]||CP_FORM_SYSTEM?.medium,
        t=typeof cpFormTheme==='function'?cpFormTheme():(typeof CP_ACTIVE_THEME==='function'?CP_ACTIVE_THEME():null),
        form=typeof cpFormValues==='function'?cpFormValues(d):[...(d?.form||[])],
        f=w.addStack();
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

  const latest=text(f,'最新 →',q.label,true,1,typeof cpFormShellText==='function'?cpFormShellText():'#F8FAFC');
  latest.lineLimit=1;latest.minimumScaleFactor=.92;
  f.addSpacer(family==='medium'?7:5);
  const values=Array.isArray(form)?form.slice(0,5):[];
  while(values.length<5)values.push('-');
  for(let i=0;i<values.length;i++){
    if(typeof cpRenderCanonicalFormChip==='function')cpRenderCanonicalFormChip(f,values[i],i===0,family);
    else formChip(f,values[i],i===0,family==='small');
    if(i<values.length-1)f.addSpacer(q.gap)
  }
  f.addSpacer();
  return f
}

if(typeof buildFooterMedium==='function')buildFooterMedium=function(w,d){return cpUiuFormRow(w,d,'medium')};
if(typeof buildFooterSmall==='function')buildFooterSmall=function(w,d){return cpUiuFormRow(w,d,'small')};
