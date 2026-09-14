// Club Pulse league expansion v1.
// Adds Bundesliga, Ligue 1 and Serie A labels/styles/logo keys for the new club rollout.

Object.assign(CP_COMP_ASSETS,{BL1:{id:78},FL1:{id:61},SA:{id:135}});

const CP_LEAGUE_BASE_READABLE=competitionReadable,
      CP_LEAGUE_BASE_STYLE=competitionStyle,
      CP_LEAGUE_BASE_KEY=cpCompetitionKey;

competitionReadable=function(m,small=false){
  let s=String(m?.competitionShort||'').toUpperCase(),f=String(m?.competition||'').toLowerCase();
  if(s==='BL1'||f.includes('ブンデス')||f.includes('bundesliga'))return small?'BL':'ブンデスリーガ';
  if(s==='FL1'||f.includes('リーグ・アン')||f.includes('ligue 1'))return small?'Ligue 1':'リーグ・アン';
  if(s==='SA'||f.includes('セリエa')||f.includes('serie a'))return small?'Serie A':'セリエA';
  return CP_LEAGUE_BASE_READABLE(m,small)
};

competitionStyle=function(label){
  if(label==='ブンデスリーガ'||label==='BL')return{fg:'#FFFFFF',bg:'#341217',bd:'#E02B42'};
  if(label==='リーグ・アン'||label==='Ligue 1')return{fg:'#F7FBFF',bg:'#11294A',bd:'#5C91C8'};
  if(label==='セリエA'||label==='Serie A')return{fg:'#F8FAFF',bg:'#14233A',bd:'#6E8EB5'};
  return CP_LEAGUE_BASE_STYLE(label)
};

cpCompetitionKey=function(m){
  let s=String(m?.competitionShort||'').toUpperCase(),f=String(m?.competition||'').toLowerCase();
  if(s==='BL1'||s==='BL'||f.includes('ブンデス')||f.includes('bundesliga'))return'BL1';
  if(s==='FL1'||s==='LIGUE 1'||f.includes('リーグ・アン')||f.includes('ligue 1'))return'FL1';
  if(s==='SA'||s==='SERIE A'||f.includes('セリエa')||f.includes('serie a'))return'SA';
  return CP_LEAGUE_BASE_KEY(m)
};
