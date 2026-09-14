// Club Pulse readability guard v8.
// Eleven-club presentation contract: stable Japanese display names, shared token-driven pill dimensions,
// visible competition identity, generic opponent handling, and conservative venue localization/fallback.
// Venue registry baseline: 2026-27 current Premier League / LaLiga / Bundesliga / Serie A / Ligue 1.

const CP_STANDARD_TEAM_IDS=new Set([66,81,86,5,524,98,65,57,64,108,4]);
const CP_RG_BASE_RENDER_TEAM=renderTeamBlock;
const CP_RG_BASE_SMALL_TEAM_NAME=smallTeamName;
const CP_RG_BASE_REAL_TEAM=typeof cpRealTeamBlock==='function'?cpRealTeamBlock:null;
const CP_RG_BASE_BARCA_TEAM=typeof cpBarcelonaTeamBlock==='function'?cpBarcelonaTeamBlock:null;
const CP_RG_BASE_MAP_MATCH=mapMatch;
const CP_VENUE_REGISTRY_SEASON='2026-27';

function cpRgActive(){return CP_STANDARD_TEAM_IDS.has(club?.team)}

// Broad provider/display registry for the five major European leagues.
// It is intentionally inclusive: aliases may remain useful across promotion/relegation seasons.
const CP_TEAM_DISPLAY_NAMES={
  // England
  'Manchester United FC':'マンU','Manchester United':'マンU','マンチェスター・ユナイテッド':'マンU',
  'Manchester City FC':'マンC','Manchester City':'マンC','マンチェスター・シティ':'マンC',
  'Arsenal FC':'アーセナル','Arsenal':'アーセナル','アーセナル':'アーセナル',
  'Liverpool FC':'リヴァプール','Liverpool':'リヴァプール','リバプール':'リヴァプール','リヴァプール':'リヴァプール',
  'Aston Villa FC':'アストン・ヴィラ','Aston Villa':'アストン・ヴィラ',
  'AFC Bournemouth':'ボーンマス','Bournemouth':'ボーンマス',
  'Brentford FC':'ブレントフォード','Brentford':'ブレントフォード',
  'Brighton & Hove Albion FC':'ブライトン','Brighton & Hove Albion':'ブライトン','Brighton':'ブライトン',
  'Chelsea FC':'チェルシー','Chelsea':'チェルシー',
  'Crystal Palace FC':'クリスタル・パレス','Crystal Palace':'クリスタル・パレス',
  'Everton FC':'エヴァートン','Everton':'エヴァートン',
  'Fulham FC':'フラム','Fulham':'フラム',
  'Hull City AFC':'ハル','Hull City':'ハル','Hull':'ハル',
  'Leeds United FC':'リーズ','Leeds United':'リーズ','Leeds':'リーズ',
  'Newcastle United FC':'ニューカッスル','Newcastle United':'ニューカッスル',
  'Nottingham Forest FC':'フォレスト','Nottingham Forest':'フォレスト','ノッティンガム・フォレスト':'フォレスト',
  'Sunderland AFC':'サンダーランド','Sunderland':'サンダーランド',
  'Tottenham Hotspur FC':'トッテナム','Tottenham Hotspur':'トッテナム','Tottenham':'トッテナム',
  'West Ham United FC':'ウェストハム','West Ham United':'ウェストハム','West Ham':'ウェストハム',
  'Wolverhampton Wanderers FC':'ウルブズ','Wolverhampton Wanderers':'ウルブズ','Wolves':'ウルブズ',
  'Burnley FC':'バーンリー','Burnley':'バーンリー',
  'Leicester City FC':'レスター','Leicester City':'レスター',
  'Southampton FC':'サウサンプトン','Southampton':'サウサンプトン',
  'Ipswich Town FC':'イプスウィッチ','Ipswich Town':'イプスウィッチ','イプスウィッチ':'イプスウィッチ',
  'Coventry City FC':'コヴェントリー','Coventry City':'コヴェントリー','コヴェントリー':'コヴェントリー',
  // Spain
  'FC Barcelona':'バルサ','Barcelona':'バルサ','バルセロナ':'バルサ',
  'Real Madrid CF':'レアル','Real Madrid':'レアル','レアル・マドリード':'レアル',
  'Club Atlético de Madrid':'アトレティコ','Atletico Madrid':'アトレティコ','Atlético Madrid':'アトレティコ','アトレティコ・マドリード':'アトレティコ',
  'Athletic Club':'アスレティック','アスレティック・クラブ':'アスレティック',
  'Real Sociedad de Fútbol':'ソシエダ','Real Sociedad':'ソシエダ','レアル・ソシエダ':'ソシエダ',
  'Villarreal CF':'ビジャレアル','Villarreal':'ビジャレアル',
  'Sevilla FC':'セビージャ','Sevilla':'セビージャ',
  'Valencia CF':'バレンシア','Valencia':'バレンシア',
  'Real Betis Balompié':'ベティス','Real Betis':'ベティス',
  'Rayo Vallecano de Madrid':'ラージョ','Rayo Vallecano':'ラージョ','ラージョ・バジェカーノ':'ラージョ',
  'Getafe CF':'ヘタフェ','Getafe':'ヘタフェ',
  'Girona FC':'ジローナ','Girona':'ジローナ',
  'RC Celta de Vigo':'セルタ','Celta Vigo':'セルタ','Celta de Vigo':'セルタ',
  'RCD Mallorca':'マジョルカ','Mallorca':'マジョルカ',
  'CA Osasuna':'オサスナ','Osasuna':'オサスナ',
  'RCD Espanyol de Barcelona':'エスパニョール','RCD Espanyol':'エスパニョール','Espanyol':'エスパニョール',
  'Deportivo Alavés':'アラベス','Alaves':'アラベス','Alavés':'アラベス',
  'Elche CF':'エルチェ','Elche':'エルチェ',
  'Levante UD':'レバンテ','Levante':'レバンテ',
  'Real Oviedo':'オビエド','Real Oviedo CF':'オビエド',
  'UD Las Palmas':'ラス・パルマス','Las Palmas':'ラス・パルマス',
  'Málaga CF':'マラガ','Málaga':'マラガ','Malaga CF':'マラガ','Malaga':'マラガ','マラガ':'マラガ',
  'Real Racing Club de Santander':'ラシン','Racing Santander':'ラシン','Racing Club':'ラシン',
  'RC Deportivo de La Coruña':'デポルティーボ','Deportivo La Coruña':'デポルティーボ','Deportivo de La Coruña':'デポルティーボ','Deportivo A Coruña':'デポルティーボ',
  // Germany
  'FC Bayern München':'バイエルン','Bayern München':'バイエルン','Bayern Munich':'バイエルン','バイエルン・ミュンヘン':'バイエルン',
  'Borussia Dortmund':'ドルトムント','Dortmund':'ドルトムント','ボルシア・ドルトムント':'ドルトムント','ドルトムント':'ドルトムント',
  'TSG 1899 Hoffenheim':'ホッフェンハイム','TSG Hoffenheim':'ホッフェンハイム','Hoffenheim':'ホッフェンハイム',
  'Bayer 04 Leverkusen':'レヴァークーゼン','Bayer Leverkusen':'レヴァークーゼン','Leverkusen':'レヴァークーゼン',
  'RB Leipzig':'ライプツィヒ','RasenBallsport Leipzig':'ライプツィヒ',
  'Eintracht Frankfurt':'フランクフルト','Frankfurt':'フランクフルト',
  'VfB Stuttgart':'シュトゥットガルト','Stuttgart':'シュトゥットガルト',
  'SC Freiburg':'フライブルク','Sport-Club Freiburg':'フライブルク','Freiburg':'フライブルク',
  '1. FSV Mainz 05':'マインツ','Mainz 05':'マインツ','Mainz':'マインツ',
  'Borussia Mönchengladbach':'ボルシアMG','Borussia Monchengladbach':'ボルシアMG','Mönchengladbach':'ボルシアMG',
  'VfL Wolfsburg':'ヴォルフスブルク','Wolfsburg':'ヴォルフスブルク',
  'SV Werder Bremen':'ブレーメン','Werder Bremen':'ブレーメン','Bremen':'ブレーメン',
  'FC Augsburg':'アウクスブルク','Augsburg':'アウクスブルク',
  '1. FC Union Berlin':'ウニオン・ベルリン','Union Berlin':'ウニオン・ベルリン',
  '1. FC Köln':'ケルン','FC Köln':'ケルン','FC Cologne':'ケルン','Köln':'ケルン',
  'Hamburger SV':'ハンブルク','Hamburg':'ハンブルク',
  'FC St. Pauli 1910':'ザンクト・パウリ','FC St. Pauli':'ザンクト・パウリ','St. Pauli':'ザンクト・パウリ',
  '1. FC Heidenheim 1846':'ハイデンハイム','Heidenheim':'ハイデンハイム',
  'FC Schalke 04':'シャルケ','Schalke 04':'シャルケ','Schalke':'シャルケ','シャルケ':'シャルケ',
  'SV Elversberg':'エルヴァースベルク','Elversberg':'エルヴァースベルク',
  'SC Paderborn 07':'パーダーボルン','Paderborn':'パーダーボルン',
  // Italy
  'AC Milan':'ミラン','Milan':'ミラン','ACミラン':'ミラン',
  'FC Internazionale Milano':'インテル','Internazionale':'インテル','Inter Milan':'インテル','Inter':'インテル','インテル':'インテル',
  'Juventus FC':'ユベントス','Juventus':'ユベントス','ユベントス':'ユベントス',
  'Cagliari Calcio':'カリアリ','Cagliari':'カリアリ',
  'SSC Napoli':'ナポリ','Napoli':'ナポリ',
  'AS Roma':'ローマ','Roma':'ローマ',
  'SS Lazio':'ラツィオ','Lazio':'ラツィオ',
  'Atalanta BC':'アタランタ','Atalanta':'アタランタ',
  'Bologna FC 1909':'ボローニャ','Bologna':'ボローニャ',
  'ACF Fiorentina':'フィオレンティーナ','Fiorentina':'フィオレンティーナ',
  'Genoa CFC':'ジェノア','Genoa':'ジェノア',
  'Torino FC':'トリノ','Torino':'トリノ',
  'Udinese Calcio':'ウディネーゼ','Udinese':'ウディネーゼ',
  'Hellas Verona FC':'ヴェローナ','Hellas Verona':'ヴェローナ','Verona':'ヴェローナ',
  'US Lecce':'レッチェ','Lecce':'レッチェ',
  'Parma Calcio 1913':'パルマ','Parma':'パルマ',
  'Como 1907':'コモ','Como':'コモ',
  'US Sassuolo Calcio':'サッスオーロ','Sassuolo':'サッスオーロ',
  'US Cremonese':'クレモネーゼ','Cremonese':'クレモネーゼ',
  'Pisa Sporting Club':'ピサ','Pisa SC':'ピサ','Pisa':'ピサ',
  'Venezia FC':'ヴェネツィア','Venezia':'ヴェネツィア',
  'AC Monza':'モンツァ','Monza':'モンツァ',
  'Frosinone Calcio':'フロジノーネ','Frosinone':'フロジノーネ',
  // France
  'Paris Saint-Germain FC':'PSG','Paris Saint-Germain':'PSG','Paris SG':'PSG','パリ・サンジェルマン':'PSG',
  'AS Monaco FC':'モナコ','AS Monaco':'モナコ','Monaco':'モナコ','モナコ':'モナコ',
  'Olympique de Marseille':'マルセイユ','Marseille':'マルセイユ',
  'Olympique Lyonnais':'リヨン','Lyon':'リヨン',
  'LOSC Lille':'リール','Lille OSC':'リール','Lille':'リール',
  'RC Lens':'ランス','Lens':'ランス',
  'OGC Nice':'ニース','Nice':'ニース',
  'Stade Rennais FC 1901':'レンヌ','Stade Rennais':'レンヌ','Stade Rennais FC':'レンヌ','Rennes':'レンヌ',
  'RC Strasbourg Alsace':'ストラスブール','Strasbourg':'ストラスブール',
  'Toulouse FC':'トゥールーズ','Toulouse':'トゥールーズ',
  'FC Nantes':'ナント','Nantes':'ナント',
  'Stade Brestois 29':'ブレスト','Brest':'ブレスト',
  'AJ Auxerre':'オセール','Auxerre':'オセール',
  'Angers SCO':'アンジェ','Angers':'アンジェ',
  'Le Havre AC':'ル・アーヴル','Le Havre':'ル・アーヴル',
  'FC Lorient':'ロリアン','Lorient':'ロリアン',
  'FC Metz':'メス','Metz':'メス',
  'Paris FC':'パリFC',
  'Stade de Reims':'スタッド・ランス','Reims':'スタッド・ランス',
  'AS Saint-Étienne':'サンテティエンヌ','Saint-Étienne':'サンテティエンヌ','Saint-Etienne':'サンテティエンヌ',
  'Montpellier HSC':'モンペリエ','Montpellier':'モンペリエ',
  'Le Mans FC':'ル・マン','Le Mans':'ル・マン',
  'ESTAC Troyes':'トロワ','Troyes':'トロワ'
};

