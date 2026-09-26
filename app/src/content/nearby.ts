import type { Bi } from './guide'

/** One-tap Google Maps searches around the phone. Japanese queries find far more than English ones. */
export interface QuickSearch {
  id: string
  icon: string
  label: Bi
  query: string
  /** The same search limited to places reviews or listings call tattoo-friendly. */
  tattoo?: string
}

export interface SearchCategory {
  id: string
  icon: string
  label: Bi
  items: QuickSearch[]
}

const q = (id: string, icon: string, he: string, en: string, query: string, tattoo?: string): QuickSearch => ({
  id,
  icon,
  label: { he, en },
  query,
  ...(tattoo ? { tattoo } : {}),
})

export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: 'essentials',
    icon: '🧭',
    label: { he: 'בסיסי', en: 'Essentials' },
    items: [
      q('toilet', '🚻', 'שירותים ציבוריים', 'Public toilets', '公衆トイレ'),
      q('konbini', '🏪', 'קונביני', 'Konbini', 'コンビニ'),
      q('bin', '🗑️', 'פח אשפה', 'Trash can', 'ゴミ箱'),
      q('station', '🚉', 'תחנת רכבת', 'Train station', '駅'),
      q('atm', '💴', 'כספומט לכרטיס זר', 'ATM for foreign cards', 'セブン銀行ATM'),
      q('exchange', '💱', 'המרת כסף', 'Currency exchange', '両替所'),
      q('drugstore', '💊', 'בית מרקחת', 'Drugstore', 'ドラッグストア'),
      q('locker', '🧳', 'לוקרים למזוודות', 'Coin lockers', 'コインロッカー'),
      q('laundry', '🧺', 'מכבסה בשירות עצמי', 'Coin laundry', 'コインランドリー'),
      q('koban', '👮', 'עמדת משטרה', 'Police box (koban)', '交番'),
      q('clinic', '🏥', 'מרפאה / בית חולים', 'Clinic / hospital', '病院'),
      q('post', '📮', 'דואר', 'Post office', '郵便局'),
      q('smoking', '🚬', 'אזור עישון', 'Smoking area', '喫煙所'),
    ],
  },
  {
    id: 'food',
    icon: '🍜',
    label: { he: 'אוכל', en: 'Food' },
    items: [
      q('ramen', '🍜', 'ראמן', 'Ramen', 'ラーメン'),
      q('kaiten', '🍣', 'סושי על מסוע', 'Conveyor-belt sushi', '回転寿司'),
      q('izakaya', '🏮', 'איזקאיה', 'Izakaya', '居酒屋'),
      q('yakiniku', '🥩', 'יקיניקו (גריל)', 'Yakiniku (grill)', '焼肉'),
      q('teishoku', '🍱', 'ארוחת סט', 'Set-meal diner', '定食'),
      q('gyudon', '🍚', 'גיודון', 'Beef bowl', '牛丼'),
      q('soba', '🥢', 'סובה / אודון', 'Soba / udon', 'そば うどん'),
      q('okonomiyaki', '🥞', 'אוקונומיאקי', 'Okonomiyaki', 'お好み焼き'),
      q('takoyaki', '🐙', 'טאקויאקי', 'Takoyaki', 'たこ焼き'),
      q('unagi', '🐟', 'צלופח', 'Eel (unagi)', 'うなぎ'),
      q('yokocho', '🍶', 'סמטת ברים', 'Alley bars (yokocho)', '横丁'),
      q('depachika', '🛍️', 'מתחם אוכל בכלבו', 'Food hall (depachika)', 'デパ地下'),
      q('kissaten', '☕', 'בית קפה רטרו', 'Retro café (kissaten)', '喫茶店'),
      q('matcha', '🍵', 'מאצ׳ה וקינוחים יפניים', 'Matcha & Japanese sweets', '甘味処'),
      q('buffet', '🍽️', 'אכול כפי יכולתך', 'All you can eat', '食べ放題'),
    ],
  },
  {
    id: 'fun',
    icon: '🎮',
    label: { he: 'בילוי', en: 'Fun' },
    items: [
      q('arcade', '🕹️', 'ארקייד', 'Arcade', 'ゲームセンター'),
      q('karaoke', '🎤', 'קריוקי', 'Karaoke', 'カラオケ'),
      q('gacha', '🥚', 'מכונות גאצ׳ה', 'Gacha machines', 'ガチャガチャ'),
      q('purikura', '📸', 'פוריקורה (תאי צילום)', 'Purikura photo booths', 'プリクラ'),
      q('onsen', '♨️', 'אונסן ליום', 'Day-trip onsen', '日帰り温泉', 'タトゥーOK 温泉'),
      q('sento', '🛁', 'מרחץ ציבורי', 'Public bath (sento)', '銭湯', 'タトゥーOK 銭湯'),
      q('sauna', '🧖', 'סאונה', 'Sauna', 'サウナ', 'タトゥーOK サウナ'),
      q('gym', '🏋️', 'חדר כושר ליום', 'Gym (day pass)', 'ジム ドロップイン', 'タトゥーOK ジム'),
      q('pool', '🏊', 'בריכה', 'Swimming pool', 'プール', 'タトゥーOK プール'),
      q('ashiyu', '🦶', 'אמבט רגליים', 'Foot bath', '足湯'),
      q('cat-cafe', '🐈', 'קפה חתולים', 'Cat café', '猫カフェ'),
      q('animal-cafe', '🦔', 'קפה חיות', 'Animal café', '動物カフェ'),
      q('view', '🌃', 'תצפית לילה', 'Night view', '夜景 展望台'),
      q('shrine', '⛩️', 'מקדש שינטו', 'Shrine', '神社'),
      q('temple', '🛕', 'מקדש בודהיסטי', 'Temple', '寺'),
      q('garden', '🌳', 'גן יפני', 'Japanese garden', '日本庭園'),
      q('koyo', '🍁', 'שלכת', 'Autumn leaves', '紅葉 名所'),
      q('kimono', '👘', 'השכרת קימונו', 'Kimono rental', '着物レンタル'),
      q('izakaya-sake', '🍶', 'בר סאקה', 'Sake bar', '日本酒バー'),
    ],
  },
  {
    id: 'shopping',
    icon: '🛍️',
    label: { he: 'קניות', en: 'Shopping' },
    items: [
      q('vintage', '👕', 'בגדי וינטג׳', 'Vintage clothes', '古着屋'),
      q('donki', '🐧', 'דון קיחוטה', 'Don Quijote', 'ドン・キホーテ'),
      q('100yen', '💯', 'חנות 100 ין', '100-yen shop', '100円ショップ'),
      q('retro-games', '👾', 'משחקי רטרו', 'Retro games', 'レトロゲーム'),
      q('hardoff', '🎛️', 'אלקטרוניקה יד שנייה', 'Used electronics (Hard Off)', 'ハードオフ'),
      q('bookoff', '📚', 'ספרים ומנגה יד שנייה', 'Used books & manga', 'ブックオフ'),
      q('electronics', '🔌', 'רשת אלקטרוניקה', 'Electronics store', '家電量販店'),
      q('camera', '📷', 'מצלמות יד שנייה', 'Used cameras', '中古カメラ'),
      q('anime', '🎌', 'אנימה ופיגרים', 'Anime & figures', 'アニメイト まんだらけ'),
      q('pokemon', '⚡', 'פוקימון סנטר', 'Pokémon Center', 'ポケモンセンター'),
      q('cosmetics', '💄', 'קוסמטיקה', 'Cosmetics', 'コスメ'),
      q('stationery', '✏️', 'כלי כתיבה', 'Stationery', '文房具'),
      q('knives', '🔪', 'סכינים יפניות', 'Japanese knives', '包丁'),
      q('pottery', '🍶', 'כלי קרמיקה', 'Pottery', '陶器 器'),
      q('wagashi', '🍡', 'ממתקים יפניים', 'Japanese sweets shop', '和菓子'),
      q('tax-free', '🧾', 'חנות פטורה ממס', 'Tax-free shop', '免税店'),
    ],
  },
]

