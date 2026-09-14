// Club Pulse Wave 2 club registry v1.
// Expands the supported Big Five club set from 11 to 40 without adding club-specific renderers.
// Injected before core parameter resolution.

const CP_WAVE2_TEAM_IDS=[61,73,67,58,62,397,563,78,77,92,94,559,90,3,721,19,10,18,109,113,100,110,102,99,516,548,523,521,522];

Object.assign(CLUBS,{
  // Premier League
  chelsea:{id:'chelsea',team:61,comp:'PL',name:'チェルシー',short:'CHE',jp:'チェルシー',badge:'CHE',league:'プレミアリーグ',p:'#034694',s:'#001B5B',a:'#DBA111',venue:'スタンフォード・ブリッジ',liveSearch:'Chelsea'},
  tottenham:{id:'tottenham',team:73,comp:'PL',name:'トッテナム・ホットスパー',short:'TOT',jp:'トッテナム',badge:'TOT',league:'プレミアリーグ',p:'#132257',s:'#FFFFFF',a:'#C5D2E8',venue:'トッテナム・ホットスパー・スタジアム',liveSearch:'Tottenham Hotspur'},
  newcastle:{id:'newcastle',team:67,comp:'PL',name:'ニューカッスル・ユナイテッド',short:'NEW',jp:'ニューカッスル',badge:'NEW',league:'プレミアリーグ',p:'#111111',s:'#FFFFFF',a:'#41B6E6',venue:'セント・ジェームズ・パーク',liveSearch:'Newcastle United'},
  astonvilla:{id:'astonvilla',team:58,comp:'PL',name:'アストン・ヴィラ',short:'AVL',jp:'アストン・ヴィラ',badge:'AVL',league:'プレミアリーグ',p:'#670E36',s:'#95BFE5',a:'#FEE505',venue:'ヴィラ・パーク',liveSearch:'Aston Villa'},
  everton:{id:'everton',team:62,comp:'PL',name:'エヴァートン',short:'EVE',jp:'エヴァートン',badge:'EVE',league:'プレミアリーグ',p:'#003399',s:'#001B5E',a:'#FFFFFF',venue:'ヒル・ディッキンソン・スタジアム',liveSearch:'Everton'},
  brighton:{id:'brighton',team:397,comp:'PL',name:'ブライトン・アンド・ホーヴ・アルビオン',short:'BHA',jp:'ブライトン',badge:'BHA',league:'プレミアリーグ',p:'#0057B8',s:'#FFFFFF',a:'#FFCD00',venue:'アメックス・スタジアム',liveSearch:'Brighton'},
  westham:{id:'westham',team:563,comp:'PL',name:'ウェストハム・ユナイテッド',short:'WHU',jp:'ウェストハム',badge:'WHU',league:'プレミアリーグ',p:'#7A263A',s:'#1BB1E7',a:'#F3D459',venue:'ロンドン・スタジアム',liveSearch:'West Ham United'},

  // LaLiga
  atletico:{id:'atletico',team:78,comp:'PD',name:'アトレティコ・マドリード',short:'ATL',jp:'アトレティコ',badge:'ATL',league:'ラ・リーガ',p:'#C8102E',s:'#1B2A4E',a:'#FFFFFF',venue:'メトロポリターノ',liveSearch:'Atletico Madrid'},
  athletic:{id:'athletic',team:77,comp:'PD',name:'アスレティック・クラブ',short:'ATH',jp:'アスレティック',badge:'ATH',league:'ラ・リーガ',p:'#EE2523',s:'#FFFFFF',a:'#111111',venue:'サン・マメス',liveSearch:'Athletic Club'},
  realsociedad:{id:'realsociedad',team:92,comp:'PD',name:'レアル・ソシエダ',short:'RSO',jp:'レアル・ソシエダ',badge:'RSO',league:'ラ・リーガ',p:'#0067B1',s:'#FFFFFF',a:'#D8B44A',venue:'レアレ・アレーナ',liveSearch:'Real Sociedad'},
  villarreal:{id:'villarreal',team:94,comp:'PD',name:'ビジャレアル',short:'VIL',jp:'ビジャレアル',badge:'VIL',league:'ラ・リーガ',p:'#F4D500',s:'#005187',a:'#FFFFFF',venue:'エスタディオ・デ・ラ・セラミカ',liveSearch:'Villarreal'},
  sevilla:{id:'sevilla',team:559,comp:'PD',name:'セビージャ',short:'SEV',jp:'セビージャ',badge:'SEV',league:'ラ・リーガ',p:'#D71920',s:'#FFFFFF',a:'#111111',venue:'ラモン・サンチェス・ピスフアン',liveSearch:'Sevilla'},
  betis:{id:'betis',team:90,comp:'PD',name:'レアル・ベティス',short:'BET',jp:'ベティス',badge:'BET',league:'ラ・リーガ',p:'#00954C',s:'#FFFFFF',a:'#111111',venue:'ラ・カルトゥハ',liveSearch:'Real Betis'},

  // Bundesliga
  leverkusen:{id:'leverkusen',team:3,comp:'BL1',name:'バイヤー・レヴァークーゼン',short:'B04',jp:'レヴァークーゼン',badge:'B04',league:'ブンデスリーガ',p:'#E32221',s:'#111111',a:'#FFFFFF',venue:'バイアレーナ',liveSearch:'Bayer Leverkusen'},
  leipzig:{id:'leipzig',team:721,comp:'BL1',name:'RBライプツィヒ',short:'RBL',jp:'ライプツィヒ',badge:'RBL',league:'ブンデスリーガ',p:'#DD0741',s:'#001E4F',a:'#FFFFFF',venue:'レッドブル・アレーナ',liveSearch:'RB Leipzig'},
  frankfurt:{id:'frankfurt',team:19,comp:'BL1',name:'アイントラハト・フランクフルト',short:'SGE',jp:'フランクフルト',badge:'SGE',league:'ブンデスリーガ',p:'#E1000F',s:'#111111',a:'#FFFFFF',venue:'ドイチェ・バンク・パルク',liveSearch:'Eintracht Frankfurt'},
  stuttgart:{id:'stuttgart',team:10,comp:'BL1',name:'VfBシュトゥットガルト',short:'VFB',jp:'シュトゥットガルト',badge:'VFB',league:'ブンデスリーガ',p:'#E32219',s:'#FFFFFF',a:'#111111',venue:'MHPアレーナ',liveSearch:'VfB Stuttgart'},
  gladbach:{id:'gladbach',team:18,comp:'BL1',name:'ボルシア・メンヒェングラートバッハ',short:'BMG',jp:'ボルシアMG',badge:'BMG',league:'ブンデスリーガ',p:'#111111',s:'#FFFFFF',a:'#00A651',venue:'ボルシア・パルク',liveSearch:'Borussia Monchengladbach'},

  // Serie A
  juventus:{id:'juventus',team:109,comp:'SA',name:'ユベントス',short:'JUV',jp:'ユベントス',badge:'JUV',league:'セリエA',p:'#111111',s:'#FFFFFF',a:'#D4AF37',venue:'アリアンツ・スタジアム',liveSearch:'Juventus'},
  napoli:{id:'napoli',team:113,comp:'SA',name:'SSCナポリ',short:'NAP',jp:'ナポリ',badge:'NAP',league:'セリエA',p:'#12A0D3',s:'#00579B',a:'#FFFFFF',venue:'スタディオ・ディエゴ・アルマンド・マラドーナ',liveSearch:'Napoli'},
  roma:{id:'roma',team:100,comp:'SA',name:'ASローマ',short:'ROM',jp:'ローマ',badge:'ROM',league:'セリエA',p:'#8E1F2F',s:'#F0BC42',a:'#FFFFFF',venue:'スタディオ・オリンピコ',liveSearch:'Roma'},
  lazio:{id:'lazio',team:110,comp:'SA',name:'SSラツィオ',short:'LAZ',jp:'ラツィオ',badge:'LAZ',league:'セリエA',p:'#87D8F7',s:'#FFFFFF',a:'#1F3C88',venue:'スタディオ・オリンピコ',liveSearch:'Lazio'},
  atalanta:{id:'atalanta',team:102,comp:'SA',name:'アタランタ',short:'ATA',jp:'アタランタ',badge:'ATA',league:'セリエA',p:'#0057B8',s:'#111111',a:'#FFFFFF',venue:'ニュー・バランス・アリーナ',liveSearch:'Atalanta'},
  fiorentina:{id:'fiorentina',team:99,comp:'SA',name:'ACFフィオレンティーナ',short:'FIO',jp:'フィオレンティーナ',badge:'FIO',league:'セリエA',p:'#5B2A86',s:'#FFFFFF',a:'#D7B03A',venue:'スタディオ・アルテミオ・フランキ',liveSearch:'Fiorentina'},

  // Ligue 1
  marseille:{id:'marseille',team:516,comp:'FL1',name:'オリンピック・マルセイユ',short:'MAR',jp:'マルセイユ',badge:'MAR',league:'リーグ・アン',p:'#00AEEF',s:'#FFFFFF',a:'#1A73A8',venue:'オレンジ・ヴェロドローム',liveSearch:'Marseille'},
  monaco:{id:'monaco',team:548,comp:'FL1',name:'ASモナコ',short:'ASM',jp:'モナコ',badge:'ASM',league:'リーグ・アン',p:'#E31B23',s:'#FFFFFF',a:'#D4AF37',venue:'スタッド・ルイ・ドゥ',liveSearch:'Monaco'},
  lyon:{id:'lyon',team:523,comp:'FL1',name:'オリンピック・リヨン',short:'OL',jp:'リヨン',badge:'OL',league:'リーグ・アン',p:'#1F3C88',s:'#D71920',a:'#FFFFFF',venue:'グルパマ・スタジアム',liveSearch:'Lyon'},
  lille:{id:'lille',team:521,comp:'FL1',name:'LOSCリール',short:'LIL',jp:'リール',badge:'LIL',league:'リーグ・アン',p:'#D71920',s:'#1F3C88',a:'#FFFFFF',venue:'デカトロン・アレーナ',liveSearch:'Lille'},
  nice:{id:'nice',team:522,comp:'FL1',name:'OGCニース',short:'NIC',jp:'ニース',badge:'NIC',league:'リーグ・アン',p:'#D71920',s:'#111111',a:'#FFFFFF',venue:'アリアンツ・リヴィエラ',liveSearch:'Nice'}
});