// Provider venue aliases -> stable Japanese display strings.
// Sponsor-name aliases are kept where providers may lag behind official renames.
const CP_VENUE_DISPLAY_NAMES={
  // England
  'Emirates Stadium':'エミレーツ・スタジアム',
  'Villa Park':'ヴィラ・パーク',
  'Dean Court':'ディーン・コート','Vitality Stadium':'ディーン・コート',
  'Brentford Community Stadium':'ブレントフォード・コミュニティ・スタジアム','Gtech Community Stadium':'ブレントフォード・コミュニティ・スタジアム',
  'Falmer Stadium':'ファルマー・スタジアム','American Express Stadium':'ファルマー・スタジアム','The American Express Community Stadium':'ファルマー・スタジアム',
  'Stamford Bridge':'スタンフォード・ブリッジ',
  'Coventry Building Society Arena':'コヴェントリー・ビルディング・ソサエティ・アリーナ',
  'Selhurst Park':'セルハースト・パーク',
  'Hill Dickinson Stadium':'ヒル・ディッキンソン・スタジアム','Everton Stadium':'ヒル・ディッキンソン・スタジアム',
  'Craven Cottage':'クレイヴン・コテージ',
  'MKM Stadium':'MKMスタジアム',
  'Portman Road':'ポートマン・ロード',
  'Elland Road':'エランド・ロード',
  'Anfield':'アンフィールド',
  'City of Manchester Stadium':'エティハド・スタジアム','Etihad Stadium':'エティハド・スタジアム',
  'Old Trafford':'オールド・トラッフォード',
  "St James' Park":'セント・ジェームズ・パーク','St. James’ Park':'セント・ジェームズ・パーク','St James Park':'セント・ジェームズ・パーク',
  'City Ground':'シティ・グラウンド','The City Ground':'シティ・グラウンド',
  'Stadium of Light':'スタジアム・オブ・ライト',
  'Tottenham Hotspur Stadium':'トッテナム・ホットスパー・スタジアム',
  // Spain
  'Campo de Fútbol de Mendizorrotza':'メンディソロッツァ','Estadio de Mendizorroza':'メンディソロッツァ',
  'Estadio San Mamés':'サン・マメス','San Mamés':'サン・マメス',
  'Estadio Riyadh Air Metropolitano':'メトロポリターノ','Riyadh Air Metropolitano':'メトロポリターノ','Estadio Cívitas Metropolitano':'メトロポリターノ','Estádio Cívitas Metropolitano':'メトロポリターノ',
  'Camp Nou':'カンプ・ノウ','Spotify Camp Nou':'カンプ・ノウ',
  'Estadio ABANCA Balaídos':'バライードス','Estadio Municipal de Balaídos':'バライードス','Balaídos':'バライードス',
  'Estadio ABANCA Riazor':'リアソール','Estadio de Riazor':'リアソール','Riazor':'リアソール',
  'Estadio Martínez Valero':'マルティネス・バレーロ','Martínez Valero':'マルティネス・バレーロ',
  'RCDE Stadium':'RCDEスタジアム','Stage Front Stadium':'RCDEスタジアム',
  'Estadio Coliseum':'コリセウム','Coliseum':'コリセウム',
  'Estadio Ciutat de València':'シウタ・デ・バレンシア','Ciutat de València':'シウタ・デ・バレンシア',
  'La Rosaleda Stadium':'ラ・ロサレーダ','Estadio La Rosaleda':'ラ・ロサレーダ','La Rosaleda':'ラ・ロサレーダ',
  'Estadio El Sadar':'エル・サダール','El Sadar':'エル・サダール',
  'Campos de Sport de El Sardinero':'エル・サルディネロ','El Sardinero':'エル・サルディネロ',
  'Estadio de Vallecas':'エスタディオ・デ・バジェカス','Campo de Fútbol de Vallecas':'エスタディオ・デ・バジェカス','El Campo de Fútbol de Vallecas':'エスタディオ・デ・バジェカス',
  'Estadio Olímpico de la Cartuja':'ラ・カルトゥハ','Estadio La Cartuja de Sevilla':'ラ・カルトゥハ','La Cartuja':'ラ・カルトゥハ',
  'Bernabéu':'サンティアゴ・ベルナベウ','Santiago Bernabéu':'サンティアゴ・ベルナベウ','Estadio Santiago Bernabéu':'サンティアゴ・ベルナベウ',
  'Reale Arena':'レアレ・アレーナ','Anoeta':'レアレ・アレーナ',
  'Estadio Ramón Sánchez-Pizjuán':'サンチェス・ピスフアン','Ramón Sánchez-Pizjuán':'サンチェス・ピスフアン',
  'Camp de Mestalla':'メスタージャ','Mestalla':'メスタージャ','Estadio de Mestalla':'メスタージャ',
  'Estadio de la Cerámica':'エスタディオ・デ・ラ・セラミカ','Estadio de la Ceramica':'エスタディオ・デ・ラ・セラミカ',
  // Germany
  'Allianz Arena':'アリアンツ・アレーナ',
  'Signal Iduna Park':'ジグナル・イドゥナ・パルク','SIGNAL IDUNA PARK':'ジグナル・イドゥナ・パルク',
  'BayArena':'バイアレーナ',
  'MHPArena':'MHPアレーナ','Mercedes-Benz Arena':'MHPアレーナ',
  'Deutsche Bank Park':'ドイチェ・バンク・パルク',
  'Volksparkstadion':'フォルクスパルクシュタディオン',
  'ista-Borussia-Park':'ボルシア・パルク','BORUSSIA-PARK':'ボルシア・パルク',
  'RheinEnergieStadion':'ラインエネルギーシュタディオン','RheinEnergieSTADION':'ラインエネルギーシュタディオン',
  'Red Bull Arena':'レッドブル・アレーナ',
  'Weserstadion':'ヴェーザーシュタディオン',
  'Europa-Park Stadion':'ヨーロッパ・パルク・シュタディオン',
  'MEWA ARENA':'MEWAアレーナ','Mewa Arena':'MEWAアレーナ',
  'WWK Arena':'WWKアレーナ','WWK ARENA':'WWKアレーナ',
  'SNP Arena':'SNPアレーナ','PreZero Arena':'SNPアレーナ',
  'Stadion An der Alten Försterei':'アルテ・フェルステライ','An der Alten Försterei':'アルテ・フェルステライ',
  'VELTINS-Arena':'フェルティンス・アレーナ','Veltins-Arena':'フェルティンス・アレーナ',
  'URSAPHARM-Arena an der Kaiserlinde':'ウルザファーム・アレーナ','URSAPHARM-Arena':'ウルザファーム・アレーナ',
  'Home Deluxe Arena':'ホーム・デラックス・アレーナ','Home-Deluxe-Arena':'ホーム・デラックス・アレーナ',
  // Italy
  'New Balance Arena':'ニュー・バランス・アレーナ','Gewiss Stadium':'ニュー・バランス・アレーナ',
  "Stadio Renato Dall'Ara":'レナート・ダッラーラ',
  'Unipol Domus':'ウニポル・ドムス',
  'Stadio Giuseppe Sinigaglia':'ジュゼッペ・シニガーリャ',
  'Stadio Artemio Franchi':'アルテミオ・フランキ',
  'Stadio Benito Stirpe':'ベニート・スティルペ',
  'Stadio Luigi Ferraris':'ルイジ・フェッラーリス',
  'San Siro':'サン・シーロ','Stadio Giuseppe Meazza':'サン・シーロ',
  'Allianz Stadium':'アリアンツ・スタジアム','Juventus Stadium':'アリアンツ・スタジアム',
  'Stadio Olimpico':'スタディオ・オリンピコ',
  'Stadio Via del Mare-Ettore Giardiniero':'ヴィア・デル・マーレ','Stadio Via del Mare':'ヴィア・デル・マーレ',
  'Stadio Brianteo':'ブリアンテオ','U-Power Stadium':'ブリアンテオ',
  'Stadio Diego Armando Maradona':'ディエゴ・アルマンド・マラドーナ',
  'Stadio Ennio Tardini':'エンニオ・タルディーニ',
  'Mapei Stadium – Città del Tricolore':'マペイ・スタジアム','Mapei Stadium - Città del Tricolore':'マペイ・スタジアム','Mapei Stadium':'マペイ・スタジアム',
  'Stadio Olimpico Grande Torino':'オリンピコ・グランデ・トリノ',
  'Bluenergy Stadium':'ブルーエナジー・スタジアム','Dacia Arena':'ブルーエナジー・スタジアム',
  'Stadio Pier Luigi Penzo':'ピエル・ルイジ・ペンツォ',
  // France
  'Stade Raymond Kopa':'レイモン・コパ',
  'Stade Abbé Deschamps':'アベ・デシャン',
  'Stade Francis-Le Blé':'フランシス・ル・ブレ',
  'Stade Océane':'スタッド・オセアン',
  'Stade Marie-Marvingt':'マリー・マルヴァン',
  'Stade Bollaert-Delelis':'ボラール・デレリス',
  'Stade Pierre-Mauroy':'ピエール・モーロワ','Decathlon Arena – Stade Pierre-Mauroy':'ピエール・モーロワ',
  'Stade du Moustoir':'ムストワール',
  'Groupama Stadium':'グルパマ・スタジアム',
  'Stade Vélodrome':'ヴェロドローム','Orange Vélodrome':'ヴェロドローム',
  'Stade Louis II':'スタッド・ルイ・ドゥ',
  'Allianz Riviera':'アリアンツ・リヴィエラ',
  'Stade Jean-Bouin':'ジャン・ブアン',
  'Parc des Princes':'パルク・デ・プランス',
  'Roazhon Park':'ロアゾン・パルク',
  'Stade de la Meinau':'スタッド・ド・ラ・メノ',
  'Stadium de Toulouse':'スタジアム・ド・トゥールーズ',
  "Stade de l'Aube":'スタッド・ド・ローブ'
};

