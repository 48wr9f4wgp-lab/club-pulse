// Club Pulse Hero Prototype v0.47
// Multi-club post-match hero widget for Scriptable.
// Prototype data source: FotMob web JSON endpoints (no API key).
// Commercial release must use a licensed/approved production data source.

const TEAM_CONFIGS = {
  real: {
    teamId: 8633,
    clubName: 'レアル・マドリード',
    smallName: 'レアル',
    clubShort: 'RMA',
    storageKey: 'realmadrid',
    accent: '#F3C75B',
    accent2: '#C9D2FF',
    border: '#75683E',
    borderSoft: '#4A4535',
  },
  barca: {
    teamId: 8634,
    clubName: 'FCバルセロナ',
    smallName: 'バルサ',
    clubShort: 'BAR',
    storageKey: 'barcelona',
    accent: '#5B8CFF',
    accent2: '#E34E70',
    border: '#3D5E9D',
    borderSoft: '#71334F',
  },
  manu: {
    teamId: 10260,
    clubName: 'マンチェスター・ユナイテッド',
    smallName: 'マンU',
    clubShort: 'MUN',
    storageKey: 'manu',
    accent: '#FF5A5F',
    accent2: '#F3C75B',
    border: '#8C3D42',
    borderSoft: '#624A32',
  },
  bayern: {
    teamId: 9823,
    clubName: 'バイエルン・ミュンヘン',
    smallName: 'バイエルン',
    clubShort: 'FCB',
    storageKey: 'bayern',
    accent: '#F0445E',
    accent2: '#5A7FFF',
    border: '#8A3448',
    borderSoft: '#394D8D',
  },
  city: {
    teamId: 8456,
    clubName: 'マンチェスター・シティ',
    smallName: 'マンC',
    clubShort: 'MCI',
    storageKey: 'mancity',
    accent: '#79CCF5',
    accent2: '#E8F6FF',
    border: '#4A8FB5',
    borderSoft: '#3B5A70',
  },
  psg: {
    teamId: 9847,
    clubName: 'パリ・サンジェルマン',
    smallName: 'PSG',
    clubShort: 'PSG',
    storageKey: 'psg',
    accent: '#5D7FFF',
    accent2: '#FF536A',
    border: '#3F568F',
    borderSoft: '#803746',
  },
};

const CP_BASE = {
  base: 'https://www.fotmob.com/api/data',
  imageBase: 'https://images.fotmob.com/image_resources',
  cacheTtlMs: 60 * 60 * 1000,
  cacheNearMatchMs: 10 * 60 * 1000,
  cacheMatchDayMs: 15 * 60 * 1000,
  cacheStaleRetryMs: 5 * 60 * 1000,
  refreshMs: 5 * 60 * 1000,
};

let activeTeamKey = 'real';
let CP = {...CP_BASE, ...TEAM_CONFIGS.real};

const UI = {
  bg: '#060910',
  panel: '#111C35',
  panelDark: '#0B1730',
  hero: '#0D1320',
  border: '#2A3D66',
  borderSoft: '#20345A',
  accent: '#F3C75B',
  accent2: '#C9D2FF',
  text: '#FFFFFF',
  sub: '#DCE6F8',
};

const fm = FileManager.local();
const dir = fm.joinPath(fm.documentsDirectory(), 'ClubPulseHeroFotMob');
if (!fm.fileExists(dir)) fm.createDirectory(dir, true);

let dataPath = null;
let auditPath = null;

function normalizeTeamKey(value){
  const raw=String(value||'').toLowerCase();

  const aliases={
    real:['real','rma','madrid','realmadrid'],
    barca:['barca','barcelona','fcb'],
    manu:['manu','manutd','manchesterunited','united','mun'],
    bayern:['bayern','munich','bayernmunich','fcbayern'],
    city:['city','mancity','manchestercity','mcfc','mci'],
    psg:['psg','paris','parissaintgermain','parissg'],
  };

  for(const [key,list] of Object.entries(aliases)){
    if(list.some(x=>raw.split(/[\s,;|/]+/).includes(x))) return key;
  }

  return null;
}

function setActiveTeam(key){
  const safe=TEAM_CONFIGS[key]?key:'real';
  activeTeamKey=safe;
  CP={...CP_BASE,...TEAM_CONFIGS[safe]};

  UI.accent=CP.accent || '#F3C75B';
  UI.accent2=CP.accent2 || '#C9D2FF';
  UI.border=CP.border || '#2A3D66';
  UI.borderSoft=CP.borderSoft || '#20345A';

  // Preserve the already-verified Real Madrid cache/log filenames.
  dataPath=fm.joinPath(
    dir,
    safe==='real' ? 'realmadrid_v2.json' : CP.storageKey+'_v2.json'
  );

  auditPath=fm.joinPath(
    dir,
    safe==='real' ? 'audit_v01.json' : 'audit_'+CP.storageKey+'_v01.json'
  );
}

setActiveTeam('real');

function C(hex, alpha=1){ return new Color(hex, alpha); }
function spacer(p,n){ p.addSpacer(n); }

function readJSON(path, fallback=null){
  try { return fm.fileExists(path) ? JSON.parse(fm.readString(path)) : fallback; }
  catch { return fallback; }
}
function writeJSON(path, value){
  try { fm.writeString(path, JSON.stringify(value)); } catch {}
}

function auditSnapshot(data, origin='runtime'){
  return {
    observedAt: Date.now(),
    origin,
    fetchedAt: Number(data?.fetchedAt||0),
    stale: Boolean(data?.stale),
    lastError: data?.lastError ? String(data.lastError) : null,
    fixtureId: data?.fixture?.id ?? null,
    fixtureDate: data?.fixture?.date ?? null,
    opponent: data?.fixture?.opponent ?? null,
    ours: data?.fixture?.ours ?? null,
    theirs: data?.fixture?.theirs ?? null,
    result: data?.fixture?.result ?? null,
    heroId: data?.hero?.id ?? null,
    heroName: data?.hero?.name ?? null,
    heroRating: data?.hero?.rating ?? null,
    nextId: data?.next?.id ?? null,
    nextDate: data?.next?.date ?? null,
    nextOpponent: data?.next?.opponent ?? null,
  };
}

function auditEvents(prev,cur){
  const events=[];
  if(!prev) return ['INITIAL'];

  if(prev.fixtureId!==cur.fixtureId){
    events.push('FIXTURE_CHANGED');
  }else if(
    prev.ours!==cur.ours ||
    prev.theirs!==cur.theirs ||
    prev.result!==cur.result
  ){
    events.push('RESULT_CHANGED');
  }

  if(prev.heroId!==cur.heroId || prev.heroRating!==cur.heroRating){
    events.push('HERO_CHANGED');
  }

  if(prev.nextId!==cur.nextId){
    events.push('NEXT_CHANGED');
  }

  if(Boolean(prev.stale)!==Boolean(cur.stale)){
    events.push(cur.stale?'STALE_ON':'STALE_OFF');
  }

  return events;
}

function recordAudit(data,origin='runtime'){
  try{
    const store=readJSON(auditPath,{records:[]}) || {records:[]};
    const records=Array.isArray(store.records)?store.records:[];
    const prev=records.length?records[records.length-1]:null;
    const cur=auditSnapshot(data,origin);
    const events=auditEvents(prev,cur);

    const heartbeatDue=
      !prev ||
      (cur.observedAt-Number(prev.observedAt||0) >= 6*60*60*1000);

    if(events.length || heartbeatDue){
      cur.events=events.length?events:['HEARTBEAT'];
      records.push(cur);
      while(records.length>80) records.shift();
      writeJSON(auditPath,{version:1,records});
    }
  }catch{}
}

