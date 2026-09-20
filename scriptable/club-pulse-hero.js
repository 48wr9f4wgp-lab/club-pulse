// Club Pulse Hero Prototype v0.1
// Real Madrid post-match hero widget for Scriptable.
// Data: API-Football. Medium widget is the target surface.

const CP_HERO = {
  clubName: 'レアル・マドリード',
  clubSearch: 'Real Madrid',
  clubShort: 'RMA',
  tokenKey: 'clubpulse_api_football_token_v1',
  api: 'https://v3.football.api-sports.io',
  cacheTtlMs: 2 * 60 * 60 * 1000,
  refreshMs: 60 * 60 * 1000,
};

const fm = FileManager.local();
const baseDir = fm.joinPath(fm.documentsDirectory(), 'ClubPulseHero');
if (!fm.fileExists(baseDir)) fm.createDirectory(baseDir, true);
const dataCachePath = fm.joinPath(baseDir, 'realmadrid_postmatch_v1.json');
const teamCachePath = fm.joinPath(baseDir, 'realmadrid_team_v1.json');

function readJson(path, fallback = null) {
  try { return fm.fileExists(path) ? JSON.parse(fm.readString(path)) : fallback; }
  catch (_) { return fallback; }
}

function writeJson(path, value) {
  try { fm.writeString(path, JSON.stringify(value)); } catch (_) {}
}

function C(hex, alpha = 1) { return new Color(hex, alpha); }
function spacer(parent, n) { parent.addSpacer(n); }

async function requireApiKey() {
  if (Keychain.contains(CP_HERO.tokenKey)) return Keychain.get(CP_HERO.tokenKey);
  if (!config.runsInApp) return null;

  const alert = new Alert();
  alert.title = 'Club Pulse Hero';
  alert.message = 'API-Football の API-KEY を貼り付けてください。既存の Club Pulse と同じKeychainキーを使います。';
  alert.addTextField('API-KEY', '');
  alert.addAction('保存');
  alert.addCancelAction('キャンセル');
  const idx = await alert.present();
  if (idx < 0) return null;
  const token = alert.textFieldValue(0).trim();
  if (token) Keychain.set(CP_HERO.tokenKey, token);
  return token || null;
}

async function api(path, token) {
  const req = new Request(CP_HERO.api + path);
  req.headers = { 'x-apisports-key': token };
  req.timeoutInterval = 15;
  const json = await req.loadJSON();
  const status = req.response?.statusCode || 200;

  const errors = json?.errors;
  const hasErrors =
    Array.isArray(errors) ? errors.length > 0 :
    errors && typeof errors === 'object' ? Object.keys(errors).length > 0 :
    Boolean(errors);

  if (status >= 400 || hasErrors) {
    let detail = '';
    try {
      detail = typeof errors === 'string' ? errors : JSON.stringify(errors);
    } catch (_) {
      detail = String(errors || '');
    }
    throw new Error(`API-Football ${status}${detail ? ' · ' + detail : ''}`);
  }
  return json;
}

function isOfficial(fixture) {
  const name = String(fixture?.league?.name || '').toLowerCase();
  return !name.includes('friendly') && !name.includes('friendlies');
}

function isFinished(fixture) {
  const s = String(fixture?.fixture?.status?.short || '').toUpperCase();
  return ['FT', 'AET', 'PEN'].includes(s);
}

function isUpcoming(fixture) {
  const s = String(fixture?.fixture?.status?.short || '').toUpperCase();
  return ['NS', 'TBD'].includes(s) || new Date(fixture?.fixture?.date || 0).getTime() > Date.now();
}

async function resolveTeam(token) {
  const cached = readJson(teamCachePath);
  if (cached?.id && cached?.logo) return cached;

  const j = await api(`/teams?search=${encodeURIComponent(CP_HERO.clubSearch)}`, token);
  const rows = j?.response || [];
  const exact = rows.find(x => String(x?.team?.name || '').toLowerCase() === CP_HERO.clubSearch.toLowerCase());
  const team = (exact || rows[0])?.team;
  if (!team?.id) throw new Error('Real Madrid team ID not found');

  const out = { id: team.id, name: team.name, logo: team.logo };
  writeJson(teamCachePath, out);
  return out;
}

function statRow(player) {
  const s = player?.statistics?.[0] || {};
  const rawRating = s?.games?.rating;
  const rating = Number.parseFloat(rawRating);
  return {
    id: player?.player?.id || null,
    name: player?.player?.name || 'Unknown',
    photo: player?.player?.photo || null,
    rating: Number.isFinite(rating) ? rating : null,
    goals: Number(s?.goals?.total || 0),
    assists: Number(s?.goals?.assists || 0),
    minutes: Number(s?.games?.minutes || 0),
  };
}

