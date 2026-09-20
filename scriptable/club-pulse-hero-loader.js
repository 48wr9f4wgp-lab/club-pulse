// Club Pulse Hero Loader v0.1
// Install this file once in Scriptable. The actual prototype lives on GitHub.

const REMOTE = 'https://raw.githubusercontent.com/48wr9f4wgp-lab/club-pulse/main/scriptable/club-pulse-hero.js';
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.documentsDirectory(), 'ClubPulseHeroRuntime.js');

async function loadRuntime() {
  try {
    const req = new Request(REMOTE + '?v=' + Date.now());
    req.timeoutInterval = 10;
    const source = await req.loadString();
    if (!source || source.length < 5000 || !source.includes('Club Pulse Hero Prototype')) {
      throw new Error('Invalid Hero runtime');
    }
    fm.writeString(cachePath, source);
    return source;
  } catch (error) {
    if (fm.fileExists(cachePath)) return fm.readString(cachePath);
    throw error;
  }
}

try {
  const source = await loadRuntime();
  const run = new Function('args', 'config', 'return (async()=>{\n' + source + '\n})()');
  await run(args, config);
} catch (error) {
  const w = new ListWidget();
  w.backgroundColor = new Color('#070A10');
  w.setPadding(14, 14, 14, 14);
  const title = w.addText('CLUB PULSE HERO');
  title.font = Font.boldSystemFont(13);
  title.textColor = Color.white();
  w.addSpacer(8);
  const msg = w.addText('GitHub runtimeを読み込めませんでした\n' + String(error));
  msg.font = Font.systemFont(9);
  msg.textColor = new Color('#D0D5DF');
  msg.lineLimit = 6;
  Script.setWidget(w);
  if (config.runsInApp) await w.presentMedium();
  Script.complete();
}