function readAudit(){
  const store=readJSON(auditPath,{records:[]}) || {records:[]};
  return Array.isArray(store.records)?store.records:[];
}

function fmtAuditTime(ms){
  if(!ms) return '—';
  try{
    const f=new DateFormatter();
    f.locale='ja_JP';
    f.dateFormat='M/d HH:mm';
    return f.string(new Date(ms));
  }catch{return '—';}
}

function buildDiagnostics(data){
  const w=new ListWidget();
  w.backgroundColor=C(UI.bg);
  w.setPadding(12,12,12,12);

  const root=w.addStack();
  root.layoutVertically();

  txtLarge(root,'CLUB PULSE 診断 · '+CP.smallName,14,'heavy',UI.text,1);
  spacer(root,6);

  const head=root.addStack();
  head.layoutHorizontally();
  txtLarge(head,'実データ',9.5,'heavy',UI.accent,1);
  head.addSpacer();
  staleBadge(head,data,7);

  spacer(root,6);

  const box=root.addStack();
  box.layoutVertically();
  box.setPadding(8,9,8,9);
  box.cornerRadius=11;
  box.backgroundColor=C(UI.panel,.98);
  box.borderWidth=1;
  box.borderColor=C(UI.border,.82);

  txtLarge(
    box,
    '取得 '+fmtAuditTime(data?.fetchedAt),
    9.4,'semibold',UI.sub,1
  );
  spacer(box,2);
  txtLarge(
    box,
    '前回 '+String(data?.fixture?.id??'—')+'  '+compact(data?.fixture?.opponent,16),
    9.8,'bold',UI.text,1
  );
  txtLarge(
    box,
    '結果 '+String(data?.fixture?.ours??'—')+'-'+String(data?.fixture?.theirs??'—')+' / '+String(data?.fixture?.result??'—'),
    9.8,'semibold',UI.text,1
  );
  txtLarge(
    box,
    '最高評価 '+compact(displayPlayerName(data?.hero?.name),12)+' '+(data?.hero?.rating?.toFixed?.(1)??'—'),
    9.8,'semibold',UI.text,1
  );
  txtLarge(
    box,
    '次戦 '+String(data?.next?.id??'—')+'  '+compact(data?.next?.opponent||'なし',16),
    9.8,'semibold',UI.text,1
  );

  spacer(root,7);
  txtLarge(root,'履歴',9.5,'heavy',UI.accent,1);
  spacer(root,3);

  const records=readAudit().slice(-6).reverse();
  if(!records.length){
    txtLarge(root,'まだ診断履歴なし',9.2,'medium',UI.sub,.85);
  }else{
    for(const r of records){
      const row=root.addStack();
      row.layoutVertically();
      const ev=(r.events||[]).join(',');
      txtLarge(
        row,
        fmtAuditTime(r.observedAt)+'  '+(ev||'—'),
        8.2,'bold',UI.text,1
      );
      txtLarge(
        row,
        compact(r.opponent,12)+' '+String(r.ours??'—')+'-'+String(r.theirs??'—')+
          ' / '+compact(displayPlayerName(r.heroName),9),
        7.8,'medium',UI.sub,.95
      );
      spacer(root,3);
    }
  }

  return w;
}

async function getJSON(path){
  const r = new Request(CP.base + path);
  r.headers = {
    'Accept':'application/json',
    'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
  };
  r.timeoutInterval = 15;
  const j = await r.loadJSON();
  const status = r.response?.statusCode || 200;
  if(status >= 400) throw new Error('FotMob HTTP ' + status);
  return j;
}

function imgTeam(id){ return CP.imageBase + '/logo/teamlogo/' + id + '.png'; }
function imgPlayer(id){ return CP.imageBase + '/playerimages/' + id + '.png'; }

async function cachedImage(url,key){
  if(!url) return null;
  const p = fm.joinPath(dir, String(key).replace(/[^a-zA-Z0-9_-]/g,'_') + '.img');
  try {
    if(fm.fileExists(p)) return fm.readImage(p);
    const r = new Request(url);
    r.timeoutInterval = 12;
    const i = await r.loadImage();
    fm.writeImage(p,i);
    return i;
  } catch { return null; }
}

function allFixtures(team){
  const a = team?.fixtures?.allFixtures;
  return Array.isArray(a?.fixtures) ? a.fixtures : [];
}

function fixtureTime(m){
  return m?.status?.utcTime || m?.utcTime || m?.timeTS || null;
}

function finished(m){ return m?.status?.finished === true; }
function cancelled(m){ return m?.status?.cancelled === true; }

function fixtureBelongsToClub(m){
  return Number(m?.home?.id)===CP.teamId || Number(m?.away?.id)===CP.teamId;
}

function fixtureStarted(m){
  const s=m?.status||{};
  if(s.started===true || s.ongoing===true || s.live===true) return true;
  const text=String(s.reason||s.status||s.short||'').toLowerCase();
  return text.includes('live') || text.includes('progress');
}

function validLastFixture(m){
  if(!m || !fixtureBelongsToClub(m) || !finished(m) || cancelled(m)) return false;
  const t=new Date(fixtureTime(m)||0).getTime();
  return Number.isFinite(t) && t>0 && t<=Date.now()+10*60*1000;
}

function validNextFixture(m){
  if(!m || !fixtureBelongsToClub(m) || finished(m) || cancelled(m) || fixtureStarted(m)) return false;
  const t=new Date(fixtureTime(m)||0).getTime();
  return Number.isFinite(t) && t>0 && t>Date.now()-5*60*1000;
}

function cacheTtlFor(cache){
  if(!cache?.fetchedAt) return 0;
  if(cache?.stale) return CP.cacheStaleRetryMs;

  const now=Date.now();
  const candidates=[
    cache?.fixture?.date,
    cache?.next?.date
  ]
    .map(x=>new Date(x||0).getTime())
    .filter(x=>Number.isFinite(x)&&x>0)
    .map(x=>Math.abs(x-now));

  if(!candidates.length) return CP.cacheTtlMs;

  const nearest=Math.min(...candidates);

  if(nearest<=6*60*60*1000) return CP.cacheNearMatchMs;
  if(nearest<=24*60*60*1000) return CP.cacheMatchDayMs;
  return CP.cacheTtlMs;
}

function pickLast(team){
  const preferred=team?.fixtures?.allFixtures?.lastMatch;
  if(validLastFixture(preferred)) return preferred;

  return allFixtures(team)
    .filter(validLastFixture)
    .sort((a,b)=>new Date(fixtureTime(b)||0)-new Date(fixtureTime(a)||0))[0] || null;
}

function pickNext(team){
  const preferred=team?.fixtures?.allFixtures?.nextMatch;
  if(validNextFixture(preferred)) return preferred;

  return allFixtures(team)
    .filter(validNextFixture)
    .sort((a,b)=>new Date(fixtureTime(a)||0)-new Date(fixtureTime(b)||0))[0] || null;
}

function teamSide(m){
  const h = Number(m?.home?.id) === CP.teamId;
  const a = Number(m?.away?.id) === CP.teamId;
  if(h) return {home:true, ours:m.home, opp:m.away};
  if(a) return {home:false, ours:m.away, opp:m.home};
  return {home:null, ours:null, opp:null};
}

function scoreFromFixture(m){
  const s = teamSide(m);
  const homeScore = Number(m?.home?.score);
  const awayScore = Number(m?.away?.score);
  if(s.home === true) return {ours:homeScore, theirs:awayScore};
  if(s.home === false) return {ours:awayScore, theirs:homeScore};
  const str = String(m?.status?.scoreStr || '');
  const nums = str.match(/\d+/g)?.map(Number) || [];
  return {ours:nums[0] ?? null, theirs:nums[1] ?? null};
}