Object.assign(ALIASES,{
  chelsea:'chelsea',che:'chelsea',cfc:'chelsea',
  tottenham:'tottenham',spurs:'tottenham',tot:'tottenham',
  newcastle:'newcastle',nufc:'newcastle',new:'newcastle',
  astonvilla:'astonvilla','aston-villa':'astonvilla',villa:'astonvilla',avl:'astonvilla',
  everton:'everton',eve:'everton',
  brighton:'brighton',bha:'brighton',
  westham:'westham','west-ham':'westham',whu:'westham',
  atletico:'atletico',atleti:'atletico','atletico-madrid':'atletico',atl:'atletico',
  athletic:'athletic','athletic-club':'athletic',ath:'athletic',
  realsociedad:'realsociedad','real-sociedad':'realsociedad',sociedad:'realsociedad',rso:'realsociedad',
  villarreal:'villarreal',vil:'villarreal',
  sevilla:'sevilla',sev:'sevilla',
  betis:'betis','real-betis':'betis',bet:'betis',
  leverkusen:'leverkusen','bayer-leverkusen':'leverkusen',b04:'leverkusen',
  leipzig:'leipzig','rb-leipzig':'leipzig',rbl:'leipzig',
  frankfurt:'frankfurt','eintracht-frankfurt':'frankfurt',sge:'frankfurt',
  stuttgart:'stuttgart','vfb-stuttgart':'stuttgart',vfb:'stuttgart',
  gladbach:'gladbach','borussia-monchengladbach':'gladbach',bmg:'gladbach',
  juventus:'juventus',juve:'juventus',juv:'juventus',
  napoli:'napoli',nap:'napoli',
  roma:'roma','as-roma':'roma',rom:'roma',
  lazio:'lazio',laz:'lazio',
  atalanta:'atalanta',ata:'atalanta',
  fiorentina:'fiorentina',fio:'fiorentina',
  marseille:'marseille',om:'marseille',mar:'marseille',
  monaco:'monaco','as-monaco':'monaco',asm:'monaco',
  lyon:'lyon','olympique-lyon':'lyon',ol:'lyon',
  lille:'lille',losc:'lille',lil:'lille',
  nice:'nice','ogc-nice':'nice',nic:'nice'
});

Object.assign(CREST_SCALE,{
  61:1.00,73:1.00,67:1.00,58:1.00,62:1.00,397:1.00,563:1.00,
  78:1.00,77:1.00,92:1.00,94:1.00,559:1.00,90:1.00,
  3:1.00,721:1.00,19:1.00,10:1.00,18:1.00,
  109:1.00,113:1.00,100:1.00,110:1.00,102:1.00,99:1.00,
  516:1.00,548:1.00,523:1.00,521:1.00,522:1.00
});
