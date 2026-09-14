// Club Pulse multi-club registry extension.
// Injected before parameter resolution so new clubs are selectable without editing the frozen core.

CLUBS.barcelona={
  id:'barcelona',team:81,comp:'PD',
  name:'バルセロナ',short:'BAR',jp:'バルサ',badge:'FCB',league:'ラ・リーガ',
  p:'#A50044',s:'#004D98',a:'#EDBB00',
  venue:'カンプ・ノウ',liveSearch:'Barcelona'
};

CLUBS.realmadrid={
  id:'realmadrid',team:86,comp:'PD',
  name:'レアル・マドリード',short:'RMA',jp:'レアル',badge:'RMA',league:'ラ・リーガ',
  p:'#F8F7F2',s:'#00529F',a:'#FEBE10',
  venue:'サンティアゴ・ベルナベウ',liveSearch:'Real Madrid'
};

Object.assign(ALIASES,{
  barca:'barcelona',fcb:'barcelona',barcelonafc:'barcelona',
  real:'realmadrid',rma:'realmadrid',madrid:'realmadrid','real-madrid':'realmadrid',realmadridcf:'realmadrid'
});

// Crest artwork has different transparent padding by provider.
// Keep scaling data-driven rather than special-casing renderers.
Object.assign(CREST_SCALE,{81:.96,86:1.06});

// Japanese UI should not mix English/Spanish opponent labels where a stable mapping is known.
Object.assign(JP,{
  'Málaga CF':'マラガ','Málaga':'マラガ','Malaga CF':'マラガ','Malaga':'マラガ'
});

Object.assign(VEN,{
  'Camp Nou':'カンプ・ノウ',
  'Spotify Camp Nou':'カンプ・ノウ',
  'Estadi Olímpic Lluís Companys':'エスタディ・オリンピック・リュイス・コンパニス',
  'Estadio Santiago Bernabéu':'サンティアゴ・ベルナベウ',
  'Santiago Bernabéu':'サンティアゴ・ベルナベウ',
  'Santiago Bernabeu':'サンティアゴ・ベルナベウ'
});