// Current 2026-27 top-flight home-ground inference.
// Use only when the provider omits the venue and the supported club is AWAY.
const CP_HOME_VENUE_BY_TEAM={
  // Premier League 20
  'アーセナル':'エミレーツ・スタジアム','アストン・ヴィラ':'ヴィラ・パーク','ボーンマス':'ディーン・コート',
  'ブレントフォード':'ブレントフォード・コミュニティ・スタジアム','ブライトン':'ファルマー・スタジアム','チェルシー':'スタンフォード・ブリッジ',
  'コヴェントリー':'コヴェントリー・ビルディング・ソサエティ・アリーナ','クリスタル・パレス':'セルハースト・パーク',
  'エヴァートン':'ヒル・ディッキンソン・スタジアム','フラム':'クレイヴン・コテージ','ハル':'MKMスタジアム',
  'イプスウィッチ':'ポートマン・ロード','リーズ':'エランド・ロード','リヴァプール':'アンフィールド','マンC':'エティハド・スタジアム',
  'マンU':'オールド・トラッフォード','ニューカッスル':'セント・ジェームズ・パーク','フォレスト':'シティ・グラウンド',
  'サンダーランド':'スタジアム・オブ・ライト','トッテナム':'トッテナム・ホットスパー・スタジアム',
  // LaLiga 20
  'アラベス':'メンディソロッツァ','アスレティック':'サン・マメス','アトレティコ':'メトロポリターノ','バルサ':'カンプ・ノウ',
  'セルタ':'バライードス','デポルティーボ':'リアソール','エルチェ':'マルティネス・バレーロ','エスパニョール':'RCDEスタジアム',
  'ヘタフェ':'コリセウム','レバンテ':'シウタ・デ・バレンシア','マラガ':'ラ・ロサレーダ','オサスナ':'エル・サダール',
  'ラシン':'エル・サルディネロ','ラージョ':'エスタディオ・デ・バジェカス','ベティス':'ラ・カルトゥハ',
  'レアル':'サンティアゴ・ベルナベウ','ソシエダ':'レアレ・アレーナ','セビージャ':'サンチェス・ピスフアン',
  'バレンシア':'メスタージャ','ビジャレアル':'エスタディオ・デ・ラ・セラミカ',
  // Bundesliga 18
  'アウクスブルク':'WWKアレーナ','ウニオン・ベルリン':'アルテ・フェルステライ','ブレーメン':'ヴェーザーシュタディオン',
  'ドルトムント':'ジグナル・イドゥナ・パルク','エルヴァースベルク':'ウルザファーム・アレーナ','フランクフルト':'ドイチェ・バンク・パルク',
  'フライブルク':'ヨーロッパ・パルク・シュタディオン','ハンブルク':'フォルクスパルクシュタディオン','ホッフェンハイム':'SNPアレーナ',
  'ケルン':'ラインエネルギーシュタディオン','ライプツィヒ':'レッドブル・アレーナ','レヴァークーゼン':'バイアレーナ',
  'マインツ':'MEWAアレーナ','ボルシアMG':'ボルシア・パルク','バイエルン':'アリアンツ・アレーナ',
  'パーダーボルン':'ホーム・デラックス・アレーナ','シャルケ':'フェルティンス・アレーナ','シュトゥットガルト':'MHPアレーナ',
  // Serie A 20
  'アタランタ':'ニュー・バランス・アレーナ','ボローニャ':'レナート・ダッラーラ','カリアリ':'ウニポル・ドムス','コモ':'ジュゼッペ・シニガーリャ',
  'フィオレンティーナ':'アルテミオ・フランキ','フロジノーネ':'ベニート・スティルペ','ジェノア':'ルイジ・フェッラーリス',
  'ミラン':'サン・シーロ','インテル':'サン・シーロ','ユベントス':'アリアンツ・スタジアム','ラツィオ':'スタディオ・オリンピコ',
  'ローマ':'スタディオ・オリンピコ','レッチェ':'ヴィア・デル・マーレ','モンツァ':'ブリアンテオ','ナポリ':'ディエゴ・アルマンド・マラドーナ',
  'パルマ':'エンニオ・タルディーニ','サッスオーロ':'マペイ・スタジアム','トリノ':'オリンピコ・グランデ・トリノ',
  'ウディネーゼ':'ブルーエナジー・スタジアム','ヴェネツィア':'ピエル・ルイジ・ペンツォ',
  // Ligue 1 18
  'アンジェ':'レイモン・コパ','オセール':'アベ・デシャン','ブレスト':'フランシス・ル・ブレ','ル・アーヴル':'スタッド・オセアン',
  'ル・マン':'マリー・マルヴァン','ランス':'ボラール・デレリス','リール':'ピエール・モーロワ','ロリアン':'ムストワール',
  'リヨン':'グルパマ・スタジアム','マルセイユ':'ヴェロドローム','モナコ':'スタッド・ルイ・ドゥ','ニース':'アリアンツ・リヴィエラ',
  'パリFC':'ジャン・ブアン','PSG':'パルク・デ・プランス','レンヌ':'ロアゾン・パルク','ストラスブール':'スタッド・ド・ラ・メノ',
  'トゥールーズ':'スタジアム・ド・トゥールーズ','トロワ':'スタッド・ド・ローブ'
};

