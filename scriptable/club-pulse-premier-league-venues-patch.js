// Club Pulse Premier League Venue Registry v1.
// Canonical 2026-27 Premier League home-ground display/fallback layer.
// Source basis: current Premier League membership plus current club/league venue naming.
// Provider legacy names remain accepted as aliases, but display resolves to the current venue name.

const CP_PL_VENUE_REGISTRY_SEASON='2026-27';

const CP_PL_2026_27_HOME_VENUES={
  'アーセナル':'エミレーツ・スタジアム',
  'アストン・ヴィラ':'ヴィラ・パーク',
  'ボーンマス':'バイタリティ・スタジアム',
  'ブレントフォード':'Gtechコミュニティ・スタジアム',
  'ブライトン':'アメリカン・エキスプレス・スタジアム',
  'チェルシー':'スタンフォード・ブリッジ',
  'コヴェントリー':'コヴェントリー・ビルディング・ソサエティ・アリーナ',
  'クリスタル・パレス':'セルハースト・パーク',
  'エヴァートン':'ヒル・ディッキンソン・スタジアム',
  'フラム':'クレイヴン・コテージ',
  'ハル':'MKMスタジアム',
  'イプスウィッチ':'ポートマン・ロード',
  'リーズ':'エランド・ロード',
  'リヴァプール':'アンフィールド',
  'マンC':'エティハド・スタジアム',
  'マンU':'オールド・トラッフォード',
  'ニューカッスル':'セント・ジェームズ・パーク',
  'フォレスト':'シティ・グラウンド',
  'サンダーランド':'スタジアム・オブ・ライト',
  'トッテナム':'トッテナム・ホットスパー・スタジアム'
};

const CP_PL_2026_27_VENUE_ALIASES={
  'Emirates Stadium':'エミレーツ・スタジアム',
  'Villa Park':'ヴィラ・パーク',
  'Dean Court':'バイタリティ・スタジアム','Vitality Stadium':'バイタリティ・スタジアム',
  'Brentford Community Stadium':'Gtechコミュニティ・スタジアム','Gtech Community Stadium':'Gtechコミュニティ・スタジアム',
  'Falmer Stadium':'アメリカン・エキスプレス・スタジアム','American Express Stadium':'アメリカン・エキスプレス・スタジアム',
  'The American Express Community Stadium':'アメリカン・エキスプレス・スタジアム','Amex Stadium':'アメリカン・エキスプレス・スタジアム','AMEX Stadium':'アメリカン・エキスプレス・スタジアム',
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
  'Tottenham Hotspur Stadium':'トッテナム・ホットスパー・スタジアム'
};

if(typeof CP_VENUE_DISPLAY_NAMES!=='undefined')Object.assign(CP_VENUE_DISPLAY_NAMES,CP_PL_2026_27_VENUE_ALIASES);
if(typeof CP_HOME_VENUE_BY_TEAM!=='undefined')Object.assign(CP_HOME_VENUE_BY_TEAM,CP_PL_2026_27_HOME_VENUES);
