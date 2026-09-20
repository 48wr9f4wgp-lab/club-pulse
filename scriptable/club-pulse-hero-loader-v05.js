// Club Pulse Hero Loader v0.5
// Robust loader: raw GitHub -> GitHub API fallback -> local cache.
// Install this file once in Scriptable.

const RAW =
  'https://raw.githubusercontent.com/48wr9f4wgp-lab/club-pulse/hero-prototype/scriptable/club-pulse-hero.js';

const API =
  'https://api.github.com/repos/48wr9f4wgp-lab/club-pulse/contents/scriptable/club-pulse-hero.js?ref=hero-prototype';

const fm = FileManager.local();
const cachePath = fm.joinPath(
  fm.documentsDirectory(),
  'ClubPulseHeroRuntime_v03.js'
);

function validRuntime(source) {
  return Boolean(
    source &&
    source.length >= 5000 &&
    source.includes('Club Pulse Hero Prototype')
  );
}

async function fetchRaw() {
  const req = new Request(RAW + '?cb=' + Date.now());

  req.headers = {
    'Accept': 'text/plain',
    'Cache-Control': 'no-cache',
    'User-Agent': 'ClubPulse-Scriptable'
  };

  req.timeoutInterval = 12;

  const source = await req.loadString();
  const status = req.response?.statusCode || 200;

  if (status >= 400 || !validRuntime(source)) {
    throw new Error('raw GitHub HTTP ' + status);
  }

  return source;
}

async function fetchApi() {
  const req = new Request(API);

  req.headers = {
    'Accept': 'application/vnd.github.raw+json',
    'User-Agent': 'ClubPulse-Scriptable'
  };

  req.timeoutInterval = 12;

  const source = await req.loadString();
  const status = req.response?.statusCode || 200;

  if (status >= 400 || !validRuntime(source)) {
    throw new Error('GitHub API HTTP ' + status);
  }

  return source;
}

async function loadRuntime() {
  const errors = [];

  try {
    const source = await fetchRaw();
    fm.writeString(cachePath, source);
    return source;
  } catch (e) {
    errors.push(String(e));
  }

  try {
    const source = await fetchApi();
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
  }

  throw new Error(
    'runtime fetch failed: ' + errors.join(' / ')
  );
}

let source = await loadRuntime();

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
  msg.lineLimit = 8;

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
