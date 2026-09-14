// Club Pulse Wave 3 Netherlands presentation v2.
// Adds Eredivisie competition presentation plus Ajax / PSV / Feyenoord themes,
// localization, Small aliases and complete 2026-27 Eredivisie venue fallback coverage.
// Venue names are sourced from the current Eredivisie club/ticket registry.
// No club-specific renderer branches.

if(typeof CP_COMP_ASSETS!=='undefined')CP_COMP_ASSETS.DED={id:88};

const CP_NL_BASE_READABLE=competitionReadable,
      CP_NL_BASE_STYLE=competitionStyle,
      CP_NL_BASE_KEY=cpCompetitionKey;

competitionReadable=function(m,small=false){
  const s=String(m?.competitionShort||m?.competitionCode||'').toUpperCase(),f=String(m?.competition||'').toLowerCase();
  if(s==='DED'||s==='ERE'||f.includes('eredivisie')||f.includes('エールディヴィジ'))return small?'ERE':'エールディヴィジ';
  return CP_NL_BASE_READABLE(m,small)
};

competitionStyle=function(label){
  if(label==='エールディヴィジ'||label==='ERE')return{fg:'#F8FAFC',bg:'#172234',bd:'#F36B21'};
  return CP_NL_BASE_STYLE(label)
};

cpCompetitionKey=function(m){
  const s=String(m?.competitionShort||m?.competitionCode||'').toUpperCase(),f=String(m?.competition||'').toLowerCase();
  if(s==='DED'||s==='ERE'||f.includes('eredivisie')||f.includes('エールディヴィジ'))return'DED';
  return CP_NL_BASE_KEY(m)
};

function cpNlTheme(key,c){
  return{
    key,
    text:c.text||'#F8FAFC',cardText:c.cardText||c.text||'#F8FAFC',
    muted:c.muted||'#D8DEE9',cardMuted:c.cardMuted||c.muted||'#D8DEE9',
    accent:c.accent||'#E6EAF0',accentSoft:c.accentSoft||c.accent||'#E6EAF0',headerAccent:c.headerAccent||'#E6EAF0',
    surface:'#070A10',glow:c.cardGlow,panel:'#0D1420',panelDeep:'#080D17',
    cardSurface:c.cardSurface,cardPanel:c.cardPanel,cardGlow:c.cardGlow,
    border:c.cardBorder,cardBorder:c.cardBorder,sideBorder:c.sideBorder||c.accent||'#E6EAF0'
  }
}

Object.assign(CP_CLUB_THEME_REGISTRY,{
  678:cpNlTheme('ajax',{
    cardSurface:'#F4F2EE',cardPanel:'#FFFDFC',cardGlow:'#F3D7DB',cardBorder:'#D2122E',
    cardText:'#111827',cardMuted:'#374151',accent:'#D2122E',accentSoft:'#F0A8B2',headerAccent:'#F2F5F8'
  }),
  674:cpNlTheme('psv',{
    cardSurface:'#570711',cardPanel:'#A70E20',cardGlow:'#ED1B2E',cardBorder:'#F4F5F6',accent:'#F4F5F6'
  }),
  675:cpNlTheme('feyenoord',{
    cardSurface:'#090A0C',cardPanel:'#321419',cardGlow:'#C91623',cardBorder:'#F2F2F2',accent:'#F2F2F2'
  })
});

if(typeof CP_STANDARD_TEAM_IDS!=='undefined')for(const id of CP_WAVE3_NL_TEAM_IDS)CP_STANDARD_TEAM_IDS.add(id);
if(typeof CP_PREMIUM_GENERIC_KEYS!=='undefined')for(const id of CP_WAVE3_NL_TEAM_IDS){const t=CP_CLUB_THEME_REGISTRY[id];if(t?.key)CP_PREMIUM_GENERIC_KEYS.add(t.key)}

if(typeof JP!=='undefined')Object.assign(JP,{
  'AFC Ajax':'アヤックス','Ajax':'アヤックス','Ajax Amsterdam':'アヤックス',
  'PSV':'PSV','PSV Eindhoven':'PSV','PSV Eindhoven FC':'PSV',
  'Feyenoord Rotterdam':'フェイエノールト','Feyenoord':'フェイエノールト',
  'AZ':'AZ','AZ Alkmaar':'AZ','Alkmaar Zaanstreek':'AZ',
  'FC Twente':'トゥウェンテ','FC Twente 1965':'トゥウェンテ',
  'FC Utrecht':'ユトレヒト','Go Ahead Eagles':'ゴー・アヘッド',
  'Fortuna Sittard':'フォルトゥナ','NEC':'NEC','NEC Nijmegen':'NEC','N.E.C. Nijmegen':'NEC','N.E.C.':'NEC',
  'SBV Excelsior':'エクセルシオール','Excelsior':'エクセルシオール','Excelsior Rotterdam':'エクセルシオール',
  'FC Groningen':'フローニンゲン','SC Heerenveen':'ヘーレンフェーン','sc Heerenveen':'ヘーレンフェーン',
  'Sparta Rotterdam':'スパルタ','PEC Zwolle':'ズウォレ',
  'SC Telstar':'テルスター','Telstar 1963':'テルスター','Telstar':'テルスター',
  'Willem II Tilburg':'ヴィレムII','Willem II':'ヴィレムII',
  'ADO Den Haag':'ADO','SC Cambuur':'カンブール'
});

