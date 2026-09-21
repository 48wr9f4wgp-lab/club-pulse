// Club Pulse Hero Loader v0.6
// API-first loader: GitHub branch content -> raw branch -> local cache.
// Install this file once in Scriptable.

const REPO = '48wr9f4wgp-lab/club-pulse';
const BRANCH = 'hero-prototype';
const PATH = 'scriptable/club-pulse-hero.js';

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
  'ClubPulseHeroRuntime_v06.js'
);

function validRuntime(source) {
  return Boolean(
    source &&
    source.length >= 5000 &&
    source.includes('Club Pulse Hero Prototype')
  );
}

async function fetchApi() {
  const req = new Request(API + '&cb=' + Date.now());

  req.headers = {
    'Accept': 'application/vnd.github.raw+json',
    'Cache-Control': 'no-cache, no-store, max-age=0',
    'Pragma': 'no-cache',
    'User-Agent': 'ClubPulse-Scriptable-v06'
  };

  req.timeoutInterval = 15;

  const source = await req.loadString();
  const status = req.response?.statusCode || 200;

  if (status >= 400 || !validRuntime(source)) {
    throw new Error('GitHub API HTTP ' + status);
  }

  return source;
}

async function fetchRaw() {
  const req = new Request(RAW + '?cb=' + Date.now());

  req.headers = {
    'Accept': 'text/plain',
    'Cache-Control': 'no-cache, no-store, max-age=0',
    'Pragma': 'no-cache',
    'User-Agent': 'ClubPulse-Scriptable-v06'
  };

  req.timeoutInterval = 15;

  const source = await req.loadString();
  const status = req.response?.statusCode || 200;

  if (status >= 400 || !validRuntime(source)) {
    throw new Error('raw GitHub HTTP ' + status);
  }

  return source;
}

async function loadRuntime() {
  const errors = [];

  try {
    const source = await fetchApi();
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
