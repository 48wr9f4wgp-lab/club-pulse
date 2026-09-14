// Club Pulse extra club registry v3.
// Injected before core parameter resolution. Adds the expanded eight-club batch while leaving the frozen core untouched.

CLUBS.bayern={
  id:'bayern',team:5,comp:'BL1',
  name:'バイエルン・ミュンヘン',short:'FCB',jp:'バイエルン',badge:'FCB',league:'ブンデスリーガ',
  p:'#DC052D',s:'#8B0B1E',a:'#FFFFFF',
  venue:'アリアンツ・アレーナ',liveSearch:'Bayern Munich'
};

CLUBS.psg={
  id:'psg',team:524,comp:'FL1',
  name:'パリ・サンジェルマン',short:'PSG',jp:'PSG',badge:'PSG',league:'リーグ・アン',
  p:'#001E62',s:'#004170',a:'#DA291C',
  venue:'パルク・デ・プランス',liveSearch:'Paris Saint Germain'
};

CLUBS.milan={
  id:'milan',team:98,comp:'SA',
  name:'ACミラン',short:'MIL',jp:'ミラン',badge:'MIL',league:'セリエA',
  p:'#111111',s:'#8A1018',a:'#F2F2F2',
  venue:'サン・シーロ',liveSearch:'AC Milan'
};

CLUBS.mancity={
  id:'mancity',team:65,comp:'PL',
  name:'マンチェスター・シティ',short:'MCI',jp:'マンC',badge:'MCI',league:'プレミアリーグ',
  p:'#6CABDD',s:'#1C2C5B',a:'#FFFFFF',
  venue:'エティハド・スタジアム',liveSearch:'Manchester City'
};

CLUBS.arsenal={
  id:'arsenal',team:57,comp:'PL',
  name:'アーセナル',short:'ARS',jp:'アーセナル',badge:'ARS',league:'プレミアリーグ',
  p:'#EF0107',s:'#172B4D',a:'#F2E7D5',
  venue:'エミレーツ・スタジアム',liveSearch:'Arsenal'
};

CLUBS.liverpool={
  id:'liverpool',team:64,comp:'PL',
  name:'リヴァプール',short:'LIV',jp:'リヴァプール',badge:'LIV',league:'プレミアリーグ',
  p:'#C8102E',s:'#6A0D1D',a:'#D9F2EE',
  venue:'アンフィールド',liveSearch:'Liverpool'
};

CLUBS.inter={
  id:'inter',team:108,comp:'SA',
  name:'インテル',short:'INT',jp:'インテル',badge:'INT',league:'セリエA',
  p:'#0057B8',s:'#050A14',a:'#7FA7E6',
  venue:'サン・シーロ',liveSearch:'Internazionale'
};

CLUBS.dortmund={
  id:'dortmund',team:4,comp:'BL1',
  name:'ボルシア・ドルトムント',short:'BVB',jp:'ドルトムント',badge:'BVB',league:'ブンデスリーガ',
  p:'#FDE100',s:'#111111',a:'#FDE100',
  venue:'ジグナル・イドゥナ・パルク',liveSearch:'Borussia Dortmund'
};

Object.assign(ALIASES,{
  bayern:'bayern',fcbayern:'bayern','bayern-munich':'bayern',munich:'bayern',
  psg:'psg',paris:'psg','paris-saint-germain':'psg',
  milan:'milan',acmilan:'milan','ac-milan':'milan',
  city:'mancity',mancity:'mancity',mci:'mancity','man-city':'mancity',
  arsenal:'arsenal',ars:'arsenal','the-arsenal':'arsenal',
  liverpool:'liverpool',liv:'liverpool',lfc:'liverpool',
  inter:'inter',internazionale:'inter','inter-milan':'inter',int:'inter',
  dortmund:'dortmund',bvb:'dortmund','borussia-dortmund':'dortmund'
});

Object.assign(CREST_SCALE,{5:1.02,524:1.00,98:1.00,65:1.02,57:1.00,64:1.00,108:1.00,4:1.01});
Object.assign(COMP,{BL1:'ブンデスリーガ',FL1:'リーグ・アン',SA:'セリエA'});

Object.assign(JP,{
  'FC Bayern München':'バイエルン・ミュンヘン','Bayern München':'バイエルン・ミュンヘン','Bayern Munich':'バイエルン・ミュンヘン',
  'Paris Saint-Germain FC':'パリ・サンジェルマン','Paris Saint-Germain':'パリ・サンジェルマン','Paris SG':'パリ・サンジェルマン',
  'AC Milan':'ACミラン','Milan':'ACミラン',
  'Manchester City FC':'マンチェスター・シティ','Manchester City':'マンチェスター・シティ',
  'Arsenal FC':'アーセナル','Arsenal':'アーセナル',
  'Liverpool FC':'リヴァプール','Liverpool':'リヴァプール',
  'FC Internazionale Milano':'インテル','Internazionale':'インテル','Inter Milan':'インテル','Inter':'インテル',
  'Borussia Dortmund':'ドルトムント','Dortmund':'ドルトムント',
  'AS Monaco FC':'モナコ','AS Monaco':'モナコ','Monaco':'モナコ',
  'Coventry City FC':'コヴェントリー','Coventry City':'コヴェントリー',
  'FC Schalke 04':'シャルケ','Schalke 04':'シャルケ','Schalke':'シャルケ',
  'Juventus FC':'ユベントス','Juventus':'ユベントス'
});

Object.assign(VEN,{
  'Allianz Arena':'アリアンツ・アレーナ',
  'Parc des Princes':'パルク・デ・プランス',
  'Stadio Giuseppe Meazza':'サン・シーロ','San Siro':'サン・シーロ',
  'Etihad Stadium':'エティハド・スタジアム',
  'Emirates Stadium':'エミレーツ・スタジアム',
  'Anfield':'アンフィールド',
  'Signal Iduna Park':'ジグナル・イドゥナ・パルク','SIGNAL IDUNA PARK':'ジグナル・イドゥナ・パルク'
});