function resultOf(sc){
  if(!Number.isFinite(sc.ours) || !Number.isFinite(sc.theirs)) return 'DRAW';
  return sc.ours > sc.theirs ? 'WIN' : sc.ours < sc.theirs ? 'LOSS' : 'DRAW';
}

function compName(m){
  const n=String(m?.league?.name || m?.tournament?.name || '');
  const l=n.toLowerCase();

  if(l.includes('laliga') || l.includes('la liga') || n==='ラ・リーガ') return 'ラ・リーガ';
  if(l.includes('premier league')) return 'プレミアリーグ';
  if(l.includes('bundesliga')) return 'ブンデスリーガ';
  if(l.includes('ligue 1') || l.includes('ligue1')) return 'リーグ・アン';
  if(l.includes('champions')) return 'CL';
  if(l.includes('copa del rey')) return '国王杯';
  if(l.includes('coupe de france')) return 'クープ・ドゥ・フランス';
  if(l.includes('fa cup')) return 'FAカップ';
  if(
    l.includes('efl cup') ||
    l.includes('league cup') ||
    l.includes('carabao')
  ) return 'EFLカップ';
  if(
    l.includes('dfb-pokal') ||
    l.includes('dfb pokal') ||
    (l.includes('pokal') && !l.includes('super'))
  ) return 'DFBポカール';
  if(l.includes('super')) return 'SUPER';

  return n || '公式戦';
}

function jpTeamName(name){
  const n=String(name||'').trim();
  const map={
    'Elche':'エルチェ',
    'Elche CF':'エルチェ',
    'Atletico Madrid':'アトレティコ・マドリード',
    'Atlético Madrid':'アトレティコ・マドリード',
    'Club Atlético de Madrid':'アトレティコ・マドリード',
    'Barcelona':'バルセロナ',
    'FC Barcelona':'バルセロナ',
    'Real Sociedad':'レアル・ソシエダ',
    'Real Sociedad de Fútbol':'レアル・ソシエダ',
    'Athletic Club':'アスレティック・クラブ',
    'Villarreal':'ビジャレアル',
    'Villarreal CF':'ビジャレアル',
    'Sevilla':'セビージャ',
    'Sevilla FC':'セビージャ',
    'Valencia':'バレンシア',
    'Valencia CF':'バレンシア',
    'Real Betis':'ベティス',
    'Real Betis Balompié':'ベティス',
    'Rayo Vallecano':'ラージョ・バジェカーノ',
    'Getafe':'ヘタフェ',
    'Girona':'ジローナ',
    'Mallorca':'マジョルカ',
    'Osasuna':'オサスナ',
    'Real Madrid':'レアル・マドリード',
    'Real Madrid CF':'レアル・マドリード',
    'Bayern Munich':'バイエルン',
    'Bayern München':'バイエルン',
    'Manchester United':'マンチェスター・ユナイテッド',
    'Manchester United FC':'マンチェスター・ユナイテッド',
    'Manchester City':'マンチェスター・シティ',
    'Manchester City FC':'マンチェスター・シティ',
    'Paris Saint-Germain':'パリ・サンジェルマン',
    'Paris Saint Germain':'パリ・サンジェルマン',
    'PSG':'パリ・サンジェルマン',
    'Marseille':'マルセイユ',
    'Olympique Marseille':'マルセイユ',
    'Olympique de Marseille':'マルセイユ',
    'Monaco':'モナコ',
    'AS Monaco':'モナコ',
    'Lyon':'リヨン',
    'Olympique Lyonnais':'リヨン',
    'Lille':'リール',
    'Lens':'ランス',
    'Rennes':'レンヌ',
    'Nice':'ニース',
    'Nantes':'ナント',
    'Strasbourg':'ストラスブール',
    'Paris FC':'パリFC',
    'Brest':'ブレスト',
    'Arsenal':'アーセナル',
    'Liverpool':'リヴァプール',
    'Chelsea':'チェルシー',
    'Tottenham':'トッテナム',
    'Tottenham Hotspur':'トッテナム',
    'Newcastle United':'ニューカッスル',
    'Aston Villa':'アストン・ヴィラ',
    'Everton':'エヴァートン',
    'Brighton':'ブライトン',
    'Brighton & Hove Albion':'ブライトン',
    'West Ham':'ウェストハム',
    'West Ham United':'ウェストハム',
    'Crystal Palace':'クリスタル・パレス',
    'Sunderland':'サンダーランド',
    'Sunderland AFC':'サンダーランド',
    'Fulham':'フラム',
    'Fulham FC':'フラム',
    'Union Berlin':'ウニオン・ベルリン',
    '1. FC Union Berlin':'ウニオン・ベルリン',
    'Le Mans':'ル・マン',
    'Le Mans FC':'ル・マン',
    'Augsburg':'アウクスブルク',
    'Borussia Dortmund':'ドルトムント',
    'RB Leipzig':'ライプツィヒ',
    'Bayer Leverkusen':'レヴァークーゼン',
    'Eintracht Frankfurt':'フランクフルト',
    'VfB Stuttgart':'シュトゥットガルト',
    'Wolfsburg':'ヴォルフスブルク',
    'SC Freiburg':'フライブルク',
    'TSG Hoffenheim':'ホッフェンハイム',
    'Mainz 05':'マインツ',
    'FC Augsburg':'アウクスブルク'
  };
  return map[n]||n||'—';
}

function normalizeDisplayData(data){
  if(!data||typeof data!=='object') return data;
  const out={...data};
  if(out.fixture){
    out.fixture={...out.fixture};
    out.fixture.opponent=jpTeamName(out.fixture.opponent);
    out.fixture.competition=compName({league:{name:out.fixture.competition}});
  }
  if(out.next){
    out.next={...out.next};
    out.next.opponent=jpTeamName(out.next.opponent);
    out.next.competition=compName({league:{name:out.next.competition}});
  }
  return out;
}

function fmtDate(value, withTime=false){
  try{
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return '—';
    const f = new DateFormatter();
    f.locale='ja_JP';
    f.dateFormat=withTime?'M/d(E) HH:mm':'M/d(E)';
    return f.string(d);
  }catch{return '—';}
}

function playerName(o){
  const n = o?.name;
  if(typeof n === 'string') return n;
  if(n?.fullName) return n.fullName;
  if(n?.firstName || n?.lastName) return [n.firstName,n.lastName].filter(Boolean).join(' ');
  return o?.playerName || o?.player?.name || o?.player?.name?.fullName || null;
}

function playerId(o){
  return o?.id ?? o?.playerId ?? o?.player?.id ?? o?.participantId ?? null;
}

function parseRating(v){
  if(v == null) return null;
  if(typeof v === 'object') v = v.num ?? v.value ?? v.rating ?? null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n >= 0 && n <= 10 ? n : null;
}

function ratingOf(o){
  const candidates = [
    o?.rating,
    o?.stats?.rating,
    o?.statistics?.rating,
    o?.performance?.rating,
    o?.fotMobRating,
    o?.playerRating
  ];
  for(const v of candidates){
    const n=parseRating(v);
    if(n!==null) return n;
  }
  return null;
}