function cpCanonicalTeamName(name){
  let n=String(name||'').trim();
  if(!n)return'未定';
  return CP_TEAM_DISPLAY_NAMES[n]||n
}
function cpDisplayTeamName(name,small=false){
  let n=cpCanonicalTeamName(name);
  const max=small?7:10;
  return n.length>max?n.slice(0,max-1)+'…':n
}

// Normalize data before it reaches cache/rendering. Provider venue wins when known;
// registry inference is only used for verified AWAY home grounds when venue is missing.
mapMatch=function(m){
  let out=CP_RG_BASE_MAP_MATCH(m);
  if(!out)return out;
  out.opponentName=cpCanonicalTeamName(out.opponentName);
  if(out.venue&&CP_VENUE_DISPLAY_NAMES[out.venue])out.venue=CP_VENUE_DISPLAY_NAMES[out.venue];
  if((!out.venue||out.venue==='会場未定')&&out.homeAway==='AWAY'){
    out.venue=CP_HOME_VENUE_BY_TEAM[out.opponentName]||'会場未定'
  }
  return out
};

function cpNormalizeOpponentOpt(opt,small=false){
  if(!opt||opt.fallback===club.badge)return opt;
  return {...opt,name:cpDisplayTeamName(opt.name,small)}
}

renderTeamBlock=function(parent,opt){
  if(!cpRgActive())return CP_RG_BASE_RENDER_TEAM(parent,opt);
  return CP_RG_BASE_RENDER_TEAM(parent,cpNormalizeOpponentOpt(opt,false))
};

