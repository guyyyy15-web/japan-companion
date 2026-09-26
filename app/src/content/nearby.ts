import type { Bi } from './guide'

/** One-tap Google Maps searches around the phone. Japanese queries find far more than English ones. */
export interface QuickSearch {
  id: string
  icon: string
  label: Bi
  query: string
}

export const QUICK_SEARCHES: QuickSearch[] = [
  { id: 'toilet', icon: '🚻', label: { he: 'שירותים ציבוריים', en: 'Public toilets' }, query: '公衆トイレ' },
  { id: 'konbini', icon: '🏪', label: { he: 'קונביני (פח + לרוב שירותים)', en: 'Konbini (bin, often a toilet)' }, query: 'コンビニ' },
  { id: 'station', icon: '🚉', label: { he: 'תחנת רכבת', en: 'Train station' }, query: '駅' },
  { id: 'bin', icon: '🗑️', label: { he: 'פח אשפה', en: 'Trash can' }, query: 'ゴミ箱' },
]

export const TRASH_MAP_URL = 'https://japantrashmap.com/'

export const NEARBY_TIPS: Bi[] = [
  { he: 'פחים ציבוריים כמעט לא קיימים ביפן. הכי בטוח: קונביני (הפחים ליד הכניסה או בפנים) או תחנת רכבת.', en: 'Public bins are rare in Japan. Safest bet: a konbini (bins by the door or inside) or a train station.' },
  { he: 'ליד מכונות שתייה יש כמעט תמיד פח לבקבוקים ולפחיות בלבד.', en: 'Vending machines almost always have a bin, for bottles and cans only.' },
  { he: 'שירותים: בכל תחנת רכבת, בכלבו, בקניון, בפארקים וברוב הקונביני. בקונביני מבקשים רשות עם המשפט שלמעלה.', en: 'Toilets: every station, department stores, malls, parks and most konbini. At a konbini, ask with the phrase above.' },
  { he: 'אין פח? מחזיקים שקית קטנה ומרוקנים במלון. ככה עושים גם היפנים.', en: 'No bin? Carry a small bag and empty it at the hotel. That\'s what locals do.' },
]

export interface NearbyPhrase {
  id: string
  ja: string
  kana: string
  romaji: string
  he: string
  en: string
}

export const NEARBY_PHRASES: NearbyPhrase[] = [
  { id: 'borrow-toilet', ja: 'トイレを借りてもいいですか', kana: 'トイレをかりてもいいですか', romaji: 'toire o karite mo ii desu ka', he: 'אפשר להשתמש בשירותים?', en: 'May I use the toilet?' },
  { id: 'where-bin', ja: 'ゴミ箱はどこですか', kana: 'ごみばこはどこですか', romaji: 'gomibako wa doko desu ka', he: 'איפה יש פח אשפה?', en: 'Where is a trash can?' },
  { id: 'throw-away', ja: 'ゴミを捨ててもいいですか', kana: 'ごみをすててもいいですか', romaji: 'gomi o sutete mo ii desu ka', he: 'אפשר לזרוק כאן את הזבל?', en: 'May I throw this away here?' },
]