function findTeamLineup(detail){
  const l=detail?.content?.lineup;
  const lines=Array.isArray(l?.lineups)?l.lineups:[];
  const block=lines.find(x=>Number(x?.teamId)===CP.teamId);
  if(block) return block;

  const hId=detail?.general?.homeTeam?.id ?? detail?.header?.teams?.[0]?.id;
  const aId=detail?.general?.awayTeam?.id ?? detail?.header?.teams?.[1]?.id;

  if(Number(hId)===CP.teamId) return l?.homeTeam || l?.home || lines[0] || null;
  if(Number(aId)===CP.teamId) return l?.awayTeam || l?.away || lines[1] || null;

  return null;
}

function collectRatedPlayers(detail){
  const block = findTeamLineup(detail);
  const found = new Map();

  function walk(x){
    if(!x || typeof x !== 'object') return;
    if(Array.isArray(x)){ x.forEach(walk); return; }

    const id = playerId(x);
    const name = playerName(x);
    const rating = ratingOf(x);
    if(id != null && name && rating !== null){
      const old = found.get(String(id));
      if(!old || rating > old.rating){
        found.set(String(id), {id:Number(id), name, rating});
      }
    }
    for(const v of Object.values(x)) walk(v);
  }
  walk(block);

  // Some FotMob payloads keep the numeric rating in content.playerStats
  // while the player identity lives in lineup. Merge by player id.
  const ps = detail?.content?.playerStats;
  if(ps && typeof ps === 'object'){
    const names = new Map();
    function mapNames(x){
      if(!x || typeof x !== 'object') return;
      if(Array.isArray(x)){x.forEach(mapNames);return;}
      const id=playerId(x), name=playerName(x);
      if(id!=null && name) names.set(String(id),name);
      for(const v of Object.values(x)) mapNames(v);
    }
    mapNames(block);

    for(const [k,v] of Object.entries(ps)){
      const id = playerId(v) ?? (/^\d+$/.test(k)?Number(k):null);
      if(id==null || !names.has(String(id))) continue;
      const rating = ratingOf(v);
      if(rating===null) continue;
      const old=found.get(String(id));
      if(!old || rating>old.rating) found.set(String(id),{id:Number(id),name:names.get(String(id)),rating});
    }
  }

  return [...found.values()].sort((a,b)=>b.rating-a.rating).slice(0,3);
}

function eventArray(detail){
  if(Array.isArray(detail?.header?.events)) return detail.header.events;
  const e = detail?.content?.matchFacts?.events;
  if(Array.isArray(e)) return e;
  if(Array.isArray(e?.events)) return e.events;
  return [];
}

function isOurEvent(e,isHome){
  if(typeof e?.isHome === 'boolean') return e.isHome === isHome;
  const tid=e?.teamId ?? e?.team?.id;
  return tid!=null ? Number(tid)===CP.teamId : false;
}

function validGoalEvent(e){
  if(!e || typeof e!=='object') return false;
  if(e.cancelled===true || e.isCancelled===true || e.disallowed===true || e.isDisallowed===true) return false;

  const type=String(e.type||'')
    .toLowerCase()
    .replace(/[\s_-]/g,'');

  if(
    type.includes('cancel') ||
    type.includes('disallow') ||
    type.includes('miss')
  ) return false;

  if(e.isGoal===true) return true;

  return (
    type==='goal' ||
    type==='penaltygoal' ||
    type==='goalpenalty' ||
    type==='owngoal' ||
    type.endsWith('goal')
  );
}

function goalData(detail,isHome){
  const out=[];
  for(const e of eventArray(detail)){
    if(!validGoalEvent(e)) continue;
    if(!isOurEvent(e,isHome)) continue;
    const scorer = playerName(e?.player || e) || e?.playerName || '—';
    const assist =
      playerName(e?.assist) ||
      playerName(e?.assistPlayer) ||
      e?.assistStr ||
      e?.assistName ||
      null;
    const minute = e?.time ?? e?.minute ?? e?.timeStr ?? null;
    out.push({scorer,assist,minute});
  }
  return out;
}

function scoreFromDetail(detail,fixture){
  const teams = detail?.header?.teams;
  if(Array.isArray(teams) && teams.length>=2){
    const homeId = detail?.general?.homeTeam?.id ?? teams[0]?.id;
    const idx = Number(homeId)===CP.teamId ? 0 : 1;
    const ours=Number(teams[idx]?.score), theirs=Number(teams[1-idx]?.score);
    if(Number.isFinite(ours)&&Number.isFinite(theirs)) return {ours,theirs};
  }
  return scoreFromFixture(fixture);
}

function opponentFromDetail(detail,fixture){
  const home = detail?.general?.homeTeam;
  const away = detail?.general?.awayTeam;
  if(Number(home?.id)===CP.teamId) return {id:away?.id,name:away?.name};
  if(Number(away?.id)===CP.teamId) return {id:home?.id,name:home?.name};
  const side=teamSide(fixture);
  return {id:side.opp?.id,name:side.opp?.name};
}

async function fetchData(force=false){
  const cache=readJSON(dataPath);
  const ttl=cacheTtlFor(cache);
  if(!force && cache?.fetchedAt && Date.now()-cache.fetchedAt<ttl) return cache;

  try{
    const team=await getJSON('/teams?id='+CP.teamId+'&ccode3=JPN');
    const last=pickLast(team);
    const next=pickNext(team);
    if(!last?.id) throw new Error('FotMob: last match not found');

    const detail=await getJSON('/matchDetails?matchId='+last.id);
    const isHome = Number(detail?.general?.homeTeam?.id ?? last?.home?.id) === CP.teamId;
    const score=scoreFromDetail(detail,last);
    const opp=opponentFromDetail(detail,last);
    const top3=collectRatedPlayers(detail);
    const goals=goalData(detail,isHome);

    if(!top3.length){
      throw new Error('FotMob: player ratings not found in match detail');
    }

    const nextSide=next?teamSide(next):null;
    const data={
      fetchedAt:Date.now(),
      source:'FotMob prototype',
      team:{id:CP.teamId,name:CP.clubName,logo:imgTeam(CP.teamId)},
      fixture:{
        id:last.id,
        date:fixtureTime(last) || detail?.general?.matchTimeUTCDate,
        competition:compName(last),
        opponent:jpTeamName(opp?.name),
        opponentId:opp?.id || null,
        opponentLogo:opp?.id?imgTeam(opp.id):null,
        ours:score.ours,
        theirs:score.theirs,
        result:resultOf(score),
        home:isHome
      },
      top3:top3.map(p=>({...p,photo:imgPlayer(p.id)})),
      hero:{...top3[0],photo:imgPlayer(top3[0].id)},
      goals,
      form:recentForm(team),
      next:next?{
        id:next.id,
        date:fixtureTime(next),
        competition:compName(next),
        opponent:jpTeamName(nextSide?.opp?.name),
        opponentId:nextSide?.opp?.id || null,
        opponentLogo:nextSide?.opp?.id?imgTeam(nextSide.opp.id):null
      }:null
    };
    writeJSON(dataPath,data);
    return data;
  }catch(e){
    if(cache) return {...cache,stale:true,lastError:String(e)};
    throw e;
  }
}

function compact(s,max=18){
  s=String(s||'—');
  return s.length>max?s.slice(0,max-1)+'…':s;
}

function clubTitleSize(family){
  const len=String(CP.clubName||'').length;

  if(family==='large'){
    if(len>=16) return 13.2;
    if(len>=12) return 14.2;
    return 15.5;
  }

  if(family==='medium'){
    if(len>=16) return 9.2;
    if(len>=12) return 10.0;
    return 10.9;
  }

  return 10.4;
}

function displayPlayerName(name){
  const n=String(name||'—').trim();
  const parts=n.split(/\s+/);
  if(parts.length<=1)return n;
  return parts[parts.length-1];
}

