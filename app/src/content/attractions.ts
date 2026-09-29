import type { Bi } from './guide'

// Hand-picked attractions on the route (Tokyo, Hokkaido, Kyoto, Osaka), by interest.
// Booking notes are as of late September 2026 — always check the official site. Every `url` was checked to open.

export const CITIES = ['tokyo', 'hokkaido', 'kyoto', 'osaka'] as const
export type City = (typeof CITIES)[number]

export const INTERESTS = ['games', 'arcade', 'art', 'nature'] as const
export type Interest = (typeof INTERESTS)[number]

export const INTEREST_ICON: Record<Interest, string> = { games: '🍄', arcade: '🕹️', art: '✨', nature: '⛩️' }

/** none: just go · book: timed tickets online, book ahead · hard: lottery or sells out within minutes */
export type Booking = 'none' | 'book' | 'hard'

export interface Attraction {
  id: string
  city: City
  interests: Interest[]
  icon: string
  name: Bi
  /** Japanese name, used for the Google Maps search. */
  ja: string
  what: Bi
  booking: Booking
  bookNote?: Bi
  tip?: Bi
  url?: string
}

const a = (x: Attraction) => x

export const ATTRACTIONS: Attraction[] = [
  // ---------- Tokyo ----------
  a({
    id: 'teamlab-borderless', city: 'tokyo', interests: ['art'], icon: '🌈', ja: 'チームラボボーダレス',
    name: { he: 'teamLab Borderless', en: 'teamLab Borderless' },
    what: { he: 'מוזיאון אמנות דיגיטלית סוחף באזבודאי הילס. חדרים של אור שזורם ביניהם.', en: 'Immersive digital art museum at Azabudai Hills; rooms of light that flow into each other.' },
    booking: 'book', bookNote: { he: 'כרטיס לשעה מסוימת באתר הרשמי, כדאי כמה ימים מראש.', en: 'Timed ticket on the official site; book a few days ahead.' },
    url: 'https://www.teamlab.art/e/tokyo/',
  }),
  a({
    id: 'teamlab-planets', city: 'tokyo', interests: ['art'], icon: '💧', ja: 'チームラボプラネッツ',
    name: { he: 'teamLab Planets', en: 'teamLab Planets' },
    what: { he: 'אמנות דיגיטלית בטויוסו, הולכים יחפים, חלק מהזמן במים עד הברך.', en: 'Digital art in Toyosu: you walk barefoot, partly through knee-deep water.' },
    booking: 'book', bookNote: { he: 'כרטיס לשעה מסוימת באתר הרשמי.', en: 'Timed ticket on the official site.' },
    tip: { he: 'ללבוש מכנסיים שאפשר להפשיל.', en: 'Wear trousers you can roll up.' },
    url: 'https://www.teamlab.art/e/planets/',
  }),
  a({
    id: 'shibuya-sky', city: 'tokyo', interests: ['art'], icon: '🌆', ja: '渋谷スカイ',
    name: { he: 'Shibuya Sky', en: 'Shibuya Sky' },
    what: { he: 'גג תצפית פתוח מעל צומת שיבויה, הכי יפה בשקיעה.', en: 'Open-air rooftop above the Shibuya crossing; best at sunset.' },
    booking: 'book', bookNote: { he: 'שעות השקיעה נגמרות מהר, להזמין כמה ימים מראש.', en: 'Sunset slots sell out; book a few days ahead.' },
    url: 'https://www.shibuya-scramble-square.com/sky/',
  }),
  a({
    id: 'harry-potter', city: 'tokyo', interests: ['art'], icon: '🪄', ja: 'ワーナー ブラザース スタジオツアー東京',
    name: { he: 'הארי פוטר: סיור אולפנים', en: 'Harry Potter Studio Tour' },
    what: { he: 'סטים ותלבושות מקוריים מהסרטים, בנרימה.', en: 'Original sets and costumes from the films, in Nerima.' },
    booking: 'book', bookNote: { he: 'כרטיסים לתאריך ושעה בלבד, באתר הרשמי.', en: 'Date-and-time tickets only, on the official site.' },
    url: 'https://www.wbstudiotour.jp/en/',
  }),
  a({
    id: 'disneysea', city: 'tokyo', interests: ['art'], icon: '🌋', ja: '東京ディズニーシー',
    name: { he: 'טוקיו דיסני-סי', en: 'Tokyo DisneySea' },
    what: { he: 'פארק הדיסני הכי מיוחד בעולם לפי רבים, כולל אזור Fantasy Springs.', en: 'Often called the most special Disney park, with the Fantasy Springs area.' },
    booking: 'book', bookNote: { he: 'כרטיס לתאריך מסוים, מראש באתר או באפליקציה הרשמית.', en: 'Date-specific ticket, in advance on the official site or app.' },
  }),
  a({
    id: 'ghibli-museum', city: 'tokyo', interests: ['games'], icon: '🐈', ja: '三鷹の森ジブリ美術館',
    name: { he: 'מוזיאון ג׳יבלי, מיטאקה', en: 'Ghibli Museum, Mitaka' },
    what: { he: 'המוזיאון של הסטודיו של טוטורו ושל "המסע המופלא". סרט קצר בלעדי בפנים.', en: 'The Totoro and Spirited Away studio\'s museum, with an exclusive short film.' },
    booking: 'hard', bookNote: { he: 'כרטיסים נמכרים ב-10 לחודש שלפני (10:00 שעון יפן) דרך Lawson ונגמרים מהר. לאוקטובר המכירה כבר הייתה, אז בודקים אם נשאר משהו.', en: 'On sale on the 10th of the month before (10:00 JST) via Lawson; sells out fast. October went on sale already, so check what\'s left.' },
    url: 'https://www.ghibli-museum.jp/en/tickets/',
  }),
  a({
    id: 'pokemon-cafe-tokyo', city: 'tokyo', interests: ['games'], icon: '🍰', ja: 'ポケモンカフェ 日本橋',
    name: { he: 'פוקימון קפה, טוקיו', en: 'Pokémon Café Tokyo' },
    what: { he: 'אוכל וקינוחים בעיצוב פוקימון, עם ביקור של פיקאצ׳ו.', en: 'Pokémon-shaped food and desserts, with a Pikachu visit.' },
    booking: 'hard', bookNote: { he: 'חודש שלם נפתח בבת אחת ב-1 לחודש (18:00 שעון יפן) ונגמר בתוך דקות. שווה לבדוק ביטולים, ולוודא באתר שהסניף פתוח.', en: 'A whole month opens on the 1st (18:00 JST) and goes in minutes. Check for cancellations and that the branch is open.' },
    url: 'https://reserve.pokemon-cafe.jp/',
  }),
  a({
    id: 'pokepark', city: 'tokyo', interests: ['games'], icon: '⚡', ja: 'ポケパーク カントー',
    name: { he: 'PokéPark KANTO', en: 'PokéPark KANTO' },
    what: { he: 'פארק הפוקימון הקבוע הראשון, ביומיאורילנד (כ-40 דקות משינג׳וקו). נפתח בפברואר 2026.', en: 'The first permanent Pokémon park, at Yomiuriland (~40 min from Shinjuku). Opened Feb 2026.' },
    booking: 'hard', bookNote: { he: 'כרטיסים בהגרלה באתר הרשמי. בודקים אם יש כרטיסים לתאריכים שלכם.', en: 'Tickets by lottery on the official site; check your dates.' },
    url: 'https://www.pokepark-kanto.co.jp/',
  }),
  a({
    id: 'pokemon-mega', city: 'tokyo', interests: ['games'], icon: '🛍️', ja: 'ポケモンセンターメガトウキョー',
    name: { he: 'פוקימון סנטר מגה טוקיו', en: 'Pokémon Center Mega Tokyo' },
    what: { he: 'החנות הגדולה של פוקימון, בסאנשיין סיטי באיקבוקורו.', en: 'The big Pokémon store, in Sunshine City, Ikebukuro.' },
    booking: 'none', url: 'https://www.pokemon.co.jp/shop/',
  }),
  a({
    id: 'nintendo-tokyo', city: 'tokyo', interests: ['games'], icon: '🍄', ja: 'Nintendo TOKYO 渋谷PARCO',
    name: { he: 'Nintendo TOKYO', en: 'Nintendo TOKYO' },
    what: { he: 'החנות הרשמית של נינטנדו בקניון Parco בשיבויה, עם מוצרים בלעדיים.', en: 'Nintendo\'s official store in Shibuya Parco, with exclusives.' },
    booking: 'none', tip: { he: 'בסופי שבוע יש תור. בבוקר של יום חול הכי נוח.', en: 'Weekend queues; a weekday morning is easiest.' },
    url: 'https://www.nintendo.co.jp/officialstore/',
  }),
  a({
    id: 'gundam', city: 'tokyo', interests: ['games'], icon: '🤖', ja: 'ユニコーンガンダム立像',
    name: { he: 'גאנדאם בגודל אמיתי, אודאיבה', en: 'Life-size Gundam, Odaiba' },
    what: { he: 'פסל יוניקורן גאנדאם ענק מול DiverCity, ו-The Gundam Base בפנים.', en: 'A giant Unicorn Gundam outside DiverCity, with The Gundam Base inside.' },
    booking: 'none', tip: { he: 'בערב הפסל "משתנה" עם אורות.', en: 'In the evening it "transforms" with lights.' },
    url: 'https://www.unicorn-gundam-statue.jp/',
  }),
  a({
    id: 'akihabara', city: 'tokyo', interests: ['arcade', 'games'], icon: '🕹️', ja: '秋葉原',
    name: { he: 'אקיהבארה', en: 'Akihabara' },
    what: { he: 'רובע הגיימינג: ארקיידים של GiGO ו-Taito, חנויות משחקים ואנימה, אלקטרוניקה.', en: 'The gaming district: GiGO and Taito arcades, game and anime shops, electronics.' },
    booking: 'none',
  }),
  a({
    id: 'super-potato', city: 'tokyo', interests: ['arcade'], icon: '👾', ja: 'スーパーポテト 秋葉原店',
    name: { he: 'Super Potato, אקיהבארה', en: 'Super Potato, Akihabara' },
    what: { he: 'חנות משחקי רטרו אגדית על כמה קומות, עם פינת ארקייד ישנה.', en: 'Legendary retro-game shop over several floors, with an old-school arcade corner.' },
    booking: 'none', url: 'https://www.superpotato.com/',
  }),
  a({
    id: 'mikado', city: 'tokyo', interests: ['arcade'], icon: '🥊', ja: 'ゲーセンミカド',
    name: { he: 'Game Center Mikado', en: 'Game Center Mikado' },
    what: { he: 'ארקייד רטרו אגדי בטאקאדנובאבה: מכונות משחק קלאסיות וקרבות Street Fighter.', en: 'Legendary retro arcade in Takadanobaba: classic cabinets and Street Fighter battles.' },
    booking: 'none',
  }),
  a({
    id: 'nakano-broadway', city: 'tokyo', interests: ['games', 'arcade'], icon: '🧸', ja: '中野ブロードウェイ',
    name: { he: 'נאקאנו ברודוויי', en: 'Nakano Broadway' },
    what: { he: 'קניון ישן עם עשרות חנויות אספנות: Mandarake, צעצועים, משחקים ואנימה.', en: 'An old mall packed with collector shops: Mandarake, toys, games and anime.' },
    booking: 'none', url: 'https://www.nakano-broadway.com/',
  }),
  a({
    id: 'gashapon-dept', city: 'tokyo', interests: ['arcade'], icon: '🥚', ja: 'ガシャポンのデパート 池袋総本店',
    name: { he: 'Gashapon Department Store, איקבוקורו', en: 'Gashapon Department Store, Ikebukuro' },
    what: { he: 'אלפי מכונות גאצ׳ה במקום אחד, בסאנשיין סיטי.', en: 'Thousands of capsule-toy machines in one place, in Sunshine City.' },
    booking: 'none', tip: { he: 'להביא הרבה מטבעות של 100 ין (יש גם מכונות החלפה).', en: 'Bring lots of ¥100 coins (there are change machines).' },
    url: 'https://gashapon.jp/shop/',
  }),
  a({
    id: 'round1', city: 'tokyo', interests: ['arcade'], icon: '🎳', ja: 'ラウンドワン スポッチャ',
    name: { he: 'Round1 Spo-Cha', en: 'Round1 Spo-Cha' },
    what: { he: 'כרטיס לזמן קבוע עם הכל כלול: ארקייד, ספורט, באולינג וקריוקי. יש סניפים בכל הערים.', en: 'Timed all-you-can-play: arcade, sports, bowling and karaoke. Branches in every city.' },
    booking: 'none', url: 'https://www.round1.co.jp/',
  }),
  a({
    id: 'senso-ji', city: 'tokyo', interests: ['nature'], icon: '🏮', ja: '浅草寺',
    name: { he: 'מקדש סנסו-ג׳י, אסאקוסה', en: 'Senso-ji, Asakusa' },
    what: { he: 'המקדש העתיק של טוקיו, עם רחוב דוכנים מסורתי.', en: 'Tokyo\'s oldest temple, with a traditional shopping street.' },
    booking: 'none', tip: { he: 'מוקדם בבוקר או בערב, כשהוא מואר, יש פחות אנשים.', en: 'Early morning or lit up at night is calmer.' },
    url: 'https://www.senso-ji.jp/',
  }),
  a({
    id: 'meiji-jingu', city: 'tokyo', interests: ['nature'], icon: '⛩️', ja: '明治神宮',
    name: { he: 'מקדש מייג׳י', en: 'Meiji Jingu' },
    what: { he: 'מקדש שינטו בתוך יער, ממש ליד הראג׳וקו.', en: 'A Shinto shrine in a forest, right next to Harajuku.' },
    booking: 'none', url: 'https://www.meijijingu.or.jp/en/',
  }),
  a({
    id: 'shinjuku-gyoen', city: 'tokyo', interests: ['nature'], icon: '🌳', ja: '新宿御苑',
    name: { he: 'גן שינג׳וקו גיואן', en: 'Shinjuku Gyoen' },
    what: { he: 'גן ענק ושקט עם אזור יפני, צרפתי ואנגלי.', en: 'A huge, calm garden with Japanese, French and English sections.' },
    booking: 'none', url: 'https://www.env.go.jp/garden/shinjukugyoen/english/',
  }),
  // ---------- Hokkaido ----------
  a({
    id: 'asahidake', city: 'hokkaido', interests: ['nature'], icon: '🍁', ja: '旭岳ロープウェイ',
    name: { he: 'רכבל אסאהידאקה', en: 'Asahidake Ropeway' },
    what: { he: 'רכבל אל ההר הגבוה בהוקאידו, בתוך פארק דאיסטסוזאן.', en: 'Ropeway up Hokkaido\'s highest mountain, in Daisetsuzan.' },
    booking: 'none', tip: { he: 'השלכת כאן מהראשונות ביפן (סוף ספטמבר–תחילת אוקטובר). למעלה קר, להביא מעיל.', en: 'Among Japan\'s first autumn colours (late Sep–early Oct). Cold up top: bring a jacket.' },
    url: 'https://asahidake.hokkaido.jp/en/',
  }),
  a({
    id: 'jozankei', city: 'hokkaido', interests: ['nature'], icon: '♨️', ja: '定山渓温泉',
    name: { he: 'אונסן ג׳וזנקיי', en: 'Jozankei Onsen' },
    what: { he: 'עיירת אונסן בעמק, כשעה מסאפורו. יפה במיוחד בשלכת של אוקטובר.', en: 'An onsen town in a valley, about an hour from Sapporo; lovely in October colours.' },
    booking: 'none', url: 'https://www.jozankei.jp/',
  }),
  a({
    id: 'noboribetsu', city: 'hokkaido', interests: ['nature'], icon: '🌋', ja: '登別地獄谷',
    name: { he: 'נובוריבטסו ו"עמק הגיהנום"', en: 'Noboribetsu & Hell Valley' },
    what: { he: 'עמק געשי מעלה אדים ואחת מעיירות האונסן המפורסמות ביפן.', en: 'A steaming volcanic valley and one of Japan\'s best-known onsen towns.' },
    booking: 'none', url: 'https://www.noboribetsu-spa.jp/',
  }),
  a({
    id: 'mt-moiwa', city: 'hokkaido', interests: ['nature'], icon: '🌃', ja: '藻岩山ロープウェイ',
    name: { he: 'הר מויווה, תצפית לילה', en: 'Mt Moiwa night view' },
    what: { he: 'רכבל לתצפית לילה על כל סאפורו.', en: 'Ropeway to a night view over all of Sapporo.' },
    booking: 'none',
  }),
  a({
    id: 'otaru', city: 'hokkaido', interests: ['nature', 'art'], icon: '🎶', ja: '小樽オルゴール堂',
    name: { he: 'אוטארו: התעלה ובית תיבות הנגינה', en: 'Otaru canal & music box museum' },
    what: { he: 'עיר נמל רומנטית: תעלה עם מחסנים ישנים, זכוכית ותיבות נגינה.', en: 'A romantic port town: canal warehouses, glassware and music boxes.' },
    booking: 'none', url: 'https://www.otaru-orgel.co.jp/',
  }),
  a({
    id: 'moerenuma', city: 'hokkaido', interests: ['art', 'nature'], icon: '🔺', ja: 'モエレ沼公園',
    name: { he: 'פארק מוארנומה', en: 'Moerenuma Park' },
    what: { he: 'פארק שכולו פסל אחד ענק, שתכנן איסאמו נוגוצ׳י.', en: 'A whole park designed as one sculpture by Isamu Noguchi.' },
    booking: 'none', url: 'https://moerenumapark.jp/english/',
  }),
  a({
    id: 'sapporo-beer', city: 'hokkaido', interests: ['art'], icon: '🍺', ja: 'サッポロビール博物館',
    name: { he: 'מוזיאון הבירה של סאפורו', en: 'Sapporo Beer Museum' },
    what: { he: 'מבנה לבנים היסטורי, טעימות בירה, ובשכנות מסעדות ג׳ינגיסקן.', en: 'Historic brick hall, beer tasting, and Genghis Khan lamb BBQ next door.' },
    booking: 'none', url: 'https://www.sapporobeer.jp/brewery/s_museum/',
  }),
  a({
    id: 'shiroi-koibito', city: 'hokkaido', interests: ['art'], icon: '🍪', ja: '白い恋人パーク',
    name: { he: 'Shiroi Koibito Park', en: 'Shiroi Koibito Park' },
    what: { he: 'מפעל העוגיות המפורסם של הוקאידו, עם סדנה להכנת עוגיות.', en: 'Hokkaido\'s famous cookie factory, with a make-your-own workshop.' },
    booking: 'none', url: 'https://www.shiroikoibitopark.jp/',
  }),
  a({
    id: 'asahiyama-zoo', city: 'hokkaido', interests: ['nature'], icon: '🐧', ja: '旭山動物園',
    name: { he: 'גן החיות אסאהיאמה', en: 'Asahiyama Zoo' },
    what: { he: 'גן חיות מפורסם באסאהיקאווה, עם פינגווינים, דובי קוטב וכלבי ים מקרוב.', en: 'Famous zoo in Asahikawa: penguins, polar bears and seals up close.' },
    booking: 'none', url: 'https://www.asahiyamazoo.com/',
  }),
  // ---------- Kyoto ----------
  a({
    id: 'nintendo-museum', city: 'kyoto', interests: ['games'], icon: '🎮', ja: 'ニンテンドーミュージアム',
    name: { he: 'מוזיאון נינטנדו, אוג׳י', en: 'Nintendo Museum, Uji' },
    what: { he: 'ההיסטוריה של נינטנדו, מקלפים ועד Switch, עם משחקים אינטראקטיביים ענקיים.', en: 'Nintendo\'s history from playing cards to Switch, with giant interactive games.' },
    booking: 'hard', bookNote: { he: 'הגרלה כשלושה חודשים מראש. כרטיסים שלא נלקחו נמכרים כשבועיים אחרי התוצאות, אז בודקים באתר אם נשאר משהו לאוקטובר.', en: 'Lottery about three months ahead; unclaimed tickets go on sale ~2 weeks after results. Check the site for October leftovers.' },
    url: 'https://museum.nintendo.com/en/index.html',
  }),
  a({
    id: 'nintendo-kyoto', city: 'kyoto', interests: ['games'], icon: '🍄', ja: 'Nintendo KYOTO 京都髙島屋',
    name: { he: 'Nintendo KYOTO', en: 'Nintendo KYOTO' },
    what: { he: 'החנות הרשמית של נינטנדו בכלבו טקאשימאיה בקיוטו.', en: 'Nintendo\'s official store in Kyoto Takashimaya.' },
    booking: 'none', url: 'https://www.nintendo.co.jp/officialstore/',
  }),
  a({
    id: 'fushimi-inari', city: 'kyoto', interests: ['nature'], icon: '⛩️', ja: '伏見稲荷大社',
    name: { he: 'פושימי אינארי', en: 'Fushimi Inari' },
    what: { he: 'אלפי שערי טוריי כתומים לאורך ההר.', en: 'Thousands of orange torii gates up the mountain.' },
    booking: 'none', tip: { he: 'פתוח כל הלילה. מוקדם בבוקר או בערב כמעט אין אנשים.', en: 'Open all night; early morning or evening is nearly empty.' },
    url: 'https://inari.jp/en/',
  }),
  a({
    id: 'kiyomizu', city: 'kyoto', interests: ['nature'], icon: '🏯', ja: '清水寺',
    name: { he: 'קיומיזו-דרה', en: 'Kiyomizu-dera' },
    what: { he: 'מקדש על מרפסת עץ ענקית מעל העיר, עם הסמטאות של היגאשיאמה.', en: 'A temple on a huge wooden stage over the city, with the Higashiyama lanes.' },
    booking: 'none', url: 'https://www.kiyomizudera.or.jp/en/',
  }),
  a({
    id: 'arashiyama', city: 'kyoto', interests: ['nature'], icon: '🎋', ja: '嵐山 竹林の小径',
    name: { he: 'יער הבמבוק, ארשיאמה', en: 'Arashiyama bamboo grove' },
    what: { he: 'שביל בין במבוקים גבוהים, גשר טוגטסוקיו ופארק הקופים.', en: 'A path through tall bamboo, Togetsukyo Bridge and the monkey park.' },
    booking: 'none', tip: { he: 'להגיע לפני 8:00.', en: 'Go before 8 am.' },
  }),
  a({
    id: 'kinkakuji', city: 'kyoto', interests: ['nature'], icon: '✨', ja: '金閣寺',
    name: { he: 'מקדש הביתן הזהוב', en: 'Kinkaku-ji (Golden Pavilion)' },
    what: { he: 'ביתן מצופה זהב מעל בריכה, אחד הסמלים של יפן.', en: 'A gold-leaf pavilion over a pond, an icon of Japan.' },
    booking: 'none',
  }),
  a({
    id: 'eigamura', city: 'kyoto', interests: ['art', 'games'], icon: '🥷', ja: '東映太秦映画村',
    name: { he: 'Toei Kyoto Studio Park', en: 'Toei Kyoto Studio Park' },
    what: { he: 'עיר סרטים של תקופת אדו: סמוראים, נינג׳ות והופעות.', en: 'An Edo-period film town: samurai, ninja and shows.' },
    booking: 'none',
  }),
  a({
    id: 'tea-ceremony', city: 'kyoto', interests: ['art'], icon: '🍵', ja: '茶道体験 京都',
    name: { he: 'טקס תה או השכרת קימונו', en: 'Tea ceremony or kimono rental' },
    what: { he: 'חוויה של שעה עם מדריך. מתאים לזוג בירח דבש.', en: 'An hour-long guided experience; a lovely honeymoon moment.' },
    booking: 'book', bookNote: { he: 'מזמינים יום-יומיים מראש באתרי חוויות או ישירות מול המקום.', en: 'Book a day or two ahead on experience sites or directly.' },
  }),
  // ---------- Osaka ----------
  a({
    id: 'usj', city: 'osaka', interests: ['games'], icon: '🍄', ja: 'ユニバーサル・スタジオ・ジャパン',
    name: { he: 'יוניברסל ג׳פן + Super Nintendo World', en: 'Universal Studios Japan + Super Nintendo World' },
    what: { he: 'עולם מריו, מריו קארט ומתחם Donkey Kong Country עם רכבת המכרות.', en: 'Mario\'s world, Mario Kart, and Donkey Kong Country with the mine-cart ride.' },
    booking: 'hard', bookNote: { he: 'להזמין עכשיו: כרטיס לתאריך, ו-Express Pass שכולל כניסה ל-Super Nintendo World (נמכר עד 60 יום מראש ונגמר). בלי זה הכניסה לעולם של מריו לא מובטחת.', en: 'Book now: a dated ticket plus an Express Pass that includes Super Nintendo World (on sale up to 60 days ahead, sells out). Without it, entry to Mario\'s world isn\'t guaranteed.' },
    url: 'https://www.usj.co.jp/web/en/us',
  }),
  a({
    id: 'pokemon-cafe-osaka', city: 'osaka', interests: ['games'], icon: '🍰', ja: 'ポケモンカフェ 心斎橋',
    name: { he: 'פוקימון קפה, אוסקה', en: 'Pokémon Café Osaka' },
    what: { he: 'בקניון דאימרו בשינסאייבאשי, יחד עם פוקימון סנטר.', en: 'In Daimaru Shinsaibashi, next to a Pokémon Center.' },
    booking: 'hard', bookNote: { he: 'כמו בטוקיו: חודש שלם נפתח ב-1 לחודש (18:00 שעון יפן). בודקים ביטולים.', en: 'Like Tokyo: a whole month opens on the 1st (18:00 JST). Check for cancellations.' },
    url: 'https://osaka.pokemon-cafe.jp/',
  }),
  a({
    id: 'nintendo-osaka', city: 'osaka', interests: ['games'], icon: '🍄', ja: 'Nintendo OSAKA 大丸梅田',
    name: { he: 'Nintendo OSAKA', en: 'Nintendo OSAKA' },
    what: { he: 'החנות הרשמית של נינטנדו בדאימרו אומדה.', en: 'Nintendo\'s official store in Daimaru Umeda.' },
    booking: 'none', url: 'https://www.nintendo.co.jp/officialstore/',
  }),
  a({
    id: 'den-den-town', city: 'osaka', interests: ['arcade', 'games'], icon: '👾', ja: '日本橋 でんでんタウン',
    name: { he: 'Den Den Town, ניפונבאשי', en: 'Den Den Town, Nipponbashi' },
    what: { he: '"האקיהבארה של אוסקה": משחקי רטרו, אנימה, פיגרים וארקיידים.', en: 'Osaka\'s Akihabara: retro games, anime, figures and arcades.' },
    booking: 'none',
  }),
  a({
    id: 'shinsekai', city: 'osaka', interests: ['arcade', 'art'], icon: '🗼', ja: '新世界',
    name: { he: 'שינסקאי', en: 'Shinsekai' },
    what: { he: 'שכונה רטרו מסביב למגדל צוטנקאקו, עם ארקיידים ישנים וקושיקאצו.', en: 'A retro district around Tsutenkaku tower: old arcades and kushikatsu.' },
    booking: 'none',
  }),
  a({
    id: 'dotonbori', city: 'osaka', interests: ['art'], icon: '🦀', ja: '道頓堀',
    name: { he: 'דוטונבורי', en: 'Dotonbori' },
    what: { he: 'תעלה מוארת בשלטי ענק ואוכל רחוב (טאקויאקי, אוקונומיאקי). הכי יפה בלילה.', en: 'A canal of giant neon signs and street food (takoyaki, okonomiyaki). Best at night.' },
    booking: 'none',
  }),
  a({
    id: 'umeda-sky', city: 'osaka', interests: ['art'], icon: '🌇', ja: '梅田スカイビル 空中庭園展望台',
    name: { he: 'Umeda Sky Building', en: 'Umeda Sky Building' },
    what: { he: 'מרפסת תצפית עגולה ופתוחה בין שני מגדלים. מושלם בשקיעה.', en: 'An open, circular sky deck between two towers; perfect at sunset.' },
    booking: 'none', url: 'https://www.skybldg.co.jp/en/',
  }),
  a({
    id: 'kaiyukan', city: 'osaka', interests: ['nature'], icon: '🦈', ja: '海遊館',
    name: { he: 'אקווריום קאיוקאן', en: 'Kaiyukan Aquarium' },
    what: { he: 'אחד האקווריומים הגדולים בעולם, עם כריש לווייתני.', en: 'One of the world\'s biggest aquariums, with a whale shark.' },
    booking: 'none', tip: { he: 'כרטיס באתר חוסך את התור בקופה.', en: 'An online ticket skips the ticket queue.' },
    url: 'https://www.kaiyukan.com/language/eng/',
  }),
  a({
    id: 'osaka-castle', city: 'osaka', interests: ['nature'], icon: '🏯', ja: '大阪城',
    name: { he: 'טירת אוסקה', en: 'Osaka Castle' },
    what: { he: 'טירה עם פארק ענק מסביב, ותצפית מהקומה העליונה.', en: 'A castle in a huge park, with a view from the top floor.' },
    booking: 'none', url: 'https://www.osakacastle.net/english/',
  }),
]