if(typeof CP_TEAM_DISPLAY_NAMES!=='undefined')Object.assign(CP_TEAM_DISPLAY_NAMES,{
  'AFC Ajax':'アヤックス','Ajax':'アヤックス','Ajax Amsterdam':'アヤックス',
  'PSV Eindhoven':'PSV','PSV':'PSV',
  'Feyenoord Rotterdam':'フェイエノールト','Feyenoord':'フェイエノールト',
  'AZ Alkmaar':'AZ','AZ':'AZ','FC Twente':'トゥウェンテ','FC Utrecht':'ユトレヒト',
  'Go Ahead Eagles':'ゴー・アヘッド','Fortuna Sittard':'フォルトゥナ','NEC Nijmegen':'NEC','N.E.C. Nijmegen':'NEC','N.E.C.':'NEC','NEC':'NEC',
  'SBV Excelsior':'エクセルシオール','Excelsior Rotterdam':'エクセルシオール','FC Groningen':'フローニンゲン','SC Heerenveen':'ヘーレンフェーン','sc Heerenveen':'ヘーレンフェーン',
  'Sparta Rotterdam':'スパルタ','PEC Zwolle':'ズウォレ','SC Telstar':'テルスター','Telstar 1963':'テルスター','Telstar':'テルスター',
  'Willem II Tilburg':'ヴィレムII','ADO Den Haag':'ADO','SC Cambuur':'カンブール'
});

if(typeof CP_SP_SMALL_ALIASES!=='undefined')Object.assign(CP_SP_SMALL_ALIASES,{
  'アヤックス':'アヤックス','PSV':'PSV','フェイエノールト':'フェイエ',
  'エクセルシオール':'EXC','フローニンゲン':'GRO','ヘーレンフェーン':'HEE',
  'ゴー・アヘッド':'GAE','フォルトゥナ':'FOR','トゥウェンテ':'TWE','ユトレヒト':'UTR'
});

if(typeof CP_VENUE_DISPLAY_NAMES!=='undefined')Object.assign(CP_VENUE_DISPLAY_NAMES,{
  'WerkTalent Stadion':'WerkTalent Stadion',
  'Johan Cruijff ArenA':'ヨハン・クライフ・アレナ','Johan Cruijff Arena':'ヨハン・クライフ・アレナ',
  'AFAS Stadion':'AFAS Stadion',
  'Stadion Woudestein':'Stadion Woudestein','Van Donge & De Roo Stadion':'Stadion Woudestein',
  'De Euroborg':'De Euroborg','Euroborg':'De Euroborg',
  'De Grolsch Veste':'De Grolsch Veste','Grolsch Veste':'De Grolsch Veste',
  'Stadion Galgenwaard':'Stadion Galgenwaard','Galgenwaard Stadium':'Stadion Galgenwaard',
  'Stadion Feijenoord':'デ・カイプ','De Kuip':'デ・カイプ',
  'Fortuna Sittard Stadion':'Fortuna Sittard Stadion',
  'De Adelaarshorst':'De Adelaarshorst','Adelaarshorst':'De Adelaarshorst',
  'Goffertstadion':'Goffertstadion','Stadion de Goffert':'Goffertstadion',
  'MAC³PARK Stadion':'MAC³PARK Stadion','MAC3PARK Stadion':'MAC³PARK Stadion',
  'Philips Stadion':'フィリップス・スタディオン','Philips Stadium':'フィリップス・スタディオン',
  'Kooi Stadion':'Kooi Stadion','Cambuur Stadion':'Kooi Stadion',
  'Abe Lenstra Stadion':'Abe Lenstra Stadion',
  'Spartastadion Het Kasteel':'Spartastadion Het Kasteel','Sparta-Stadion Het Kasteel':'Spartastadion Het Kasteel','Het Kasteel':'Spartastadion Het Kasteel',
  'BUKO Stadion':'BUKO Stadion',
  'Koning Willem II Stadion':'Koning Willem II Stadion'
});

if(typeof CP_HOME_VENUE_BY_TEAM!=='undefined')Object.assign(CP_HOME_VENUE_BY_TEAM,{
  'ADO':'WerkTalent Stadion',
  'アヤックス':'ヨハン・クライフ・アレナ',
  'AZ':'AFAS Stadion',
  'エクセルシオール':'Stadion Woudestein',
  'フローニンゲン':'De Euroborg',
  'トゥウェンテ':'De Grolsch Veste',
  'ユトレヒト':'Stadion Galgenwaard',
  'フェイエノールト':'デ・カイプ',
  'フォルトゥナ':'Fortuna Sittard Stadion',
  'ゴー・アヘッド':'De Adelaarshorst',
  'NEC':'Goffertstadion',
  'ズウォレ':'MAC³PARK Stadion',
  'PSV':'フィリップス・スタディオン',
  'カンブール':'Kooi Stadion',
  'ヘーレンフェーン':'Abe Lenstra Stadion',
  'スパルタ':'Spartastadion Het Kasteel',
  'テルスター':'BUKO Stadion',
  'ヴィレムII':'Koning Willem II Stadion'
});