function txt(parent,value,size,weight='medium',color='#FFFFFF',alpha=1){
  const t=parent.addText(String(value));
  t.font=weight==='heavy'?Font.heavySystemFont(size):
    weight==='bold'?Font.boldSystemFont(size):
    weight==='semibold'?Font.semiboldSystemFont(size):Font.mediumSystemFont(size);
  t.textColor=C(color,alpha);
  t.lineLimit=1;
  t.minimumScaleFactor=.62;
  return t;
}

function txtLarge(parent,value,size,weight='semibold',color='#FFFFFF',alpha=1){
  const t=txt(parent,value,size,weight,color,alpha);
  t.minimumScaleFactor=.84;
  return t;
}

function staleBadge(parent,data,size=7){
  if(!data?.stale) return;
  const p=parent.addStack();
  p.setPadding(2,5,2,5);
  p.cornerRadius=6;
  p.backgroundColor=C('#6B4516',.92);
  txt(p,'更新待ち',size,'heavy','#FFD38A',1);
}

function resultChip(parent,result){
  const p=parent.addStack();
  p.setPadding(3,7,3,7);
  p.cornerRadius=7;
  const m={
    WIN:['#E8BC52','#090B10','勝利'],
    DRAW:['#69707E','#FFFFFF','引分'],
    LOSS:['#8E2935','#FFFFFF','敗戦']
  }[result]||['#454B57','#FFFFFF','結果'];
  p.backgroundColor=C(m[0],.96);
  txt(p,m[2],10,'heavy',m[1]);
}

function makeBackground(hero){
  const W=360,H=169;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=false;
  ctx.setFillColor(C('#06080D'));
  ctx.fillRect(new Rect(0,0,W,H));

  if(hero){
    const iw=hero.size.width||1, ih=hero.size.height||1;
    const targetW=150, targetH=160;
    const scale=Math.min(targetW/iw,targetH/ih);
    const dw=iw*scale, dh=ih*scale;
    const x=W-dw-9;
    const y=(H-dh)/2+3;
    ctx.drawImageInRect(hero,new Rect(x,y,dw,dh));
  }

  ctx.setFillColor(C('#02050A',.16));
  ctx.fillRect(new Rect(0,0,W,H));
  return ctx.getImage();
}

function goalLines(data){
  const counts={};
  for(const g of data.goals||[]) counts[g.scorer]=(counts[g.scorer]||0)+1;
  return Object.entries(counts).slice(0,3).map(([n,c])=>n+(c>1?' ×'+c:''));
}
function cleanAssistName(name){
  return String(name||'')
    .replace(/^assist(?:ed)?\s+by\s+/i,'')
    .replace(/^by\s+/i,'')
    .trim();
}

function assistLines(data){
  const a=[];
  for(const g of data.goals||[]){
    const n=cleanAssistName(g.assist);
    if(n&&!a.includes(n))a.push(n);
  }
  return a.slice(0,3);
}

function recentForm(team){
  return allFixtures(team)
    .filter(x=>finished(x)&&!cancelled(x))
    .sort((a,b)=>new Date(fixtureTime(b)||0)-new Date(fixtureTime(a)||0))
    .slice(0,5)
    .map(m=>{
      const s=scoreFromFixture(m);
      if(!Number.isFinite(s.ours)||!Number.isFinite(s.theirs))return 'D';
      return s.ours>s.theirs?'W':s.ours<s.theirs?'L':'D';
    });
}

function makeSmallHeroPanel(hero){
  const W=72,H=84;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=false;

  ctx.setFillColor(C('#0D1320'));
  ctx.fillRect(new Rect(0,0,W,H));

  if(hero){
    const iw=hero.size.width||1, ih=hero.size.height||1;
    const scale=Math.max(W/iw,H/ih);
    const dw=iw*scale,dh=ih*scale;
    const x=(W-dw)/2;
    const y=(H-dh)/2+2;
    ctx.drawImageInRect(hero,new Rect(x,y,dw,dh));
  }

  return ctx.getImage();
}

function txtSmall(parent,value,size,weight='semibold',color='#FFFFFF',alpha=1){
  const t=txt(parent,value,size,weight,color,alpha);
  t.minimumScaleFactor=.82;
  return t;
}

function resultChipSmall(parent,result){
  const p=parent.addStack();
  p.setPadding(2,5,2,5);
  p.cornerRadius=6;
  const m={
    WIN:['#E8BC52','#090B10','勝'],
    DRAW:['#69707E','#FFFFFF','分'],
    LOSS:['#8E2935','#FFFFFF','敗']
  }[result]||['#454B57','#FFFFFF','—'];
  p.backgroundColor=C(m[0],.96);
  txtSmall(p,m[2],7.6,'heavy',m[1],1);
}

function buildSmall(data,images){
  const w=new ListWidget();
  w.setPadding(8,8,8,8);
  w.backgroundColor=C(UI.bg);

  const root=w.addStack();
  root.layoutVertically();
  root.setPadding(0,0,0,0);

  // Header
  const h=root.addStack();
  h.layoutHorizontally();
  h.centerAlignContent();

  if(images.crest){
    const im=h.addImage(images.crest);
    im.imageSize=new Size(19,19);
  }

  spacer(h,5);
  txtSmall(h,CP.smallName,10.4,'heavy',UI.accent,1);
  h.addSpacer();
  staleBadge(h,data,5.8);
  if(data?.stale) spacer(h,3);
  resultChipSmall(h,data.fixture.result);

  spacer(root,6);

  // Main body: explicit readable card
  const body=root.addStack();
  body.layoutHorizontally();
  body.topAlignContent();
  body.setPadding(7,7,7,7);
  body.cornerRadius=12;
  body.backgroundColor=C(UI.panel,.98);
  body.borderWidth=1;
  body.borderColor=C(UI.border,.82);

  const left=body.addStack();
  left.layoutVertically();

  txtSmall(
    left,
    String(data.fixture.ours)+' - '+String(data.fixture.theirs),
    22,
    'heavy',
    '#FFFFFF',
    1
  );

  spacer(left,2);

  txtSmall(
    left,
    compact(data.fixture.opponent,10),
    8.8,
    'bold',
    '#FFFFFF',
    1
  );

  txtSmall(
    left,
    (data.fixture.home?'ホーム':'アウェイ')+' · '+fmtDate(data.fixture.date),
    7.1,
    'semibold',
    '#DCE6F8',
    .98
  );

  left.addSpacer(4);

  txtSmall(left,'最高評価',6.2,'heavy',UI.accent,1);
  spacer(left,1);

  const mvp=left.addStack();
  mvp.layoutHorizontally();
  txtSmall(
    mvp,
    compact(displayPlayerName(data.hero?.name),9),
    9.0,
    'bold',
    '#FFFFFF',
    1
  );
  spacer(mvp,4);
  txtSmall(
    mvp,
    data.hero?.rating?.toFixed(1)??'—',
    9.0,
    'heavy',
    UI.accent,
    1
  );

  body.addSpacer(6);

  const right=body.addStack();
  right.layoutVertically();
  right.centerAlignContent();

  if(images.hero){
    const heroFrame=right.addStack();
    heroFrame.setPadding(2,2,2,2);
    heroFrame.cornerRadius=12;
    heroFrame.backgroundColor=C(UI.hero,.98);
    heroFrame.borderWidth=1;
    heroFrame.borderColor=C(UI.accent2,.78);

    const hero=heroFrame.addImage(makeSmallHeroPanel(images.hero));
    hero.imageSize=new Size(68,80);
    hero.cornerRadius=9;
  }else{
    const ph=right.addStack();
    ph.size=new Size(72,84);
    ph.cornerRadius=11;
    ph.backgroundColor=C('#111725');
    ph.centerAlignContent();
    txtSmall(ph,'HERO',8,'heavy','#FFFFFF',.65);
  }

  w.refreshAfterDate=new Date(Date.now()+CP.refreshMs);
  return w;
}

