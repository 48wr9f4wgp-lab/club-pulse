// Club Pulse crest cache namespace v1.
// Prevents cross-provider team-id collisions between football-data.org and API-Football.
// Legacy crest_<id>.png files remain harmless because this patch uses a new v2 namespaced key.

const CP_CREST_CACHE_VERSION='v2';

function cpCrestProviderNamespace(url){
  const u=String(url||'').toLowerCase();
  if(u.includes('api-sports.io')||u.includes('api-football'))return'api_football';
  if(u.includes('football-data.org'))return'football_data';
  return'external'
}

function cpCrestCacheKey(url,key){
  return `${CP_CREST_CACHE_VERSION}_${cpCrestProviderNamespace(url)}_${String(key??'na')}`
}

image=async function(url,key){
  if(!url)return null;
  try{
    const safe=cpCrestCacheKey(url,key).replace(/[^\w-]/g,'_');
    const p=path(`crest_${safe}.png`),fm=files().fm;
    if(fm.fileExists(p))return fm.readImage(p);
    const r=new Request(url);r.timeoutInterval=10;
    const i=await r.loadImage();
    fm.writeImage(p,i);
    return i
  }catch{return null}
};