function formatDate(iso, withTime = false) {
  try {
    const df = new DateFormatter();
    df.locale = 'ja_JP';
    df.dateFormat = withTime ? 'M/d(E) HH:mm' : 'M/d(E)';
    return df.string(new Date(iso));
  } catch (_) { return '—'; }
}

function opponentOf(fixture, teamId) {
  const home = fixture?.teams?.home;
  const away = fixture?.teams?.away;
  return home?.id === teamId ? away : home;
}

function scoreOf(fixture, teamId) {
  const home = fixture?.teams?.home;
  const oursHome = home?.id === teamId;
  return {
    ours: oursHome ? fixture?.goals?.home : fixture?.goals?.away,
    theirs: oursHome ? fixture?.goals?.away : fixture?.goals?.home,
    home: oursHome,
  };
}

function resultOf(score) {
  if (!Number.isFinite(score.ours) || !Number.isFinite(score.theirs)) return '—';
  return score.ours > score.theirs ? 'WIN' : score.ours < score.theirs ? 'LOSS' : 'DRAW';
}

function jpComp(name) {
  const n = String(name || '');
  const l = n.toLowerCase();
  if (l.includes('la liga')) return 'LaLiga';
  if (l.includes('champions')) return 'CL';
  if (l.includes('copa del rey')) return '国王杯';
  if (l.includes('super cup') || l.includes('supercopa')) return 'SUPER';
  return n || '公式戦';
}

function compactName(name, max = 18) {
  const n = String(name || '—');
  return n.length > max ? n.slice(0, max - 1) + '…' : n;
}

async function fetchHeroData(token, force = false) {
  const cached = readJson(dataCachePath);
  if (!force && cached?.fetchedAt && Date.now() - cached.fetchedAt < CP_HERO.cacheTtlMs) return cached;

  try {
    const team = await resolveTeam(token);

    // Free API-Football plans may reject the `next` / `last` parameters.
    // Fetch one bounded date window instead and select previous/next locally.
    const now = new Date();
    const fromDate = new Date(now.getTime() - 45 * 86400000);
    const toDate = new Date(now.getTime() + 60 * 86400000);
    const ymd = d => d.toISOString().slice(0, 10);

    const fixturesJ = await api(
      `/fixtures?team=${team.id}&from=${ymd(fromDate)}&to=${ymd(toDate)}&timezone=Asia%2FTokyo`,
      token
    );
    const fixtures = (fixturesJ?.response || []).filter(isOfficial);

    const latest = fixtures
      .filter(isFinished)
      .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date))[0];
    if (!latest?.fixture?.id) throw new Error('Latest finished fixture not found');

    const next = fixtures
      .filter(isUpcoming)
      .filter(x => new Date(x?.fixture?.date || 0).getTime() > Date.now() - 5 * 60 * 1000)
      .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date))[0] || null;

    const [playersJ, eventsJ] = await Promise.all([
      api(`/fixtures/players?fixture=${latest.fixture.id}`, token),
      api(`/fixtures/events?fixture=${latest.fixture.id}`, token),
    ]);

    const teamBlock = (playersJ?.response || []).find(x => x?.team?.id === team.id);
    const players = (teamBlock?.players || [])
      .map(statRow)
      .filter(x => x.rating !== null && x.minutes > 0)
      .sort((a, b) => b.rating - a.rating || b.minutes - a.minutes);

    const top3 = players.slice(0, 3);
    const hero = top3[0] || players.find(x => x.goals > 0) || null;

    const goals = (eventsJ?.response || [])
      .filter(e => e?.team?.id === team.id && e?.type === 'Goal' && e?.detail !== 'Missed Penalty')
      .map(e => ({
        scorer: e?.player?.name || '—',
        assist: e?.assist?.name || null,
        minute: e?.time?.elapsed ?? null,
        detail: e?.detail || 'Goal',
      }));

    const score = scoreOf(latest, team.id);
    const opp = opponentOf(latest, team.id);
    const nextOpp = next ? opponentOf(next, team.id) : null;

    const out = {
      fetchedAt: Date.now(),
      team,
      fixture: {
        id: latest.fixture.id,
        date: latest.fixture.date,
        competition: jpComp(latest?.league?.name),
        venue: latest?.fixture?.venue?.name || '',
        opponent: opp?.name || '—',
        opponentLogo: opp?.logo || null,
        ours: score.ours,
        theirs: score.theirs,
        result: resultOf(score),
        home: score.home,
      },
      top3,
      hero,
      goals,
      next: next ? {
        date: next.fixture.date,
        competition: jpComp(next?.league?.name),
        opponent: nextOpp?.name || '—',
        opponentLogo: nextOpp?.logo || null,
      } : null,
    };

    writeJson(dataCachePath, out);
    return out;
  } catch (error) {
    if (cached) return { ...cached, stale: true, lastError: String(error) };
    throw error;
  }
}