/** Tattoo-friendly mode: the searches above that have a tattoo variant, plus options that are always fine. */
export const TATTOO_EXTRA: QuickSearch[] = [
  q('private-bath', '🔒', 'אמבט פרטי להשכרה (תמיד מותר)', 'Private bath for hire (always fine)', '貸切風呂'),
  q('room-onsen', '🏯', 'ריוקן עם אונסן בחדר', 'Ryokan with a bath in the room', '客室露天風呂付き 旅館'),
  q('tattoo-en', '🔎', 'ביקורות באנגלית: tattoo friendly', 'English reviews: tattoo friendly', 'tattoo friendly onsen'),
]

export const TATTOO_SEARCHES: QuickSearch[] = [
  ...SEARCH_CATEGORIES.flatMap((c) => c.items)
    .filter((s) => s.tattoo)
    .map((s) => ({ ...s, query: s.tattoo! })),
  ...TATTOO_EXTRA,
]

export const TATTOO_SITE = { name: 'Tattoo Friendly', url: 'https://tattoo-friendly.jp/' }

export const TATTOO_TIPS: Bi[] = [
  { he: 'הרבה אונסנים, "סופר סנטו", בריכות וחדרי כושר אוסרים קעקועים גלויים. תמיד בודקים לפני שנוסעים, כי המדיניות משתנה.', en: 'Many onsen, "super sento", pools and gyms ban visible tattoos. Always check before you go; policies change.' },
  { he: 'השלט 刺青・タトゥーお断り פירושו "אין כניסה עם קעקועים". タトゥーOK פירושו מותר.', en: 'The sign 刺青・タトゥーお断り means "no tattoos". タトゥーOK means they\'re allowed.' },
  { he: 'הפתרון הבטוח: אמבט פרטי (貸切風呂) או חדר בריוקן עם אונסן צמוד. אף אחד לא בודק.', en: 'The sure thing: a private bath (貸切風呂) or a ryokan room with its own bath. Nobody checks.' },
  { he: 'קעקוע קטן? הרבה מקומות מקבלים אם הוא מכוסה במדבקת כיסוי (タトゥーカバーシール), שנמכרת בבתי מרקחת ובדון קיחוטה.', en: 'Small tattoo? Many places accept it covered with a cover sticker (タトゥーカバーシール), sold at drugstores and Don Quijote.' },
  { he: 'במרחצאות השכונתיים (銭湯) בדרך כלל מקלים יותר מאשר באונסנים של אתרי נופש, אבל כל מקום מחליט לבד.', en: 'Neighbourhood sento are usually more relaxed than resort onsen, but each bath decides.' },
  { he: 'רשתות הכושר Anytime Fitness ו-Gold\'s Gym מאפשרות מתאמנים עם קעקועים רק אם הקעקוע מכוסה לגמרי (שרוול ארוך או טייפ).', en: 'Gym chains Anytime Fitness and Gold\'s Gym take tattooed members only if the tattoo is fully covered (long sleeves or tape).' },
]

