// Club Pulse Hero Loader v0.2
// Install once in Scriptable. Runtime is always pulled from GitHub main.

const REMOTE =
  'https://api.github.com/repos/48wr9f4wgp-lab/club-pulse/contents/scriptable/club-pulse-hero.js?ref=main';

const fm = FileManager.local();
const cachePath = fm.joinPath(
  fm.documentsDirectory(),
  'ClubPulseHeroRuntime_v02.js'
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

await run(args, config);