smallTeamName=function(name,isClub=false){
  if(!cpRgActive())return CP_RG_BASE_SMALL_TEAM_NAME(name,isClub);
  if(isClub)return club.jp||club.short||'';
  return cpDisplayTeamName(name,true)
};

if(CP_RG_BASE_REAL_TEAM){
  cpRealTeamBlock=function(parent,opt,small=false){
    return CP_RG_BASE_REAL_TEAM(parent,cpNormalizeOpponentOpt(opt,small),small)
  }
}
if(CP_RG_BASE_BARCA_TEAM){
  cpBarcelonaTeamBlock=function(parent,opt,small=false){
    return CP_RG_BASE_BARCA_TEAM(parent,cpNormalizeOpponentOpt(opt,small),small)
  }
}

const CP_PILL_METRICS=typeof CP_DESIGN_TOKENS==='object'&&CP_DESIGN_TOKENS.pill?CP_DESIGN_TOKENS.pill:{
  medium:{v:2.5,h:7,font:7.2,r:9,logoBox:24,logoSize:19,gap:5,sideV:6.2},
  small:{v:2.0,h:5,font:7.3,r:9,logoBox:19,logoSize:15,gap:4,sideV:4.8}
};

function cpUnifiedCompetitionPill(parent,m,small=false,barca=false){
  let label=competitionReadable(m,small),z=competitionStyle(label),q=small?CP_PILL_METRICS.small:CP_PILL_METRICS.medium,p=parent.addStack();
  p.layoutHorizontally();p.centerAlignContent();p.setPadding(q.v,q.h,q.v,q.h);p.cornerRadius=q.r;
  p.backgroundColor=C(barca?'#171923':z.bg,barca?.98:.94);p.borderWidth=.8;p.borderColor=C(barca?'#D9DCE5':z.bd,barca?.54:.82);
  let logo=typeof cpCompetitionLogoImage==='function'?cpCompetitionLogoImage(m):null;
  if(logo){
    let plate=p.addStack();plate.size=new Size(q.logoBox,q.logoBox);plate.cornerRadius=q.logoBox/2;plate.backgroundColor=C('#FFFFFF',1);plate.borderWidth=1;plate.borderColor=C('#FFFFFF',1);plate.centerAlignContent();
    let im=plate.addImage(logo);im.imageSize=new Size(q.logoSize,q.logoSize);im.centerAlignImage();
    p.addSpacer(q.gap)
  }
  text(p,label,q.font,true,1,barca?'#FFFFFF':z.fg)
}