function makeMediumHeroPanel(hero){
  const W=88,H=96;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=false;

  ctx.setFillColor(C('#0D1320'));
  ctx.fillRect(new Rect(0,0,W,H));

  if(hero){
    const iw=hero.size.width||1, ih=hero.size.height||1;
    const scale=Math.max(W/iw,H/ih);
    const dw=iw*scale,dh=ih*scale;
    const x=(W-dw)/2;
    const y=(H-dh)/2+2;
    ctx.drawImageInRect(hero,new Rect(x,y,dw,dh));
  }

  return ctx.getImage();
}

function txtMedium(parent,value,size,weight='semibold',color='#FFFFFF',alpha=1){
  const t=txt(parent,value,size,weight,color,alpha);
  t.minimumScaleFactor=.86;
  return t;
}

function buildMedium(data,images){
  const w=new ListWidget();
  w.setPadding(5,7,5,7);
  w.backgroundColor=C(UI.bg);

  const root=w.addStack();
  root.layoutVertically();
  root.setPadding(0,0,0,0);

  // TOP: club / opponent / result / score
  const top=root.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();
  top.setPadding(1,4,1,4);

  if(images.crest){
    const crest=top.addImage(images.crest);
    crest.imageSize=new Size(20,20);
  }

  spacer(top,5);

  const title=top.addStack();
  title.layoutVertically();
  txtMedium(title,CP.clubName,clubTitleSize('medium'),'heavy',UI.text,1);
  txtMedium(
    title,
    compact(data.fixture.opponent,12)+' · '+fmtDate(data.fixture.date),
    7.5,
    'semibold',
    UI.sub,
    1
  );

  top.addSpacer();

  staleBadge(top,data,6.0);
  if(data?.stale) spacer(top,4);
  resultChip(top,data.fixture.result);
  spacer(top,6);

  txtMedium(
    top,
    String(data.fixture.ours)+' - '+String(data.fixture.theirs),
    24,
    'heavy',
    UI.text,
    1
  );

  spacer(root,4);

  // BODY: one full-width card. No dead space outside left/right content.
  const body=root.addStack();
  body.layoutHorizontally();
  body.topAlignContent();
  body.setPadding(6,8,6,8);
  body.cornerRadius=12;
  body.backgroundColor=C(UI.panel,.99);
  body.borderWidth=1;
  body.borderColor=C(UI.border,.88);
  body.size=new Size(0,96);

  // LEFT info area
  const info=body.addStack();
  info.layoutVertically();
  info.size=new Size(218,84);

  txtMedium(info,'★ 評価TOP3',8.8,'bold',UI.accent,1);
  spacer(info,2);

  data.top3.forEach((p,i)=>{
    const r=info.addStack();
    r.layoutHorizontally();
    r.centerAlignContent();

    txtMedium(r,String(i+1),8.2,'heavy',i===0?UI.accent:UI.text,1);
    spacer(r,5);

    txtMedium(
      r,
      compact(displayPlayerName(p.name),13),
      9.7,
      i===0?'bold':'semibold',
      UI.text,
      1
    );

    r.addSpacer();

    txtMedium(
      r,
      p.rating.toFixed(1),
      9.5,
      'heavy',
      i===0?UI.accent:UI.text,
      1
    );
  });

  info.addSpacer();

  const gl=goalLines(data).map(x=>displayPlayerName(x));
  const al=assistLines(data).map(x=>displayPlayerName(x));

  const mediumGoalText=gl.length
    ? gl.map(x=>compact(x,13)).join(' / ')
    : '—';
  const mediumAssistText=al.length
    ? al.map(x=>compact(x,13)).join(' / ')
    : '—';

  txtMedium(
    info,
    '⚽ 得点  '+compact(mediumGoalText,27),
    8.8,
    'semibold',
    UI.text,
    1
  );
  spacer(info,2);

  txtMedium(
    info,
    '🎯 アシスト  '+compact(mediumAssistText,24),
    8.8,
    'semibold',
    UI.text,
    1
  );

  body.addSpacer(8);

  // RIGHT Hero area fills the remaining card width.
  const hero=body.addStack();
  hero.layoutVertically();
  hero.topAlignContent();
  hero.size=new Size(92,84);

  if(images.hero){
    const heroFrame=hero.addStack();
    heroFrame.setPadding(2,2,2,2);
    heroFrame.cornerRadius=11;
    heroFrame.backgroundColor=C(UI.hero,.98);
    heroFrame.borderWidth=1;
    heroFrame.borderColor=C(UI.accent2,.78);

    const hi=heroFrame.addImage(makeMediumHeroPanel(images.hero));
    hi.imageSize=new Size(80,61);
    hi.cornerRadius=9;
  }else{
    const ph=hero.addStack();
    ph.size=new Size(86,68);
    ph.cornerRadius=10;
    ph.backgroundColor=C(UI.hero);
    ph.centerAlignContent();
    txtMedium(ph,'HERO',8,'heavy',UI.text,.70);
  }

  spacer(hero,2);

  const mvp=hero.addStack();
  mvp.layoutHorizontally();
  mvp.centerAlignContent();
  mvp.setPadding(3,5,3,5);
  mvp.cornerRadius=8;
  mvp.backgroundColor=C(UI.panelDark,.99);
  mvp.borderWidth=1;
  mvp.borderColor=C(UI.borderSoft,.70);

  txtMedium(mvp,'最高評価',5.6,'heavy',UI.accent,1);
  spacer(mvp,3);
  txtMedium(mvp,compact(displayPlayerName(data.hero?.name),8),7.8,'bold',UI.text,1);
  spacer(mvp,3);
  txtMedium(mvp,data.hero?.rating?.toFixed(1)??'—',7.8,'heavy',UI.accent,1);

  root.addSpacer();

  // FOOTER: independent next-match strip
  const footer=root.addStack();
  footer.layoutHorizontally();
  footer.centerAlignContent();
  footer.setPadding(3,6,3,6);
  footer.cornerRadius=9;
  footer.backgroundColor=C(UI.panelDark,.99);
  footer.borderWidth=1;
  footer.borderColor=C(UI.borderSoft,.74);

  txtMedium(footer,'次戦',7.4,'heavy',UI.accent,1);
  spacer(footer,5);

  if(data.next){
    txtMedium(
      footer,
      'vs '+compact(data.next.opponent,14),
      8.8,
      'bold',
      UI.text,
      1
    );

    footer.addSpacer();

    txtMedium(
      footer,
      fmtDate(data.next.date,true),
      7.3,
      'semibold',
      UI.text,
      .96
    );
  }else{
    txtMedium(footer,'次戦データなし',7.6,'semibold',UI.text,.88);
    footer.addSpacer();
  }

  w.refreshAfterDate=new Date(Date.now()+CP.refreshMs);
  return w;
}


function makeLargeBackground(){
  const W=360,H=360;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=false;

  ctx.setFillColor(C(UI.bg));
  ctx.fillRect(new Rect(0,0,W,H));

  return ctx.getImage();
}

function makeHeroPanel(hero){
  const W=132,H=132;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=false;

  ctx.setFillColor(C('#0D1320'));
  ctx.fillRect(new Rect(0,0,W,H));

  if(hero){
    const iw=hero.size.width||1, ih=hero.size.height||1;
    const scale=Math.max(W/iw,H/ih);
    const dw=iw*scale,dh=ih*scale;
    const x=(W-dw)/2;
    const y=(H-dh)/2+4;
    ctx.drawImageInRect(hero,new Rect(x,y,dw,dh));
  }

  // subtle bottom shade without unsupported DrawContext gradients
  ctx.setFillColor(C('#02050A',.18));
  ctx.fillRect(new Rect(0,H-24,W,24));

  return ctx.getImage();
}