export const TATTOO_PHRASES: NearbyPhrase[] = [
  { id: 'tattoo-enter', ja: 'タトゥーがありますが、入れますか', kana: 'タトゥーがありますが、はいれますか', romaji: 'tatū ga arimasu ga, hairemasu ka', he: 'יש לי קעקוע, אפשר להיכנס?', en: 'I have a tattoo. Can I go in?' },
  { id: 'tattoo-sticker', ja: 'シールで隠せば大丈夫ですか', kana: 'シールでかくせばだいじょうぶですか', romaji: 'shīru de kakuseba daijōbu desu ka', he: 'זה בסדר אם אכסה אותו במדבקה?', en: 'Is it OK if I cover it with a sticker?' },
  { id: 'private-bath', ja: '貸切風呂はありますか', kana: 'かしきりぶろはありますか', romaji: 'kashikiri buro wa arimasu ka', he: 'יש אמבט פרטי להשכרה?', en: 'Do you have a private bath?' },
]

/** Every quick search, for free-text matching. */
export const QUICK_SEARCHES: QuickSearch[] = SEARCH_CATEGORIES.flatMap((c) => c.items)

export const TRASH_MAP_URL = 'https://japantrashmap.com/'

/** Apps and sites locals actually use. Each link was checked to open. */
export interface LocalApp {
  id: string
  name: string
  icon: string
  url: string
  what: Bi
}

export interface AppGroup {
  id: string
  label: Bi
  apps: LocalApp[]
}

const app = (id: string, icon: string, name: string, url: string, he: string, en: string): LocalApp => ({ id, icon, name, url, what: { he, en } })

