// Club Pulse Hero Loader v0.4
// Install once in Scriptable. Runtime is always pulled from the dedicated hero-prototype branch.

const REMOTE =
  'https://api.github.com/repos/48wr9f4wgp-lab/club-pulse/contents/scriptable/club-pulse-hero.js?ref=hero-prototype';

const fm = FileManager.local();
const cachePath = fm.joinPath(
  fm.documentsDirectory(),
  'ClubPulseHeroRuntime_v03.js'
);

async function fetchRuntime() {
  const req = new Request(REMOTE + '&cb=' + Date.now());
  req.headers = {
    'Accept': 'application/vnd.github.raw+json',
    'User-Agent': 'ClubPulse-Scriptable'
  };
  req.timeoutInterval = 12;

  const source = await req.loadString();
  const status = req.response?.statusCode || 200;

  if (
    status >= 400 ||
    !source ||
    source.length < 5000 ||
    !source.includes('Club Pulse Hero Prototype')
  ) {
    throw new Error('GitHub runtime fetch failed: HTTP ' + status);
  }

  fm.writeString(cachePath, source);
  return source;
}

let source;

try {
  source = await fetchRuntime();
} catch (error) {
  // Manual runs must expose fetch failures instead of silently running stale code.
  if (config.runsInApp || !fm.fileExists(cachePath)) {
    throw error;
  }
  source = fm.readString(cachePath);
}

const run = new Function(
  'args',
  'config',
  'return (async()=>{\n' + source + '\n})()'
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

  const msg = w.addText('Widget実行エラー\n' + String(error));
  msg.font = Font.systemFont(9);
  msg.textColor = new Color('#D0D5DF');
  msg.lineLimit = 8;

  Script.setWidget(w);

  if (config.runsInApp) {
    if ((config.widgetFamily || 'medium') === 'large') await w.presentLarge();
    else await w.presentMedium();
  }

  Script.complete();
}
