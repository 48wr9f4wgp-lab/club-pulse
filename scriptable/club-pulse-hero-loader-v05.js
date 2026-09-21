// Club Pulse Hero Loader v0.6.1
// API JSON -> raw branch -> local cache.
// Refuses an old local runtime instead of silently showing stale UI.
// Install this file once in Scriptable.

const REPO = '48wr9f4wgp-lab/club-pulse';
const BRANCH = 'hero-prototype';
const PATH = 'scriptable/club-pulse-hero.js';
const MIN_RUNTIME = 0.52;

const RAW =
  'https://raw.githubusercontent.com/' +
  REPO + '/' + BRANCH + '/' + PATH;

const API =
  'https://api.github.com/repos/' +
  REPO + '/contents/' + PATH +
  '?ref=' + BRANCH;

const fm = FileManager.local();
const cachePath = fm.joinPath(
  fm.documentsDirectory(),
  'ClubPulseHeroRuntime_v061.js'
);

function runtimeVersion(source) {
  const m = String(source || '').match(
    /Club Pulse Hero Prototype v(\d+(?:\.\d+)?)/
  );
  return m ? Number(m[1]) : 0;
}

function validRuntime(source) {
  return Boolean(
    source &&
    source.length >= 5000 &&
    source.includes('Club Pulse Hero Prototype') &&
    runtimeVersion(source) >= MIN_RUNTIME
  );
}

function decodeBase64Text(value) {
  const clean = String(value || '').replace(/\s+/g, '');
  if (!clean) throw new Error('GitHub API content empty');

  const data = Data.fromBase64String(clean);
  if (!data) throw new Error('GitHub API base64 decode failed');

  return data.toRawString();
}

async function fetchApiJson() {
  const req = new Request(API + '&cb=' + Date.now());

  req.headers = {
    'Accept': 'application/vnd.github+json',
    'Cache-Control': 'no-cache, no-store, max-age=0',
    'Pragma': 'no-cache',
    'User-Agent': 'ClubPulse-Scriptable-v061'
  };

  req.timeoutInterval = 15;

  const json = await req.loadJSON();
  const status = req.response?.statusCode || 200;

  if (status >= 400) {
    throw new Error('GitHub API HTTP ' + status);
  }

  if (!json?.content || json?.encoding !== 'base64') {
    throw new Error('GitHub API content payload unavailable');
  }

  const source = decodeBase64Text(json.content);

  if (!validRuntime(source)) {
    throw new Error(
      'GitHub API runtime too old/invalid v' +
      runtimeVersion(source)
    );
  }

  return source;
}

async function fetchRaw() {
  const req = new Request(RAW + '?cb=' + Date.now());

  req.headers = {
    'Accept': 'text/plain',
    'Cache-Control': 'no-cache, no-store, max-age=0',
    'Pragma': 'no-cache',
    'User-Agent': 'ClubPulse-Scriptable-v061'
  };

  req.timeoutInterval = 15;

  const source = await req.loadString();
  const status = req.response?.statusCode || 200;

  if (status >= 400) {
    throw new Error('raw GitHub HTTP ' + status);
  }

  if (!validRuntime(source)) {
    throw new Error(
      'raw runtime too old/invalid v' +
      runtimeVersion(source)
    );
  }

  return source;
}

async function loadRuntime() {
  const errors = [];

  try {
    const source = await fetchApiJson();
    fm.writeString(cachePath, source);
    return source;
  } catch (e) {
    errors.push(String(e));
  }

  try {
    const source = await fetchRaw();
    fm.writeString(cachePath, source);
    return source;
  } catch (e) {
    errors.push(String(e));
  }

  if (fm.fileExists(cachePath)) {
    const cached = fm.readString(cachePath);

    if (validRuntime(cached)) {
      return cached;
    }

    errors.push(
      'local cache rejected v' + runtimeVersion(cached)
    );
  }

  throw new Error(
    'runtime fetch failed: ' + errors.join(' / ')
  );
}

const source = await loadRuntime();

const run = new Function(
  'args',
  'config',
  'return (async()=>{\n' +
    source +
  '\n})()'
);

try {
  await run(args, config);
} catch (error) {
  const w = new ListWidget();

  w.backgroundColor = new Color('#070A10');
  w.setPadding(14,14,14,14);

  const title = w.addText('CLUB PULSE HERO');
  title.font = Font.boldSystemFont(13);
  title.textColor = Color.white();

  w.addSpacer(8);

  const msg = w.addText(
    'Widget実行エラー\n' +
    String(error)
  );

  msg.font = Font.systemFont(9);
  msg.textColor = new Color('#D0D5DF');
  msg.lineLimit = 10;

  Script.setWidget(w);

  if (config.runsInApp) {
    const family =
      String(args.widgetParameter || '').toLowerCase();

    if (family.includes('small')) {
      await w.presentSmall();
    } else if (family.includes('large')) {
      await w.presentLarge();
    } else {
      await w.presentMedium();
    }
  }

  Script.complete();
}
