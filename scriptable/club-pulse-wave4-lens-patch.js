// Club Pulse Wave 4 RC Lens presentation v1.
// Adds Lens theme, localization, Small alias and venue coverage.
// No club-specific renderer branches.

function cpLensTheme(key,c){
  return{
    key,
    text:c.text||'#F8FAFC',cardText:c.cardText||c.text||'#F8FAFC',
    muted:c.muted||'#E6EAF0',cardMuted:c.cardMuted||c.muted||'#E6EAF0',
    accent:c.accent||'#F7C600',accentSoft:c.accentSoft||'#FFE477',headerAccent:c.headerAccent||'#E6EAF0',
    surface:'#070A10',glow:c.cardGlow,panel:'#0D1420',panelDeep:'#080D17',
    cardSurface:c.cardSurface,cardPanel:c.cardPanel,cardGlow:c.cardGlow,
    border:c.cardBorder,cardBorder:c.cardBorder,sideBorder:c.sideBorder||c.accent||'#F7C600'
  }
}

Object.assign(CP_CLUB_THEME_REGISTRY,{
  546:cpLensTheme('lens',{
    cardSurface:'#4B0810',cardPanel:'#8F101C',cardGlow:'#C91A25',cardBorder:'#F7C600',accent:'#F7C600',accentSoft:'#FFE477'
  })
});

if(typeof CP_STANDARD_TEAM_IDS!=='undefined')CP_STANDARD_TEAM_IDS.add(CP_WAVE4_LENS_TEAM_ID);
if(typeof CP_PREMIUM_GENERIC_KEYS!=='undefined')CP_PREMIUM_GENERIC_KEYS.add('lens');

if(typeof JP!=='undefined')Object.assign(JP,{
  'Racing Club de Lens':'ランス','RC Lens':'ランス','RC Lens 1906':'ランス'
});
if(typeof CP_TEAM_DISPLAY_NAMES!=='undefined')Object.assign(CP_TEAM_DISPLAY_NAMES,{
  'Racing Club de Lens':'ランス','RC Lens':'ランス','RC Lens 1906':'ランス'
});
if(typeof CP_SP_SMALL_ALIASES!=='undefined')Object.assign(CP_SP_SMALL_ALIASES,{
  'ランス':'ランス'
});
if(typeof CP_VENUE_DISPLAY_NAMES!=='undefined')Object.assign(CP_VENUE_DISPLAY_NAMES,{
  'Stade Bollaert-Delelis':'スタッド・ボラール＝ドゥルリス',
  'Stade Bollaert-Delelis, Lens':'スタッド・ボラール＝ドゥルリス',
  'Stade Bollaert-Delelis Lens':'スタッド・ボラール＝ドゥルリス'
});
if(typeof CP_HOME_VENUE_BY_TEAM!=='undefined')Object.assign(CP_HOME_VENUE_BY_TEAM,{
  'ランス':'スタッド・ボラール＝ドゥルリス'
});