async function cachedImage(url, key) {
  if (!url) return null;
  const safe = String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = fm.joinPath(baseDir, `${safe}.img`);
  try {
    if (fm.fileExists(path)) return fm.readImage(path);
    const req = new Request(url);
    req.timeoutInterval = 12;
    const img = await req.loadImage();
    fm.writeImage(path, img);
    return img;
  } catch (_) { return null; }
}

function makeHeroBackground(heroImage) {
  const W = 720, H = 338;
  const ctx = new DrawContext();
  ctx.size = new Size(W, H);
  ctx.opaque = true;
  ctx.respectScreenScale = true;
  ctx.setFillColor(C('#06080D'));
  ctx.fillRect(new Rect(0, 0, W, H));

  if (heroImage) {
    const iw = heroImage.size.width || W;
    const ih = heroImage.size.height || H;
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale, dh = ih * scale;
    const x = W - dw * 0.84;
    const y = (H - dh) / 2;
    ctx.drawImageInRect(heroImage, new Rect(x, y, dw, dh));
  }

  ctx.setFillColor(C('#02040A', heroImage ? 0.42 : 0));
  ctx.fillRect(new Rect(0, 0, W, H));

  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const a = 0.82 * (1 - t);
    ctx.setFillColor(C('#02040A', a));
    ctx.fillRect(new Rect(i * (W / 28), 0, W / 28 + 2, H));
  }

  ctx.setFillColor(C('#06101F', 0.22));
  ctx.fillRect(new Rect(0, 0, W, H));
  return ctx.getImage();
}

function txt(parent, value, size, weight = 'medium', color = '#FFFFFF', alpha = 1) {
  const t = parent.addText(String(value));
  if (weight === 'heavy') t.font = Font.heavySystemFont(size);
  else if (weight === 'bold') t.font = Font.boldSystemFont(size);
  else if (weight === 'semibold') t.font = Font.semiboldSystemFont(size);
  else t.font = Font.mediumSystemFont(size);
  t.textColor = C(color, alpha);
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.65;
  return t;
}

function addResultChip(parent, result) {
  const chip = parent.addStack();
  chip.setPadding(3, 7, 3, 7);
  chip.cornerRadius = 7;
  const map = {
    WIN: ['#E7B94A', '#0A0D13'],
    DRAW: ['#747B88', '#FFFFFF'],
    LOSS: ['#8A2531', '#FFFFFF'],
  };
  const [bg, fg] = map[result] || ['#374151', '#FFFFFF'];
  chip.backgroundColor = C(bg, 0.94);
  txt(chip, result, 8, 'heavy', fg);
}

