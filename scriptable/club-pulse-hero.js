// Club Pulse Hero Prototype v0.4
// Real Madrid post-match hero widget for Scriptable.
// Prototype data source: FotMob web JSON endpoints (no API key).
// Commercial release must use a licensed/approved production data source.

const CP = {
  teamId: 8633,
  clubName: 'レアル・マドリード',
  clubShort: 'RMA',
  base: 'https://www.fotmob.com/api/data',
  imageBase: 'https://images.fotmob.com/image_resources',
  cacheTtlMs: 60 * 60 * 1000,
  refreshMs: 5 * 60 * 1000,
};

const fm = FileManager.local();
const dir = fm.joinPath(fm.documentsDirectory(), 'ClubPulseHeroFotMob');
if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
const dataPath = fm.joinPath(dir, 'realmadrid_v2.json');

function C(hex, alpha=1){ return new Color(hex, alpha); }
function spacer(p,n){ p.addSpacer(n); }

function readJSON(path, fallback=null){
  try { return fm.fileExists(path) ? JSON.parse(fm.readString(path)) : fallback; }
  catch { return fallback; }
}
function writeJSON(path, value){
  try { fm.writeString(path, JSON.stringify(value)); } catch {}
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

function pickLast(team){
  return team?.fixtures?.allFixtures?.lastMatch ||
    allFixtures(team)
      .filter(x => finished(x) && !cancelled(x))
      .sort((a,b) => new Date(fixtureTime(b)||0) - new Date(fixtureTime(a)||0))[0] || null;
}

function pickNext(team){
  return team?.fixtures?.allFixtures?.nextMatch ||
    allFixtures(team)
      .filter(x => !finished(x) && !cancelled(x) && new Date(fixtureTime(x)||0).getTime() > Date.now()-5*60*1000)
      .sort((a,b) => new Date(fixtureTime(a)||0) - new Date(fixtureTime(b)||0))[0] || null;
}

function teamSide(m){
  const h = m?.home?.id === CP.teamId;
  const a = m?.away?.id === CP.teamId;
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
  const n = String(m?.league?.name || m?.tournament?.name || '');
  const l=n.toLowerCase();
  if(l.includes('laliga') || l.includes('la liga')) return 'LaLiga';
  if(l.includes('champions')) return 'CL';
  if(l.includes('copa del rey')) return '国王杯';
  if(l.includes('super')) return 'SUPER';
  return n || '公式戦';
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
  const l = detail?.content?.lineup;
  const lines = Array.isArray(l?.lineups) ? l.lineups : [];
  let block = lines.find(x => Number(x?.teamId) === CP.teamId);
  if(block) return block;

  const hId = detail?.general?.homeTeam?.id ?? detail?.header?.teams?.[0]?.id;
  if(Number(hId) === CP.teamId) return l?.homeTeam || l?.home || lines[0] || l;
  return l?.awayTeam || l?.away || lines[1] || l;
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
  const tid = e?.teamId ?? e?.team?.id;
  return tid != null ? Number(tid) === CP.teamId : false;
}

function goalData(detail,isHome){
  const out=[];
  for(const e of eventArray(detail)){
    if(!/goal/i.test(String(e?.type||''))) continue;
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
  if(!force && cache?.fetchedAt && Date.now()-cache.fetchedAt<CP.cacheTtlMs) return cache;

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
        opponent:opp?.name || '—',
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
        opponent:nextSide?.opp?.name || '—',
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

function resultChip(parent,result){
  const p=parent.addStack();
  p.setPadding(3,7,3,7);
  p.cornerRadius=7;
  const m={WIN:['#E8BC52','#090B10'],DRAW:['#69707E','#FFFFFF'],LOSS:['#8E2935','#FFFFFF']}[result]||['#454B57','#FFFFFF'];
  p.backgroundColor=C(m[0],.96);
  txt(p,result,8,'heavy',m[1]);
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

function buildMedium(data,images){
  const w=new ListWidget();
  w.setPadding(0,0,0,0);
  w.backgroundImage=makeBackground(images.hero);

  const root=w.addStack();
  root.layoutVertically();
  root.setPadding(10,12,9,12);

  const overlay=new LinearGradient();
  overlay.startPoint=new Point(0,0.5);
  overlay.endPoint=new Point(1,0.5);
  overlay.colors=[
    C('#02050A',.96),
    C('#02050A',.86),
    C('#02050A',.52),
    C('#02050A',.18)
  ];
  overlay.locations=[0,.44,.72,1];
  root.backgroundGradient=overlay;

  const h=root.addStack(); h.layoutHorizontally(); h.centerAlignContent();
  if(images.crest){const im=h.addImage(images.crest);im.imageSize=new Size(22,22);}
  spacer(h,6); txt(h,CP.clubName,11,'heavy');
  spacer(h,6); txt(h,data.fixture.competition,7,'semibold','#D9DDE6',.82);
  h.addSpacer(); resultChip(h,data.fixture.result);

  spacer(root,6);
  const s=root.addStack(); s.layoutHorizontally(); s.centerAlignContent();
  const sl=s.addStack(); sl.layoutVertically();
  txt(sl,compact(data.fixture.opponent,20),8.5,'semibold','#EEF1F5',.94);
  txt(sl,(data.fixture.home?'HOME':'AWAY')+' · '+fmtDate(data.fixture.date),6.4,'medium','#BBC2CF',.72);
  s.addSpacer();
  txt(s,String(data.fixture.ours)+' - '+String(data.fixture.theirs),25,'heavy');

  spacer(root,7);
  const body=root.addStack(); body.layoutHorizontally();

  const ratings=body.addStack(); ratings.layoutVertically(); ratings.size=new Size(158,0);
  txt(ratings,'★ TOP RATED',6.8,'bold','#F3C75B');
  spacer(ratings,2);
  data.top3.forEach((p,i)=>{
    const r=ratings.addStack(); r.layoutHorizontally();
    txt(r,String(i+1),7.2,'heavy',i===0?'#F3C75B':'#BFC5D0');
    spacer(r,6); txt(r,compact(displayPlayerName(p.name),14),8.4,i===0?'bold':'semibold','#FFFFFF',i===0?1:.90);
    r.addSpacer(); txt(r,p.rating.toFixed(1),8.2,'heavy',i===0?'#F3C75B':'#FFFFFF',i===0?1:.88);
    spacer(ratings,1);
  });

  spacer(body,10);
  const v=body.addStack(); v.size=new Size(1,72); v.backgroundColor=C('#FFFFFF',.16);
  spacer(body,10);

  const c=body.addStack(); c.layoutVertically(); c.size=new Size(122,0);
  txt(c,'⚽ GOALS',7.1,'bold','#FFFFFF',.86);
  const gl=goalLines(data);
  (gl.length?gl:['—']).forEach(x=>txt(c,compact(x,17),8.0,'semibold','#FFFFFF',gl.length?.96:.55));
  spacer(c,3);
  txt(c,'🎯 ASSISTS',7.1,'bold','#FFFFFF',.86);
  const al=assistLines(data);
  (al.length?al:['—']).forEach(x=>txt(c,compact(x,17),8.0,'semibold','#FFFFFF',al.length?.96:.55));

  root.addSpacer();

  const f=root.addStack(); f.layoutHorizontally(); f.centerAlignContent();
  f.setPadding(4,7,4,7); f.cornerRadius=9; f.backgroundColor=C('#07101C',.58);
  txt(f,'NEXT',6.6,'heavy','#F3C75B'); spacer(f,7);
  if(data.next){
    txt(f,'vs '+compact(data.next.opponent,20),8.2,'semibold');
    f.addSpacer(); txt(f,fmtDate(data.next.date,true)+' · '+data.next.competition,6.7,'medium','#D2D7E1',.82);
  }else txt(f,'次戦データなし',7.5,'medium','#D2D7E1',.78);

  w.refreshAfterDate=new Date(Date.now()+CP.refreshMs);
  return w;
}


function makeLargeBackground(hero){
  const W=360,H=360;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=false;
  ctx.setFillColor(C('#05070C'));
  ctx.fillRect(new Rect(0,0,W,H));

  if(hero){
    const iw=hero.size.width||1, ih=hero.size.height||1;
    const targetW=203, targetH=288;
    const scale=Math.min(targetW/iw,targetH/ih);
    const dw=iw*scale, dh=ih*scale;
    const x=W-dw+21;
    const y=91+(198-dh)/2;
    ctx.drawImageInRect(hero,new Rect(x,y,dw,dh));
  }

  ctx.setFillColor(C('#02050A',.10));
  ctx.fillRect(new Rect(0,0,W,H));
  return ctx.getImage();
}

function formChip(parent,value){
  const p=parent.addStack();
  p.setPadding(3,7,3,7);
  p.cornerRadius=7;
  const m={
    W:['#173A26','#63E283'],
    D:['#343842','#D7DAE1'],
    L:['#451B21','#FF7B83']
  }[value]||['#272B33','#9EA4AF'];
  p.backgroundColor=C(m[0],.94);
  txt(p,value,7.5,'heavy',m[1]);
}

function buildLarge(data,images){
  const w=new ListWidget();
  w.setPadding(0,0,0,0);
  w.backgroundImage=makeLargeBackground(images.hero);

  const root=w.addStack();
  root.layoutVertically();
  root.setPadding(14,14,12,14);

  const overlay=new LinearGradient();
  overlay.startPoint=new Point(0,0.5);
  overlay.endPoint=new Point(1,0.5);
  overlay.colors=[
    C('#02050A',.97),
    C('#02050A',.90),
    C('#02050A',.55),
    C('#02050A',.12)
  ];
  overlay.locations=[0,.42,.72,1];
  root.backgroundGradient=overlay;

  const h=root.addStack();
  h.layoutHorizontally();
  h.centerAlignContent();
  if(images.crest){
    const im=h.addImage(images.crest);
    im.imageSize=new Size(26,26);
  }
  spacer(h,7);
  txt(h,CP.clubName,13,'heavy');
  spacer(h,7);
  txt(h,data.fixture.competition,7.5,'semibold','#D9DDE6',.82);
  h.addSpacer();
  resultChip(h,data.fixture.result);

  spacer(root,10);

  const score=root.addStack();
  score.layoutHorizontally();
  score.centerAlignContent();
  const sl=score.addStack();
  sl.layoutVertically();
  txt(sl,compact(data.fixture.opponent,22),10,'semibold','#F0F2F6',.96);
  txt(sl,(data.fixture.home?'HOME':'AWAY')+' · '+fmtDate(data.fixture.date),7,'medium','#BBC2CF',.74);
  score.addSpacer();
  txt(score,String(data.fixture.ours)+' - '+String(data.fixture.theirs),31,'heavy');

  spacer(root,10);

  const info=root.addStack();
  info.layoutHorizontally();

  const ratings=info.addStack();
  ratings.layoutVertically();
  ratings.size=new Size(182,0);
  txt(ratings,'★ TOP RATED',7.2,'bold','#F3C75B');
  spacer(ratings,3);
  data.top3.forEach((p,i)=>{
    const r=ratings.addStack();
    r.layoutHorizontally();
    txt(r,String(i+1),7.5,'heavy',i===0?'#F3C75B':'#C4CAD4');
    spacer(r,7);
    txt(r,compact(displayPlayerName(p.name),15),9,i===0?'bold':'semibold','#FFFFFF',i===0?1:.90);
    r.addSpacer();
    txt(r,p.rating.toFixed(1),8.8,'heavy',i===0?'#F3C75B':'#FFFFFF',i===0?1:.88);
    spacer(ratings,2);
  });

  spacer(info,12);
  const divider=info.addStack();
  divider.size=new Size(1,92);
  divider.backgroundColor=C('#FFFFFF',.07);
  spacer(info,12);

  const contrib=info.addStack();
  contrib.layoutVertically();
  contrib.size=new Size(162,0);
  txt(contrib,'⚽ GOALS',8.2,'bold','#FFFFFF',.92);
  const gl=goalLines(data);
  (gl.length?gl:['—']).forEach(x=>txt(contrib,compact(x,20),9.3,'semibold','#FFFFFF',gl.length?.98:.55));
  spacer(contrib,6);
  txt(contrib,'🎯 ASSISTS',8.2,'bold','#FFFFFF',.92);
  const al=assistLines(data);
  (al.length?al:['—']).forEach(x=>txt(contrib,compact(x,20),9.3,'semibold','#FFFFFF',al.length?.98:.55));

  root.addSpacer();

  const heroRow=root.addStack();
  heroRow.layoutHorizontally();
  heroRow.addSpacer();
  const heroCard=heroRow.addStack();
  heroCard.layoutVertically();
  heroCard.setPadding(5,9,5,9);
  heroCard.cornerRadius=10;
  heroCard.backgroundColor=C('#07101C',.50);
  const tag=heroCard.addStack();
  tag.layoutHorizontally();
  txt(tag,'MVP',6.5,'heavy','#F3C75B');
  spacer(tag,6);
  txt(tag,compact(displayPlayerName(data.hero?.name),15),9.4,'bold');
  spacer(tag,5);
  txt(tag,data.hero?.rating?.toFixed(1)??'—',9.4,'heavy','#F3C75B');

  spacer(root,10);

  const form=root.addStack();
  form.layoutHorizontally();
  form.centerAlignContent();
  txt(form,'RECENT',6.4,'heavy','#AEB5C0',.75);
  spacer(form,7);
  const ff=(data.form||[]).slice(0,5);
  if(ff.length){
    ff.forEach((x,i)=>{
      formChip(form,x);
      if(i<ff.length-1)spacer(form,4);
    });
  }else{
    txt(form,'—',8,'medium','#AEB5C0',.65);
  }

  spacer(root,7);

  const f=root.addStack();
  f.layoutHorizontally();
  f.centerAlignContent();
  f.setPadding(5,8,5,8);
  f.cornerRadius=10;
  f.backgroundColor=C('#07101C',.66);
  txt(f,'NEXT',6.8,'heavy','#F3C75B');
  spacer(f,8);
  if(data.next){
    txt(f,'vs '+compact(data.next.opponent,21),8.8,'semibold');
    f.addSpacer();
    txt(f,fmtDate(data.next.date,true)+' · '+data.next.competition,7,'medium','#D2D7E1',.82);
  }else{
    txt(f,'次戦データなし',8,'medium','#D2D7E1',.78);
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

let widget;
try{
  const force=config.runsInApp;
  const data=await fetchData(force);
  const [hero,crest]=await Promise.all([
    cachedImage(data.hero?.photo,'hero_'+(data.hero?.id||'none')),
    cachedImage(data.team?.logo,'crest_'+CP.teamId)
  ]);
  const requested=String(args.widgetParameter||'').toLowerCase();
  const family=config.runsInWidget
    ? (config.widgetFamily||'medium')
    : (requested.includes('medium')?'medium':'large');
  widget=(family==='large'||family==='extraLarge')
    ? buildLarge(data,{hero,crest})
    : buildMedium(data,{hero,crest});
}catch(e){
  widget=errorWidget('データ取得失敗\n'+String(e));
}

Script.setWidget(widget);
if(config.runsInApp){
  const requested=String(args.widgetParameter||'').toLowerCase();
  if(requested.includes('medium'))await widget.presentMedium();
  else await widget.presentLarge();
}
Script.complete();
