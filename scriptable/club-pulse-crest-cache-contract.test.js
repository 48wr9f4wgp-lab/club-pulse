const fs=require('fs');
const path=require('path');
const vm=require('vm');
const patch=fs.readFileSync(path.join(__dirname,'club-pulse-crest-cache-namespace-patch.js'),'utf8');
const launcher=fs.readFileSync(path.join(__dirname,'club-pulse.js'),'utf8');
let failed=0;
function check(name,ok){if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}}

const ctx={
  image:async()=>null,
  path:x=>x,
  files:()=>({fm:{fileExists:()=>false,readImage:()=>null,writeImage:()=>{}}}),
  Request:function(){this.timeoutInterval=0;this.loadImage=async()=>({})}
};
vm.runInNewContext(patch,ctx);

check('football-data crest namespace',ctx.cpCrestProviderNamespace('https://crests.football-data.org/529.png')==='football_data');
check('API-Football crest namespace',ctx.cpCrestProviderNamespace('https://media.api-sports.io/football/teams/529.png')==='api_football');
check('same numeric team id cannot collide across providers',
  ctx.cpCrestCacheKey('https://crests.football-data.org/529.png',529)!==
  ctx.cpCrestCacheKey('https://media.api-sports.io/football/teams/529.png',529));
check('new cache generation ignores legacy crest_<id> path',patch.includes("CP_CREST_CACHE_VERSION='v2'")&&patch.includes('crest_${safe}.png'));
check('launcher pins crest namespace patch immutably',launcher.includes('3faa5795fe981d33b788d8703eb00438efec1a1f/scriptable/club-pulse-crest-cache-namespace-patch.js'));
check('launcher uses dedicated local cache',launcher.includes('ClubPulseCrestCacheNamespacePatch_v1.js')&&launcher.includes("'crest-cache1'"));
check('crest patch executes before widget data/image load',launcher.includes("+cm+'\\n'+ccn+'\\n'+fp"));

if(failed){console.error(`\nCrest cache contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse crest cache contract PASSED');
