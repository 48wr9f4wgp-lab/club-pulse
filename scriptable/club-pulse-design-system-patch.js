// Club Pulse canonical design system v7.
// Visual source of truth for the eleven-club family. Existing club surfaces remain frozen.
// v7 adds one shared metadata typography contract and separates Dortmund shell-header contrast from its yellow-card text.

const CP_DESIGN_TOKENS={
  shell:{
    surface:'#080C14',panel:'#0D1420',glow:'#111A28',rail:'#080D17',
    text:'#F8FAFC',muted:'#B8C2D1',border:'#465164',edge:'#9AA6B8'
  },
  card:{
    radiusMedium:16,radiusSmall:14,
    borderMedium:.85,borderSmall:.75,
    borderAlphaMedium:.72,borderAlphaSmall:.66
  },
  pill:{
    medium:{v:2.5,h:7,font:7.2,r:9,logoBox:24,logoSize:19,gap:5,sideV:6.2},
    small:{v:2.0,h:5,font:7.3,r:9,logoBox:19,logoSize:15,gap:4,sideV:4.8}
  },
  typography:{
    metaMedium:{font:9.2,minScale:.88},
    metaSmall:{font:9.0,minScale:.90}
  }
};

const CP_THEME_DEFINITIONS={
  66:{
    key:'manutd',tone:'vivid-red',
    text:'#FFF8F2',muted:'#D8CBC8',accent:'#D6B45A',accentSoft:'#F0D58A',
    surface:'#07080A',panel:'#13090C',glow:'#DA291C',panelDeep:'#080D17',
    cardSurface:'#5B0A0E',cardPanel:'#B5121B',cardGlow:'#DA291C',
    border:'#A82A31',cardBorder:'#D0AE55',sideBorder:'#D6B45A'
  },
  81:{
    key:'barcelona',tone:'royal-purple',
    text:'#FFF8F1',muted:'#D7D0E2',accent:'#D7B04A',accentSoft:'#EFD47D',
    surface:'#070A12',panel:'#0C1427',glow:'#421A68',panelDeep:'#080D17',
    cardSurface:'#160B34',cardPanel:'#32145F',cardGlow:'#452078',
    border:'#65449A',cardBorder:'#8064AA',sideBorder:'#D7B04A'
  },
  86:{
    key:'realmadrid',tone:'pearl-white',
    text:'#FBFCFF',muted:'#C9D1DE',accent:'#D8B557',accentSoft:'#EFD78F',
    surface:'#070A10',panel:'#0A172A',glow:'#123D78',panelDeep:'#080D17',
    cardSurface:'#FFFDF8',cardPanel:'#F3F0E9',cardGlow:'#FFFFFF',cardPearl:'#E9E3D6',
    cardText:'#142443',cardMuted:'#5E6B81',cardAccent:'#2453A4',
    border:'#D8B557',cardBorder:'#C7A653',sideBorder:'#D8B557'
  },
  5:{
    key:'bayern',tone:'crest-red-blue-white',
    text:'#FFF9FA',muted:'#F0DDE1',accent:'#FFFFFF',accentSoft:'#D9EEFF',
    surface:'#07090D',panel:'#0E1420',glow:'#B3122E',panelDeep:'#080D17',
    cardSurface:'#8C0016',cardPanel:'#C8102E',cardGlow:'#E21B42',
    border:'#0073C9',cardBorder:'#2D86D3',sideBorder:'#2D86D3'
  },
  524:{
    key:'psg',tone:'paris-royal-blue',
    text:'#F8FBFF',muted:'#CED9E8',accent:'#E33D45',accentSoft:'#F6F7FA',
    surface:'#060B14',panel:'#0A1527',glow:'#0B3E78',panelDeep:'#080D17',
    cardSurface:'#04172F',cardPanel:'#082A55',cardGlow:'#0A3C73',
    border:'#244F83',cardBorder:'#5A78A2',sideBorder:'#F6F7FA'
  },
  98:{
    key:'milan',tone:'rossoneri-gunmetal',
    text:'#FAFAFA',muted:'#E1DADC',accent:'#E22533',accentSoft:'#F3F3F3',
    surface:'#080708',panel:'#181619',glow:'#6B0B15',panelDeep:'#080D17',
    cardSurface:'#7A0B16',cardPanel:'#342124',cardGlow:'#62666D',
    border:'#8E2832',cardBorder:'#B23A45',sideBorder:'#D5303C'
  },
  65:{
    key:'mancity',tone:'sky-blue',
    text:'#F8FCFF',muted:'#E2EFF6',accent:'#C8F0FF',accentSoft:'#F0FBFF',
    surface:'#071018',panel:'#0C1922',glow:'#3B91B7',panelDeep:'#080D17',
    cardSurface:'#18516F',cardPanel:'#2F7FA4',cardGlow:'#56A8C9',
    border:'#5AA6C8',cardBorder:'#A7DDF0',sideBorder:'#F0FBFF'
  },
  57:{
    key:'arsenal',tone:'arsenal-red-ivory-navy',
    text:'#FFF9F4',muted:'#E7DDE0',accent:'#F2E7D5',accentSoft:'#FFF6E8',
    surface:'#090A0E',panel:'#101827',glow:'#A80F2A',panelDeep:'#080D17',
    cardSurface:'#152A4A',cardPanel:'#A80E2C',cardGlow:'#D7193F',
    border:'#243B5A',cardBorder:'#F0E5D2',sideBorder:'#F2E7D5'
  },
  64:{
    key:'liverpool',tone:'deep-scarlet-teal',
    text:'#FFF8F6',muted:'#E4D9DA',accent:'#00B2A9',accentSoft:'#A7E5DC',
    surface:'#090708',panel:'#180B10',glow:'#650A20',panelDeep:'#080D17',
    cardSurface:'#430713',cardPanel:'#740A21',cardGlow:'#A30B2B',
    border:'#542333',cardBorder:'#00A79F',sideBorder:'#00B2A9'
  },
  108:{
    key:'inter',tone:'nerazzurri-electric-blue',
    text:'#F7FAFF',muted:'#CCD5E2',accent:'#C9A85E',accentSoft:'#E9D9A6',
    surface:'#05070B',panel:'#07101F',glow:'#004AB8',panelDeep:'#080D17',
    cardSurface:'#03060B',cardPanel:'#07152B',cardGlow:'#0057B8',
    border:'#163D78',cardBorder:'#2E70D1',sideBorder:'#C9A85E'
  },
  4:{
    key:'dortmund',tone:'signal-yellow-black',
    text:'#121212',muted:'#343434',accent:'#111111',accentSoft:'#2A2A2A',headerAccent:'#E6EAF0',
    surface:'#080808',panel:'#111111',glow:'#D8BD00',panelDeep:'#080D17',
    cardSurface:'#C6A900',cardPanel:'#E3C500',cardGlow:'#FDE100',
    cardText:'#111111',cardMuted:'#323232',cardAccent:'#111111',
    border:'#2C2C2C',cardBorder:'#181818',sideBorder:'#111111'
  }
};

if(typeof CP_COMMON_SHELL==='object')Object.assign(CP_COMMON_SHELL,CP_DESIGN_TOKENS.shell);
for(const [id,definition] of Object.entries(CP_THEME_DEFINITIONS)){
  const target=CP_CLUB_THEME_REGISTRY?.[id]||(CP_CLUB_THEME_REGISTRY[id]={});
  Object.assign(target,definition)
}

function cpDesignTheme(teamId=club?.team){return CP_THEME_DEFINITIONS[teamId]||null}
function cpDesignToken(group,key,fallback=null){return CP_DESIGN_TOKENS?.[group]?.[key]??fallback}
function cpMetaText(parent,value,color,small=false){
  const q=small?CP_DESIGN_TOKENS.typography.metaSmall:CP_DESIGN_TOKENS.typography.metaMedium;
  const t=parent.addText(String(value||''));
  t.font=Font.semiboldSystemFont(q.font);
  t.textColor=C(color||CP_DESIGN_TOKENS.shell.text);
  t.lineLimit=1;
  t.minimumScaleFactor=q.minScale;
  t.centerAlignText();
  return t
}