function formChip(parent,value){
  const p=parent.addStack();
  p.setPadding(3,7,3,7);
  p.cornerRadius=7;
  const normalized=String(value||'').toUpperCase();
  const m={
    W:['#173A26','#63E283','勝'],
    D:['#343842','#D7DAE1','分'],
    L:['#451B21','#FF7B83','敗']
  }[normalized]||['#272B33','#9EA4AF','—'];
  p.backgroundColor=C(m[0],.94);
  txt(p,m[2],9.5,'heavy',m[1]);
}

function contributionBlock(parent,title,lines){
  const box=parent.addStack();
  box.layoutVertically();
  txt(box,title,10.2,'bold','#FFFFFF',1);
  spacer(box,3);
  (lines.length?lines:['—']).forEach(x=>{
    txt(box,compact(x,20),11.1,'semibold','#FFFFFF',lines.length?1:.62);
    spacer(box,1);
  });
  return box;
}

function buildLarge(data,images){
  const w=new ListWidget();
  w.setPadding(10,12,10,12);
  w.backgroundImage=makeLargeBackground();

  const root=w.addStack();
  root.layoutVertically();
  root.setPadding(0,0,0,0);
  root.size=new Size(0,335);
  root.topAlignContent();

  // HEADER
  const h=root.addStack();
  h.layoutHorizontally();
  h.centerAlignContent();

  if(images.crest){
    const im=h.addImage(images.crest);
    im.imageSize=new Size(28,28);
  }

  spacer(h,8);
  txtLarge(h,CP.clubName,clubTitleSize('large'),'heavy','#FFFFFF',1);
  spacer(h,8);
  txtLarge(h,data.fixture.competition,10.2,'bold','#FFFFFF',.96);
  h.addSpacer();
  staleBadge(h,data,7.0);
  if(data?.stale) spacer(h,5);
  resultChip(h,data.fixture.result);

  spacer(root,7);

  // SCORE
  const score=root.addStack();
  score.layoutHorizontally();
  score.centerAlignContent();

  const sl=score.addStack();
  sl.layoutVertically();
  txtLarge(sl,compact(data.fixture.opponent,20),13.8,'bold','#FFFFFF',1);
  spacer(sl,1);
  txtLarge(
    sl,
    (data.fixture.home?'ホーム':'アウェイ')+' · '+fmtDate(data.fixture.date),
    10.8,
    'semibold',
    '#FFFFFF',
    .96
  );

  score.addSpacer();
  txtLarge(score,String(data.fixture.ours)+' - '+String(data.fixture.theirs),35,'heavy','#FFFFFF',1);

  spacer(root,9);

  // MAIN: one full-width card with information + Hero.
  const main=root.addStack();
  main.layoutHorizontally();
  main.topAlignContent();
  main.setPadding(8,9,8,9);
  main.cornerRadius=13;
  main.backgroundColor=C(UI.panel,.99);
  main.borderWidth=1;
  main.borderColor=C(UI.border,.88);
  main.size=new Size(0,184);

  // LEFT info area
  const left=main.addStack();
  left.layoutVertically();
  left.topAlignContent();
  left.size=new Size(190,168);

  spacer(left,2);
  txtLarge(left,'★ 評価TOP3',11.7,'bold',UI.accent,1);
  spacer(left,3);

  const denseNames=data.top3.some(p=>String(displayPlayerName(p.name)).length>16);

  data.top3.forEach((p,i)=>{
    const r=left.addStack();
    r.layoutHorizontally();
    r.centerAlignContent();

    txtLarge(r,String(i+1),denseNames?10.2:10.7,'heavy',i===0?UI.accent:UI.text,1);
    spacer(r,denseNames?6:7);

    txtLarge(
      r,
      compact(displayPlayerName(p.name),denseNames?12:14),
      denseNames?12.4:13.4,
      i===0?'bold':'semibold',
      UI.text,
      1
    );

    r.addSpacer();

    txtLarge(
      r,
      p.rating.toFixed(1),
      denseNames?12.2:12.8,
      'heavy',
      i===0?UI.accent:UI.text,
      1
    );

    spacer(left,denseNames?1:2);
  });

  const gl=goalLines(data);
  const al=assistLines(data);
  const denseContrib=
    (gl.length + al.length >= 5) ||
    gl.some(x=>String(x).length>18) ||
    al.some(x=>String(x).length>18);

  spacer(left,denseContrib?4:7);

  txtLarge(
    left,
    '⚽ 得点',
    denseContrib?10.7:11.5,
    'bold',
    UI.accent,
    1
  );
  spacer(left,denseContrib?2:3);

  (gl.length?gl:['—']).forEach(x=>{
    txtLarge(
      left,
      compact(x,denseContrib?15:18),
      denseContrib?11.3:12.6,
      'semibold',
      UI.text,
      gl.length?1:.72
    );
    spacer(left,denseContrib?0:1);
  });

  spacer(left,denseContrib?4:6);

  txtLarge(
    left,
    '🎯 アシスト',
    denseContrib?10.7:11.5,
    'bold',
    UI.accent,
    1
  );
  spacer(left,denseContrib?2:3);

  (al.length?al:['—']).forEach(x=>{
    txtLarge(
      left,
      compact(x,denseContrib?15:18),
      denseContrib?11.3:12.6,
      'semibold',
      UI.text,
      al.length?1:.72
    );
    spacer(left,denseContrib?0:1);
  });

  main.addSpacer(10);

  // RIGHT Hero area uses the rest of the same card.
  const right=main.addStack();
  right.layoutVertically();
  right.size=new Size(136,168);
  right.centerAlignContent();

  if(images.hero){
    const heroFrame=right.addStack();
    heroFrame.setPadding(2,2,2,2);
    heroFrame.cornerRadius=14;
    heroFrame.backgroundColor=C(UI.hero,.99);
    heroFrame.borderWidth=1;
    heroFrame.borderColor=C(UI.accent2,.78);

    const hi=heroFrame.addImage(makeHeroPanel(images.hero));
    hi.imageSize=new Size(132,132);
    hi.cornerRadius=11;
  }else{
    const placeholder=right.addStack();
    placeholder.size=new Size(134,134);
    placeholder.cornerRadius=14;
    placeholder.backgroundColor=C(UI.hero);
    placeholder.centerAlignContent();
    txtLarge(placeholder,'HERO',11,'heavy',UI.text,.75);
  }

  right.addSpacer();

  const heroCard=right.addStack();
  heroCard.layoutHorizontally();
  heroCard.centerAlignContent();
  heroCard.setPadding(7,8,7,8);
  heroCard.cornerRadius=11;
  heroCard.backgroundColor=C(UI.panelDark,.99);
  heroCard.borderWidth=1;
  heroCard.borderColor=C(UI.borderSoft,.70);

  txtLarge(heroCard,'最高評価',7.2,'heavy',UI.accent,1);
  spacer(heroCard,5);
  txtLarge(heroCard,compact(displayPlayerName(data.hero?.name),10),11.2,'bold',UI.text,1);
  spacer(heroCard,4);
  txtLarge(heroCard,data.hero?.rating?.toFixed(1)??'—',11.2,'heavy',UI.accent,1);

  root.addSpacer();

  // FORM
  const form=root.addStack();
  form.layoutHorizontally();
  form.centerAlignContent();

  txtLarge(form,'直近5試合',10.3,'heavy','#FFFFFF',1);
  spacer(form,8);

  const ff=(data.form||[]).slice(0,5);
  if(ff.length){
    ff.forEach((x,i)=>{
      formChip(form,x);
      if(i<ff.length-1) spacer(form,4);
    });
  }else{
    txtLarge(form,'—',10,'medium','#FFFFFF',.75);
  }

  spacer(root,5);

  // NEXT
  const footer=root.addStack();
  footer.layoutHorizontally();
  footer.centerAlignContent();
  footer.setPadding(7,9,7,9);
  footer.cornerRadius=11;
  footer.backgroundColor=C(UI.panelDark,.98);
  footer.borderWidth=1;
  footer.borderColor=C(UI.borderSoft,.70);

  txtLarge(footer,'次戦',10.4,'heavy',UI.accent,1);
  spacer(footer,8);

  if(data.next){
    txtLarge(footer,'vs '+compact(data.next.opponent,18),12.2,'bold','#FFFFFF',1);
    footer.addSpacer();
    txtLarge(
      footer,
      fmtDate(data.next.date,true)+' / '+data.next.competition,
      9.4,
      'semibold',
      '#FFFFFF',
      .98
    );
  }else{
    txtLarge(footer,'次戦データなし',10,'semibold',UI.text,.9);
    footer.addSpacer();
  }

  w.refreshAfterDate=new Date(Date.now()+CP.refreshMs);
  return w;
}

