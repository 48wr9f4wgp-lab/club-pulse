// Club Pulse Wave 3 Netherlands club registry v1.
// Adds Ajax, PSV and Feyenoord without club-specific renderer branches.
// Injected before core parameter resolution.

const CP_WAVE3_NL_TEAM_IDS=[678,674,675];

Object.assign(CLUBS,{
  ajax:{
    id:'ajax',team:678,comp:'DED',name:'AFCアヤックス',short:'AJA',jp:'アヤックス',badge:'AJA',league:'エールディヴィジ',
    p:'#D2122E',s:'#F5F5F2',a:'#FFFFFF',venue:'ヨハン・クライフ・アレナ',liveSearch:'Ajax'
  },
  psv:{
    id:'psv',team:674,comp:'DED',name:'PSVアイントホーフェン',short:'PSV',jp:'PSV',badge:'PSV',league:'エールディヴィジ',
    p:'#ED1B2E',s:'#8C0A17',a:'#FFFFFF',venue:'フィリップス・スタディオン',liveSearch:'PSV'
  },
  feyenoord:{
    id:'feyenoord',team:675,comp:'DED',name:'フェイエノールト',short:'FEY',jp:'フェイエノールト',badge:'FEY',league:'エールディヴィジ',
    p:'#D71920',s:'#101114',a:'#FFFFFF',venue:'デ・カイプ',liveSearch:'Feyenoord'
  }
});

Object.assign(ALIASES,{
  aja:'ajax',afcajax:'ajax','ajax-amsterdam':'ajax',
  eindhoven:'psv','psv-eindhoven':'psv',
  fey:'feyenoord','feyenoord-rotterdam':'feyenoord'
});