function goalLines(data) {
  if (data.goals?.length) {
    return data.goals.slice(0, 3).map(g => `${g.scorer}${Number.isFinite(g.minute) ? ` ${g.minute}'` : ''}`);
  }
  return data.top3.filter(x => x.goals > 0).slice(0, 3).map(x => `${x.name}${x.goals > 1 ? ` ×${x.goals}` : ''}`);
}

function assistLines(data) {
  const names = [];
  for (const g of data.goals || []) if (g.assist && !names.includes(g.assist)) names.push(g.assist);
  if (!names.length) for (const p of data.top3) if (p.assists > 0 && !names.includes(p.name)) names.push(p.name);
  return names.slice(0, 3);
}

function buildMedium(data, images) {
  const w = new ListWidget();
  w.setPadding(0, 0, 0, 0);
  w.backgroundImage = makeHeroBackground(images.hero);

  const card = w.addStack();
  card.layoutVertically();
  card.setPadding(10, 12, 9, 12);
  card.backgroundColor = C('#02050A', 0.35);

  const header = card.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();
  if (images.crest) {
    const crest = header.addImage(images.crest);
    crest.imageSize = new Size(22, 22);
  }
  spacer(header, 6);
  txt(header, CP_HERO.clubName, 11, 'heavy');
  spacer(header, 6);
  txt(header, data.fixture.competition, 7, 'semibold', '#D8DCE5', 0.82);
  header.addSpacer();
  addResultChip(header, data.fixture.result);

  spacer(card, 6);

  const scoreRow = card.addStack();
  scoreRow.layoutHorizontally();
  scoreRow.centerAlignContent();
  const left = scoreRow.addStack();
  left.layoutVertically();
  txt(left, compactName(data.fixture.opponent, 20), 8.5, 'semibold', '#E7EAF0', 0.92);
  txt(left, `${data.fixture.home ? 'HOME' : 'AWAY'} · ${formatDate(data.fixture.date)}`, 6.4, 'medium', '#B8BFCC', 0.72);
  scoreRow.addSpacer();
  txt(scoreRow, `${data.fixture.ours} - ${data.fixture.theirs}`, 25, 'heavy');

  spacer(card, 7);

  const info = card.addStack();
  info.layoutHorizontally();

  const ratings = info.addStack();
  ratings.layoutVertically();
  ratings.size = new Size(176, 0);
  txt(ratings, '★ TOP RATED', 6.8, 'bold', '#F3C75B', 0.98);
  spacer(ratings, 2);
  data.top3.forEach((p, i) => {
    const row = ratings.addStack();
    row.layoutHorizontally();
    txt(row, `${i + 1}`, 7.2, 'heavy', i === 0 ? '#F3C75B' : '#BFC5D0');
    spacer(row, 6);
    txt(row, compactName(p.name, 16), 8.1, i === 0 ? 'bold' : 'semibold', '#FFFFFF', i === 0 ? 1 : 0.88);
    row.addSpacer();
    txt(row, p.rating?.toFixed(1) ?? '—', 8.2, 'heavy', i === 0 ? '#F3C75B' : '#FFFFFF', i === 0 ? 1 : 0.88);
    spacer(ratings, 1);
  });

  spacer(info, 10);
  const vertical = info.addStack();
  vertical.size = new Size(1, 72);
  vertical.backgroundColor = C('#FFFFFF', 0.16);
  spacer(info, 10);

  const contrib = info.addStack();
  contrib.layoutVertically();
  contrib.size = new Size(145, 0);
  txt(contrib, '⚽ GOALS', 6.8, 'bold', '#FFFFFF', 0.82);
  const goals = goalLines(data);
  if (goals.length) goals.forEach(x => txt(contrib, compactName(x, 20), 7.6, 'semibold', '#FFFFFF', 0.95));
  else txt(contrib, '—', 7.6, 'medium', '#FFFFFF', 0.55);
  spacer(contrib, 3);
  txt(contrib, '🎯 ASSISTS', 6.8, 'bold', '#FFFFFF', 0.82);
  const assists = assistLines(data);
  if (assists.length) assists.forEach(x => txt(contrib, compactName(x, 20), 7.6, 'semibold', '#FFFFFF', 0.95));
  else txt(contrib, '—', 7.6, 'medium', '#FFFFFF', 0.55);

  card.addSpacer();

  const footer = card.addStack();
  footer.layoutHorizontally();
  footer.centerAlignContent();
  footer.setPadding(4, 7, 4, 7);
  footer.cornerRadius = 9;
  footer.backgroundColor = C('#07101C', 0.58);
  txt(footer, 'NEXT', 6.6, 'heavy', '#F3C75B');
  spacer(footer, 7);
  if (data.next) {
    txt(footer, `vs ${compactName(data.next.opponent, 20)}`, 8.2, 'semibold');
    footer.addSpacer();
    txt(footer, `${formatDate(data.next.date, true)} · ${data.next.competition}`, 6.7, 'medium', '#D2D7E1', 0.82);
  } else {
    txt(footer, '次戦データなし', 7.5, 'medium', '#D2D7E1', 0.78);
  }

  w.refreshAfterDate = new Date(Date.now() + CP_HERO.refreshMs);
  return w;
}

function buildUnsupportedFamily() {
  const w = new ListWidget();
  w.backgroundColor = C('#070A10');
  w.setPadding(14, 14, 14, 14);
  txt(w, 'CLUB PULSE HERO', 13, 'heavy');
  spacer(w, 8);
  const t = txt(w, 'この試作はMedium Widget専用です。', 10, 'semibold', '#D0D5DF', 0.9);
  t.lineLimit = 2;
  return w;
}

function errorWidget(message) {
  const w = new ListWidget();
  w.backgroundColor = C('#070A10');
  w.setPadding(14, 14, 14, 14);
  txt(w, 'CLUB PULSE HERO', 13, 'heavy');
  spacer(w, 8);
  const t = txt(w, message, 9.5, 'medium', '#D0D5DF', 0.9);
  t.lineLimit = 6;
  return w;
}

const apiKey = await requireApiKey();
let widget;

if (!apiKey) {
  widget = errorWidget('Scriptableで一度実行し、API-FootballのAPI-KEYを設定してください。');
} else if ((config.widgetFamily || 'medium') !== 'medium' && config.runsInWidget) {
  widget = buildUnsupportedFamily();
} else {
  try {
    const force = config.runsInApp && String(args.widgetParameter || '').toLowerCase().includes('refresh');
    const data = await fetchHeroData(apiKey, force);
    const [hero, crest] = await Promise.all([
      cachedImage(data.hero?.photo, `hero_${data.hero?.id || 'none'}`),
      cachedImage(data.team?.logo, `crest_${data.team?.id || 'realmadrid'}`),
    ]);
    widget = buildMedium(data, { hero, crest });
  } catch (error) {
    widget = errorWidget('データ取得失敗\n' + String(error));
  }
}

Script.setWidget(widget);
if (config.runsInApp) await widget.presentMedium();
Script.complete();
