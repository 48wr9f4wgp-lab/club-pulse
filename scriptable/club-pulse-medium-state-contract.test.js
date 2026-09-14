const fs=require('fs');
const path=require('path');
const r=n=>fs.readFileSync(path.join(__dirname,n),'utf8');

const premium=r('club-pulse-premium-visual-patch.js');
const resilience=r('club-pulse-resilience-patch.js');
const live=r('club-pulse-live-context-patch.js');
const theme=r('club-pulse-theme-registry-patch.js');
let failed=0;
const check=(name,ok)=>{if(ok)console.log(`✓ ${name}`);else{console.error(`✗ ${name}`);failed++}};

try{new Function(premium);check('premium visual syntax',true)}catch(e){console.error(e);check('premium visual syntax',false)}
check('premium v6 captures shared Medium header',premium.includes('CP_PREMIUM_BASE_HEADER_MEDIUM=buildHeaderMedium'));
check('generic Medium header routes through typography guard',premium.includes('function cpPremiumHeaderMedium')&&premium.includes('cpPremiumGuardText(heavy(l,club.name,10.5'));
check('Medium header stays single line with scale floor',premium.includes('t.lineLimit=1')&&premium.includes('t.minimumScaleFactor=minScale'));
check('Medium team labels use guarded one-line rendering',premium.includes('cpPremiumGuardText(heavy(name,opt.name,opt.nameSize||12,fg),.74)'));
check('Medium NEXT versus is emphasized to 20pt',premium.includes("d.mode==='POST'?27:d.mode==='NEXT'?20:22"));
check('Medium center score remains guarded against wrapping',premium.includes('cpPremiumGuardText(heavy(row,centerMainText(d,m)')&&premium.includes(',.82);mid.centerAlignText()'));
check('Medium metadata keeps canonical scaling helper',premium.includes('cpMetaText(meta,metaLine(d,m),fg,false)'));
check('generic Medium header override preserves special-club fallback',premium.includes('if(t&&CP_PREMIUM_GENERIC_KEYS.has(t.key))return cpPremiumHeaderMedium')&&premium.includes('return CP_PREMIUM_BASE_HEADER_MEDIUM'));

check('Medium stale header still exposes saved-data state',theme.includes("${d.stale?' · 保存データ':''}"));
check('LIVE context uses separated home-away plus venue instead of kickoff',live.includes("return venue&&venue!=='会場未定'?`${side} ・ ${venue}`:side")&&live.includes("if(d?.mode==='LIVE')return cpLiveContext(m)"));
check('Small LIVE context restores source kickoff after rendering',live.includes('finally{m.kickoff=oldKickoff}'));

check('offline mode serves normalized cache',resilience.includes("if(qa==='offline'&&cached)")&&resilience.includes("return{...normalized,stale:true,resilience:'cache'}"));
check('offline mode blocks secondary next/live network overlays',resilience.includes('if(cpResForcedOutage())return d')&&resilience.includes('CP_RES_BASE_NEXT_OVERLAY')&&resilience.includes('CP_RES_BASE_LIVE_OVERLAY'));
check('no-cache outage reaches explicit error path',resilience.includes("qa==='offline'||qa==='nocache'")&&resilience.includes("throw forced"));
check('stale and error states retry within five minutes',resilience.includes('if(d?.stale)return 5*60*1000')&&resilience.includes('w.refreshAfterDate=new Date(Date.now()+5*60*1000)'));
check('stale NEXT after kickoff is not presented as trustworthy next match',resilience.includes("return'更新待ち'"));

if(failed){console.error(`\nMedium/state RC contract FAILED: ${failed}`);process.exit(1)}
console.log('\nClub Pulse Medium + LIVE/stale/offline RC contract PASSED');