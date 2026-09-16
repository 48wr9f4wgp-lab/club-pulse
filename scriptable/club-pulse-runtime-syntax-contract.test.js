const fs=require('fs');
const path=require('path');
const root=__dirname;
const files=[
  'club-pulse-core.js',
  'club-pulse-club-registry-patch.js','club-pulse-extra-clubs-patch.js','club-pulse-wave2-clubs-patch.js','club-pulse-wave3-netherlands-clubs-patch.js','club-pulse-wave4-lens-club-patch.js',
  'club-pulse-ui-patch.js','club-pulse-competition-logo-patch.js','club-pulse-league-expansion-patch.js','club-pulse-manutd-theme-patch.js','club-pulse-theme-registry-patch.js','club-pulse-extra-theme-patch.js','club-pulse-top-layout-patch.js','club-pulse-identity-color-patch.js','club-pulse-design-system-patch.js','club-pulse-premium-visual-patch.js','club-pulse-readability-guard-patch.js','club-pulse-cache-migration-patch.js','club-pulse-crest-cache-namespace-patch.js','club-pulse-final-polish-patch.js','club-pulse-live-context-patch.js','club-pulse-resilience-patch.js','club-pulse-data-policy-patch.js','club-pulse-provider-reliability-patch.js','club-pulse-small-presentation-patch.js','club-pulse-wave2-themes-patch.js','club-pulse-wave3-netherlands-patch.js','club-pulse-wave4-lens-patch.js','club-pulse-premier-league-venues-patch.js','club-pulse-form-system-patch.js','club-pulse-small-ui-unification-patch.js','club-pulse-previous-result-patch.js','club-pulse-medium-scale-unification-patch.js','club-pulse-large-presentation-patch.js'
];
const combined=files.map(f=>`\n/* ${f} */\n${fs.readFileSync(path.join(root,f),'utf8')}`).join('\n');
try{
  new Function('args',`return (async()=>{${combined}\n})()`);
  console.log('✓ assembled runtime has no duplicate lexical declarations or syntax errors');
}catch(e){
  console.error(e.stack||e.message||e);
  process.exit(1)
}
console.log('Club Pulse assembled runtime syntax contract PASSED');