competitionPill=function(parent,m,small=false){
  return cpUnifiedCompetitionPill(parent,m,small,false)
};

sidePill=function(parent,m,small=false){
  let q=small?CP_PILL_METRICS.small:CP_PILL_METRICS.medium,p=parent.addStack(),label=sideTag(m);
  p.setPadding(q.sideV,q.h,q.sideV,q.h);p.cornerRadius=q.r;p.backgroundColor=C('#121318',.94);p.borderWidth=.8;p.borderColor=C(club.a,.62);
  text(p,label,q.font,true,1,'#F6F7F9')
};

if(typeof cpBarcelonaCompetitionPill==='function'){
  cpBarcelonaCompetitionPill=function(parent,m,small=false){
    return cpUnifiedCompetitionPill(parent,m,small,true)
  }
}
if(typeof cpBarcelonaSidePill==='function'){
  cpBarcelonaSidePill=function(parent,m,small=false){
    let q=small?CP_PILL_METRICS.small:CP_PILL_METRICS.medium,p=parent.addStack(),label=sideTag(m);
    p.setPadding(q.sideV,q.h,q.sideV,q.h);p.cornerRadius=q.r;p.backgroundColor=C('#11131B',.98);p.borderWidth=.8;p.borderColor=C('#E1BD61',.76);
    text(p,label,q.font,true,1,'#FFFFFF')
  }
}
