// Club Pulse Wave 4 RC Lens registry v1.
// Adds RC Lens without club-specific renderer branches.
// Injected before core parameter resolution.

const CP_WAVE4_LENS_TEAM_ID=546;

Object.assign(CLUBS,{
  lens:{
    id:'lens',team:546,comp:'FL1',name:'RCランス',short:'RCL',jp:'ランス',badge:'RCL',league:'リーグ・アン',
    p:'#D71920',s:'#F7C600',a:'#FFFFFF',venue:'スタッド・ボラール＝ドゥルリス',liveSearch:'Lens'
  }
});

Object.assign(ALIASES,{
  lens:'lens','rc-lens':'lens',rcl:'lens','racing-club-de-lens':'lens'
});