function errorWidget(message){
  const w=new ListWidget();
  w.backgroundColor=C('#070A10');
  w.setPadding(14,14,14,14);
  txt(w,'CLUB PULSE HERO',13,'heavy');
  spacer(w,8);
  const t=txt(w,message,9.2,'medium','#D0D5DF',.92);
  t.lineLimit=7;
  return w;
}

function cloneQaData(data){
  return JSON.parse(JSON.stringify(data));
}

function applyQaScenario(data,scenario){
  const d=cloneQaData(data);
  const key=String(scenario||'normal').toLowerCase();

  if(key==='loss'){
    d.fixture.ours=1;
    d.fixture.theirs=3;
    d.fixture.result='LOSS';
    d.goals=(d.goals||[]).slice(0,1);
    if(Array.isArray(d.form)&&d.form.length) d.form[0]='L';
  }

  if(key==='draw'){
    d.fixture.ours=1;
    d.fixture.theirs=1;
    d.fixture.result='DRAW';
    d.goals=(d.goals||[]).slice(0,1);
    if(Array.isArray(d.form)&&d.form.length) d.form[0]='D';
  }

  if(key==='zero'){
    d.fixture.ours=0;
    d.fixture.theirs=2;
    d.fixture.result='LOSS';
    d.goals=[];
    if(Array.isArray(d.form)&&d.form.length) d.form[0]='L';
  }

  if(key==='noassist'){
    d.goals=(d.goals||[]).map(g=>({...g,assist:null}));
  }

  if(key==='hero2' && Array.isArray(d.top3) && d.top3[1]){
    d.hero={...d.top3[1]};
  }

  if(key==='long'){
    d.fixture.opponent='アトレティコ・デ・サン・ロレンツォ';
    if(d.next) d.next.opponent='アトレティコ・デ・サン・ロレンツォ';
    if(Array.isArray(d.top3) && d.top3[0]){
      d.top3[0].name='Alexander-Arnold-Superlongname';
      d.hero={...d.top3[0]};
    }
    if(Array.isArray(d.goals) && d.goals[0]){
      d.goals[0].scorer='Alexander-Arnold-Superlongname';
      d.goals[0].assist='VeryLongAssistPlayerSurname';
    }
  }

  if(key==='nonext'){
    d.next=null;
  }

  if(key==='stale'){
    d.stale=true;
    d.lastError='QA simulated stale cache';
  }

  return d;
}

async function chooseTeamKey(){
  const fromParameter=normalizeTeamKey(args.widgetParameter);
  if(fromParameter) return fromParameter;

  if(!config.runsInApp) return 'real';

  const a=new Alert();
  a.title='Club Pulse Hero';
  a.message='確認するクラブを選択';
  a.addAction('レアル・マドリード');
  a.addAction('FCバルセロナ');
  a.addAction('マンチェスター・ユナイテッド');
  a.addAction('バイエルン・ミュンヘン');
  a.addAction('マンチェスター・シティ');
  a.addAction('パリ・サンジェルマン');

  const i=await a.presentSheet();
  return ['real','barca','manu','bayern','city','psg'][Math.max(0,i)] || 'real';
}

async function chooseQaScenario(){
  if(!config.runsInApp) return 'normal';

  const raw=String(args.widgetParameter||'').toLowerCase();
  const tokens=['loss','draw','zero','noassist','hero2','long','nonext','stale'];
  for(const t of tokens){
    if(raw.includes(t)) return t;
  }

  const a=new Alert();
  a.title='Club Pulse Hero QA';
  a.message='確認する状態を選択';
  a.addAction('通常');
  a.addAction('敗戦 1-3');
  a.addAction('引き分け 1-1');
  a.addAction('0得点');
  a.addAction('アシストなし');
  a.addAction('Hero変更');
  a.addAction('長い名前');
  a.addAction('次戦なし');
  a.addAction('更新待ち');

  const i=await a.presentSheet();
  return ['normal','loss','draw','zero','noassist','hero2','long','nonext','stale'][Math.max(0,i)] || 'normal';
}

async function choosePreviewFamily(){
  if(!config.runsInApp) return null;

  const raw=String(args.widgetParameter||'').toLowerCase();
  if(raw.includes('small')) return 'small';
  if(raw.includes('medium')) return 'medium';
  if(raw.includes('large')) return 'large';

  const a=new Alert();
  a.title='Club Pulse Hero QA';
  a.message='確認するWidgetサイズを選択';
  a.addAction('Small');
  a.addAction('Medium');
  a.addAction('Large');
  a.addAction('診断');

  const i=await a.presentSheet();
  return ['small','medium','large','diagnostic'][Math.max(0,i)] || 'medium';
}

let previewFamily=null;
let qaScenario='normal';
let widget;
try{
  const selectedTeam=await chooseTeamKey();
  setActiveTeam(selectedTeam);

  const force=config.runsInApp;
  let data=normalizeDisplayData(await fetchData(force));

  recordAudit(data,config.runsInWidget?'widget':'app');

  previewFamily=await choosePreviewFamily();

  if(previewFamily!=='diagnostic'){
    qaScenario=await chooseQaScenario();

    if(config.runsInApp){
      data=applyQaScenario(data,qaScenario);
    }
  }

  const [hero,crest]=await Promise.all([
    cachedImage(data.hero?.photo,'hero_'+(data.hero?.id||'none')),
    cachedImage(data.team?.logo,'crest_'+CP.teamId)
  ]);

  const family=config.runsInWidget
    ? (config.widgetFamily||'medium')
    : (previewFamily||'medium');

  widget=family==='diagnostic'
    ? buildDiagnostics(data)
    : family==='small'
      ? buildSmall(data,{hero,crest})
      : (family==='large'||family==='extraLarge')
        ? buildLarge(data,{hero,crest})
        : buildMedium(data,{hero,crest});
}catch(e){
  widget=errorWidget('データ取得失敗\n'+String(e));
}

Script.setWidget(widget);
if(config.runsInApp){
  if(previewFamily==='small') await widget.presentSmall();
  else if(previewFamily==='large' || previewFamily==='diagnostic') await widget.presentLarge();
  else await widget.presentMedium();
}
Script.complete();