export const LOCAL_APPS: AppGroup[] = [
  {
    id: 'eat',
    label: { he: 'איפה לאכול', en: 'Where to eat' },
    apps: [
      app('tabelog', '⭐', 'Tabelog 食べログ', 'https://tabelog.com/en/', 'הדירוגים שהיפנים סומכים עליהם. 3.5 ומעלה זה מעולה.', 'The ratings locals trust. 3.5+ is excellent.'),
      app('hotpepper', '🌶️', 'Hot Pepper ホットペッパー', 'https://www.hotpepper.jp/', 'איזקאיות ומסעדות עם קופונים והזמנת מקום.', 'Izakaya and restaurants, with coupons and bookings.'),
      app('gurunavi', '🍽️', 'Gurunavi ぐるなび', 'https://gurunavi.com/en/', 'מסעדות עם תפריט באנגלית.', 'Restaurants with English menus.'),
      app('tablecheck', '📅', 'TableCheck', 'https://www.tablecheck.com/en/', 'הזמנת מקום באנגלית במסעדות טובות.', 'Book good restaurants in English.'),
    ],
  },
  {
    id: 'move',
    label: { he: 'להתנייד', en: 'Getting around' },
    apps: [
      app('navitime', '🚆', 'Japan Travel by NAVITIME', 'https://japantravel.navitime.com/en/', 'מסלולי רכבת באנגלית, כולל מה מכוסה בפס.', 'Train routes in English, including what a pass covers.'),
      app('yahoo-transit', '🚉', 'Yahoo! 乗換案内', 'https://transit.yahoo.co.jp/', 'אפליקציית הרכבות שהמקומיים משתמשים בה: רציף, קרון, יציאה.', 'The locals\' train app: platform, car and exit.'),
      app('go', '🚕', 'GO タクシー', 'https://go.goinc.jp/', 'הזמנת מונית כמו שהיפנים עושים. תשלום באפליקציה.', 'Order a taxi the way locals do. Pay in the app.'),
      app('luup', '🛴', 'LUUP', 'https://luup.sc/', 'קורקינטים ואופניים חשמליים בטוקיו, אוסקה וקיוטו.', 'E-scooters and e-bikes in Tokyo, Osaka and Kyoto.'),
    ],
  },
  {
    id: 'practical',
    label: { he: 'שימושי', en: 'Practical' },
    apps: [
      app('ecbo', '🧳', 'ecbo cloak', 'https://cloak.ecbo.io/en', 'אחסון מזוודות בחנויות כשהלוקרים מלאים.', 'Leave luggage at shops when lockers are full.'),
      app('yamato', '📦', 'Yamato 宅急便', 'https://www.kuronekoyamato.co.jp/en/', 'שולחים מזוודה למלון הבא ונוסעים בלי כלום.', 'Send a suitcase to the next hotel and travel light.'),
      app('safety', '🚨', 'Safety tips', 'https://www.jnto.go.jp/safety-tips/eng/app.html', 'התראות רעידות אדמה וטייפון באנגלית, של הממשלה.', 'Official earthquake and typhoon alerts in English.'),
      app('tenki', '☔', 'tenki.jp', 'https://tenki.jp/', 'מזג האוויר המדויק ביפן, לפי שעה.', 'Japan\'s most accurate hourly weather.'),
    ],
  },
  {
    id: 'play',
    label: { he: 'בילוי וקניות', en: 'Fun & shopping' },
    apps: [
      app('koyo', '🍁', '紅葉情報 tenki.jp', 'https://tenki.jp/kouyou/', 'איפה השלכת בשיא עכשיו. מושלם לאוקטובר.', 'Where the autumn leaves peak right now. Perfect for October.'),
      app('onsen', '♨️', 'ニフティ温泉', 'https://onsen.nifty.com/', 'כל האונסנים והמרחצאות, עם ביקורות.', 'Every onsen and bathhouse, with reviews.'),
      app('sento', '🛁', '東京銭湯 1010', 'https://www.1010.or.jp/', 'מפת המרחצאות הציבוריים של טוקיו.', 'Map of Tokyo\'s public bathhouses.'),
      app('kakaku', '💹', 'Kakaku.com 価格.com', 'https://kakaku.com/', 'השוואת מחירים לפני קניית אלקטרוניקה או מצלמה.', 'Compare prices before buying electronics or a camera.'),
      app('round1', '🎳', 'Round1', 'https://www.round1.co.jp/', 'באולינג, ארקייד, קריוקי וספורט תחת גג אחד.', 'Bowling, arcade, karaoke and sports under one roof.'),
      app('gigo', '🕹️', 'GiGO', 'https://www.gigo.co.jp/', 'רשת הארקיידים הגדולה (לשעבר SEGA).', 'The big arcade chain (formerly SEGA).'),
      app('gashapon', '🥚', 'ガシャポン', 'https://gashapon.jp/shop/', 'איתור חנויות גאצ׳ה רשמיות.', 'Find official gacha stores.'),
      app('hardoff', '🎛️', 'Hard Off', 'https://www.hardoff.co.jp/', 'אלקטרוניקה, קונסולות וכלי נגינה יד שנייה.', 'Used electronics, consoles and instruments.'),
      app('bookoff', '📚', 'Book Off', 'https://www.bookoff.co.jp/', 'מנגה, משחקים ודיסקים יד שנייה בזול.', 'Cheap used manga, games and CDs.'),
      app('mandarake', '🎌', 'まんだらけ Mandarake', 'https://www.mandarake.co.jp/', 'אספנות אנימה, צעצועים ווינטג׳.', 'Anime collectibles, toys and vintage.'),
      app('donki', '🐧', 'Don Quijote', 'https://www.donki.com/en/', 'הכל-בו הפתוח עד מאוחר, כולל פטור ממס.', 'The late-night everything store, tax-free.'),
      app('pokemon', '⚡', 'Pokémon Center', 'https://www.pokemon.co.jp/shop/', 'חנויות פוקימון הרשמיות.', 'The official Pokémon stores.'),
    ],
  },
]

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
