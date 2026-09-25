import type { Bi } from './guide'

/** Word kinds. A frame lists the kinds that make sense in its slot. */
export type WordType =
  | 'place'
  | 'pointer-place'
  | 'this'
  | 'thing'
  | 'food'
  | 'drink'
  | 'ingredient'
  | 'body'
  | 'belonging'
  | 'usable'
  | 'sight'
  | 'fixture'
  | 'rentable'
  | 'amenity'
  | 'vehicle'
  | 'request'
  | 'may-i'
  | 'works'
  | 'city'
  | 'allergen'
  | 'event'
  | 'person'
  | 'game'
  | 'electronic'
  | 'fashion'
  | 'cosmetic'
  | 'size'
  | 'adjective'
  | 'machine'
  | 'craft'
  | 'borrowable'
  | 'custom'

export type PatternGroup = 'around' | 'order' | 'shopping' | 'requests' | 'problems'

/**
 * A sentence frame. `{N}` is the noun; `{C}` the count (only with `count: true`).
 * Hebrew/English templates pick the noun form: {he} / {he_def}, {en} / {a} / {the}.
 */
export interface Pattern {
  id: string
  group: PatternGroup
  accepts: WordType[]
  count?: boolean
  /** Word ids that have an accepted type but make a nonsense sentence in this frame. */
  exclude?: string[]
  /** Word ids accepted even though none of their types is (a single pointer word, say). */
  include?: string[]
  /** Counter for {C} when the frame, not the word, decides it (tickets to a city). */
  counter?: 'tsu' | 'mai'
  label: Bi
  /** Extra search words (synonyms in both languages) for the type-ahead. */
  keywords?: string
  ja: string
  kana: string
  romaji: string
  he_pron: string
  he: string
  en: string
}

const PLACES: WordType[] = ['place', 'pointer-place', 'city', 'custom']
const GOODS: WordType[] = ['food', 'drink', 'thing', 'this', 'game', 'electronic', 'fashion', 'cosmetic']
/** Things you'd shop for in a store rather than order at a table. */
const MERCH: WordType[] = ['this', 'thing', 'game', 'electronic', 'fashion', 'cosmetic', 'craft']

// Word groups used to keep nonsense out of frames (see the `exclude` lists below).
/** Spots inside a station/building: you ask where they are, you don't take a taxi to them. */
const SPOTS = ['toilet', 'exit', 'entrance', 'elevator', 'lockers', 'atm', 'ticket-office', 'shinkansen', 'smoking-area', 'trash-can', 'taxi-stand', 'bus-stop']
/** Whole cities / regions: not somewhere you walk to or ask "where is". */
const REGIONS = ['tokyo', 'yokohama', 'kyoto', 'osaka', 'nara', 'kobe', 'hiroshima', 'sapporo', 'otaru', 'hakodate', 'niseko', 'furano', 'biei']
const AIRPORTS = ['airport', 'narita', 'haneda', 'kansai-airport', 'new-chitose']
/** Small shops and services: a bus or train doesn't "go to" them. */
const SHOPS = ['konbini', 'pharmacy', 'cafe', 'izakaya', 'ramen-shop', 'sushi-shop', 'bar', 'karaoke', 'drugstore', 'laundromat', 'bank', 'exchange', 'game-center', 'vintage-shop', 'anime-shop', 'electronics-store', 'used-game-shop', 'record-shop', 'cosmetics-shop', 'bookstore', 'supermarket', 'hundred-yen', 'post-office', 'koban', 'restaurant', 'tourist-info', 'depachika', 'flea-market']
/** Places without opening hours. */
const NO_HOURS = ['station', 'subway', 'airport', 'hotel', 'toilet', 'bus-stop', 'taxi-stand', 'shinkansen', 'exit', 'entrance', 'elevator', 'lockers', 'koban', 'shopping-street', 'smoking-area', 'trash-can', 'konbini', 'nara-park', 'fushimi-inari']
/** Table and counter items that are free or just part of the service. */
const SERVICE_ITEMS = ['english-menu', 'oshibori', 'receipt', 'chopsticks', 'fork', 'spoon', 'hot-water', 'map', 'plastic-bag', 'paper-bag']
/** Everyday supplies that nobody haggles over, compares or checks for stock. */
const SUPPLIES = [...SERVICE_ITEMS, 'ticket', 'reserved-ticket', 'tissues', 'plaster', 'stamp', 'postcard', 'towel', 'blanket', 'pillow', 'slippers', 'toothbrush', 'toothpaste', 'batteries']
const SWEETS = ['matcha-ice', 'dessert', 'mochi', 'melon', 'ice-cream', 'taiyaki', 'dango', 'crepe', 'parfait', 'cheesecake', 'melon-pan', 'fruit-sando', 'soft-serve', 'okashi', 'kitkat']
const PLAIN_FOODS = ['rice', 'miso-soup', 'uni', 'ikura', 'maguro', 'hotate', 'sashimi', 'crab', 'wagyu', 'sukiyaki', 'shabu-shabu', 'unagi', 'tempura', 'sushi', 'tonkatsu']
const PLAIN_DRINKS = ['water', 'hot-water', 'sparkling-water']
/** Collectibles and media: no plug, no region lock. */
const UNPLUGGED = ['pokemon-cards', 'trading-cards', 'figure', 'manga', 'anime-goods', 'plush', 'gacha', 'model-kit', 'record', 'lens', 'film-camera', 'batteries', 'sd-card', 'headphones', 'earphones', 'controller']

export const PATTERNS: Pattern[] = [
  {
    id: 'where', group: 'around',
    exclude: REGIONS,
    keywords: 'find location where מיקום איפה נמצא', accepts: ['place', 'city', 'custom'],
    label: { he: 'איפה …?', en: 'Where is …?' },
    ja: '{N}はどこですか', kana: '{N}はどこですか', romaji: '{N} wa doko desu ka', he_pron: '{N} וה דוקו דס קה',
    he: 'איפה {he_def}?', en: 'Where is {the}?',
  },
  {
    id: 'nearby', group: 'around', accepts: ['place'],
    exclude: ['airport', 'shinkansen', 'exit', 'entrance'],
    label: { he: 'יש … קרוב?', en: 'Is there a … nearby?' },
    ja: '近くに{N}はありますか', kana: 'ちかくに{N}はありますか', romaji: 'chikaku ni {N} wa arimasu ka', he_pron: 'צ\'יקאקו ני {N} וה ארימאס קה',
    he: 'יש {he} קרוב?', en: 'Is there {a} nearby?',
  },
  {
    id: 'go-to', group: 'around', accepts: PLACES,
    exclude: ['exit', 'entrance', 'elevator', 'lockers', 'trash-can', 'smoking-area', 'taxi-stand', 'ticket-office', 'atm'],
    label: { he: 'רוצים להגיע אל …', en: 'We want to go to …' },
    ja: '{N}に行きたいです', kana: '{N}にいきたいです', romaji: '{N} ni ikitai desu', he_pron: '{N} ני איקיטאי דס',
    he: 'אנחנו רוצים להגיע אל {he_def}', en: 'We want to go to {the}',
  },
  {
    id: 'how-get', group: 'around',
    exclude: ['trash-can'],
    keywords: 'directions way route get to כיוונים דרך להגיע', accepts: PLACES,
    label: { he: 'איך מגיעים עד …?', en: 'How do we get to …?' },
    ja: '{N}までどうやって行けばいいですか', kana: '{N}までどうやっていけばいいですか', romaji: '{N} made dou yatte ikeba ii desu ka', he_pron: '{N} מאדה דו יאטה איקבה אי דס קה',
    he: 'איך מגיעים עד {he_def}?', en: 'How do we get to {the}?',
  },
  {
    id: 'taxi', group: 'around',
    exclude: [...SPOTS, ...REGIONS, 'koban', 'konbini', 'atm'],
    keywords: 'taxi cab drive מונית נהג', accepts: PLACES,
    label: { he: 'עד …, בבקשה (מונית)', en: 'To …, please (taxi)' },
    ja: '{N}までお願いします', kana: '{N}までおねがいします', romaji: '{N} made onegaishimasu', he_pron: '{N} מאדה אונגאי שימאס',
    he: 'עד {he_def}, בבקשה', en: 'To {the}, please',
  },
  {
    id: 'far', group: 'around', accepts: PLACES,
    exclude: ['trash-can', 'smoking-area', 'exit', 'entrance', 'elevator'],
    label: { he: 'כמה רחוק …?', en: 'Is … far?' },
    ja: '{N}まで遠いですか', kana: '{N}までとおいですか', romaji: '{N} made tooi desu ka', he_pron: '{N} מאדה טואי דס קה',
    he: 'זה רחוק עד {he_def}?', en: 'Is it far to {the}?',
  },
  {
    id: 'how-long', group: 'around', accepts: PLACES,
    exclude: SPOTS,
    label: { he: 'כמה זמן לוקח עד …?', en: 'How long to get to …?' },
    ja: '{N}までどのくらいかかりますか', kana: '{N}までどのくらいかかりますか', romaji: '{N} made dono kurai kakarimasu ka', he_pron: '{N} מאדה דונו קוראי קאקארימאס קה',
    he: 'כמה זמן לוקח להגיע עד {he_def}?', en: 'How long does it take to get to {the}?',
  },
  {
    id: 'does-this-go', group: 'around', accepts: PLACES,
    exclude: [...SPOTS, ...SHOPS],
    label: { he: 'זה נוסע עד …?', en: 'Does this go to …?' },
    ja: 'これは{N}に行きますか', kana: 'これは{N}にいきますか', romaji: 'kore wa {N} ni ikimasu ka', he_pron: 'קורה וה {N} ני איקימאס קה',
    he: 'זה (הרכבת/האוטובוס) נוסע עד {he_def}?', en: 'Does this (train/bus) go to {the}?',
  },
  {
    id: 'opens', group: 'around', accepts: ['place', 'custom'],
    exclude: NO_HOURS,
    label: { he: 'מתי פותחים את …?', en: 'When does … open?' },
    ja: '{N}は何時に開きますか', kana: '{N}はなんじにあきますか', romaji: '{N} wa nanji ni akimasu ka', he_pron: '{N} וה נאנג\'י ני אקימאס קה',
    he: 'באיזו שעה פותחים את {he_def}?', en: 'What time does {the} open?',
  },
  {
    id: 'closes', group: 'around', accepts: ['place', 'custom'],
    exclude: NO_HOURS,
    label: { he: 'מתי סוגרים את …?', en: 'When does … close?' },
    ja: '{N}は何時に閉まりますか', kana: '{N}はなんじにしまりますか', romaji: '{N} wa nanji ni shimarimasu ka', he_pron: '{N} וה נאנג\'י ני שימארימאס קה',
    he: 'באיזו שעה סוגרים את {he_def}?', en: 'What time does {the} close?',
  },

  {
    id: 'next', group: 'around', accepts: ['vehicle'],
    label: { he: 'מתי ה… הבא?', en: 'When is the next …?' },
    ja: '次の{N}は何時ですか', kana: 'つぎの{N}はなんじですか', romaji: 'tsugi no {N} wa nanji desu ka', he_pron: 'צוגי נו {N} וה נאנג\'י דס קה',
    he: 'מתי היציאה הבאה של {he_def}?', en: 'What time is the next {en}?',
  },
  {
    id: 'leaves-from', group: 'around', accepts: ['vehicle'],
    label: { he: 'מאיפה עולים על …?', en: 'Where does … leave from?' },
    ja: '{N}はどこから出ますか', kana: '{N}はどこからでますか', romaji: '{N} wa doko kara demasu ka', he_pron: '{N} וה דוקו קארה דמאס קה',
    he: 'מאיפה עולים על {he_def}?', en: 'Where does {the} leave from?',
  },
  {
    id: 'know', group: 'around', accepts: ['pointer-place', 'city', 'custom'],
    include: ['this'],
    exclude: [...REGIONS, ...AIRPORTS],
    label: { he: 'אתם מכירים את …?', en: 'Do you know …?' },
    ja: '{N}を知っていますか', kana: '{N}をしっていますか', romaji: '{N} o shitte imasu ka', he_pron: '{N} או שיטה אימאס קה',
    he: 'אתם מכירים את {he_def}?', en: 'Do you know {the}?',
  },

  {
    id: 'walk', group: 'around', accepts: [...PLACES, 'sight'],
    exclude: [...SPOTS, ...REGIONS, ...AIRPORTS],
    label: { he: 'אפשר ללכת ברגל עד …?', en: 'Can we walk to …?' },
    ja: '{N}まで歩いて行けますか', kana: '{N}まであるいていけますか', romaji: '{N} made aruite ikemasu ka', he_pron: '{N} מאדה אארויטה איקמאס קה',
    he: 'אפשר ללכת ברגל עד {he_def}?', en: 'Can we walk to {the}?',
  },
  {
    id: 'platform-for', group: 'around', accepts: ['city', 'custom'],
    exclude: ['kiyomizu', 'nara-park', 'dotonbori'],
    label: { he: 'מאיזה רציף לכיוון …?', en: 'Which platform for …?' },
    ja: '{N}行きは何番線ですか', kana: '{N}いきはなんばんせんですか', romaji: '{N} iki wa nanbansen desu ka', he_pron: '{N} איקי וה נאנבאנסן דס קה',
    he: 'מאיזה רציף יוצאים לכיוון {he_def}?', en: 'Which platform for trains to {the}?',
  },
  {
    id: 'ticket-to', group: 'around',
    exclude: ['kiyomizu', 'nara-park', 'dotonbori'],
    keywords: 'ticket train buy כרטיס רכבת לקנות', accepts: ['city', 'custom'], count: true, counter: 'mai',
    label: { he: 'כרטיס עד …', en: 'Ticket to …' },
    ja: '{N}までの切符を{C}お願いします', kana: '{N}までのきっぷを{C}おねがいします', romaji: '{N} made no kippu o {C} onegaishimasu', he_pron: '{N} מאדה נו קיפו או {C} אונגאי שימאס',
    he: 'כרטיס ×{n} עד {he_def}, בבקשה', en: 'Tickets ×{n} to {the}, please',
  },
  {
    id: 'open-today', group: 'around', accepts: ['place', 'sight', 'custom'],
    exclude: NO_HOURS,
    label: { he: '… פתוח היום?', en: 'Is … open today?' },
    ja: '{N}は今日開いていますか', kana: '{N}はきょうあいていますか', romaji: '{N} wa kyou aite imasu ka', he_pron: '{N} וה קיו אאיטה אימאס קה',
    he: '{he_def} – פתוח היום?', en: 'Is {the} open today?',
  },
  {
    id: 'what-time', group: 'around',
    keywords: 'time when hour שעה מתי', accepts: ['event'],
    label: { he: 'באיזו שעה …?', en: 'What time is …?' },
    ja: '{N}は何時ですか', kana: '{N}はなんじですか', romaji: '{N} wa nanji desu ka', he_pron: '{N} וה נאנג\'י דס קה',
    he: 'באיזו שעה {he_def}?', en: 'What time is {the}?',
  },

  {
    id: 'please', group: 'order',
    exclude: ['souvenir', 'vintage-item', 'anime-goods', 'gacha', 'map'],
    keywords: 'order want give me הזמנה רוצה תנו', accepts: GOODS,
    label: { he: '…, בבקשה', en: '…, please' },
    ja: '{N}をお願いします', kana: '{N}をおねがいします', romaji: '{N} o onegaishimasu', he_pron: '{N} או אונגאי שימאס',
    he: '{he}, בבקשה', en: '{En}, please',
  },
  {
    id: 'count', group: 'order', accepts: GOODS, count: true,
    exclude: ['souvenir', 'vintage-item', 'anime-goods', 'gacha', 'map', 'english-menu', 'receipt', 'hot-water'],
    label: { he: '… × כמות, בבקשה', en: '… × number, please' },
    ja: '{N}を{C}お願いします', kana: '{N}を{C}おねがいします', romaji: '{N} o {C} onegaishimasu', he_pron: '{N} או {C} אונגאי שימאס',
    he: '{he} ×{n}, בבקשה', en: '{En} ×{n}, please',
  },
  {
    id: 'have', group: 'order', accepts: [...GOODS, 'size'],
    exclude: ['ticket', 'reserved-ticket', 'receipt'],
    label: { he: 'יש לכם …?', en: 'Do you have …?' },
    ja: '{N}はありますか', kana: '{N}はありますか', romaji: '{N} wa arimasu ka', he_pron: '{N} וה ארימאס קה',
    he: 'יש לכם {he}?', en: 'Do you have {a}?',
  },
  {
    id: 'how-much', group: 'order',
    exclude: [...SERVICE_ITEMS.filter((w) => w !== 'plastic-bag'), 'hot-water'],
    keywords: 'price cost how much מחיר עולה עלות כמה', accepts: GOODS,
    label: { he: 'כמה עולה …?', en: 'How much is …?' },
    ja: '{N}はいくらですか', kana: '{N}はいくらですか', romaji: '{N} wa ikura desu ka', he_pron: '{N} וה איקורה דס קה',
    he: 'מה המחיר של {he_def}?', en: 'How much is {the}?',
  },
  {
    id: 'buy-where', group: 'shopping', accepts: ['thing', 'drink', 'this', 'game', 'electronic', 'fashion', 'cosmetic'],
    exclude: [...SERVICE_ITEMS, 'draft-beer', 'hot-sake', 'gacha'],
    label: { he: 'איפה קונים …?', en: 'Where can I buy …?' },
    ja: '{N}はどこで買えますか', kana: '{N}はどこでかえますか', romaji: '{N} wa doko de kaemasu ka', he_pron: '{N} וה דוקו דה קאאמאס קה',
    he: 'איפה אפשר לקנות {he}?', en: 'Where can I buy {a}?',
  },
  {
    id: 'without', group: 'order', accepts: ['ingredient'],
    label: { he: 'בלי …, בבקשה', en: 'No …, please' },
    ja: '{N}抜きでお願いします', kana: '{N}ぬきでおねがいします', romaji: '{N} nuki de onegaishimasu', he_pron: '{N} נוקי דה אונגאי שימאס',
    he: 'בלי {he}, בבקשה', en: 'No {en}, please',
  },
  {
    id: 'contains', group: 'order', accepts: ['ingredient'],
    exclude: ['ice'],
    label: { he: 'יש בזה …?', en: 'Is there … in this?' },
    ja: 'これに{N}は入っていますか', kana: 'これに{N}ははいっていますか', romaji: 'kore ni {N} wa haitte imasu ka', he_pron: 'קורה ני {N} וה האיטה אימאס קה',
    he: 'יש בזה {he}?', en: 'Is there {en} in this?',
  },
  {
    id: 'can-use', group: 'order', accepts: ['usable'],
    label: { he: 'אפשר להשתמש כאן ב…?', en: 'Can I use … here?' },
    ja: 'ここで{N}は使えますか', kana: 'ここで{N}はつかえますか', romaji: 'koko de {N} wa tsukaemasu ka', he_pron: 'קוקו דה {N} וה צוקאאמאס קה',
    he: 'אפשר להשתמש כאן ב{he}?', en: 'Can I use {a} here?',
  },

  {
    id: 'can-i-have', group: 'order', accepts: ['food', 'drink', 'thing', 'this', 'amenity'],
    exclude: ['wifi', 'umbrella', 'charger', 'adapter', 'sim', 'souvenir', 'kitchen-knife', 'tea-cup', 'sake-cup', 'folding-fan', 'furoshiki', 'tenugui', 'chopsticks-set', 'matcha-powder', 'stamp', 'postcard', 'ticket', 'reserved-ticket'],
    label: { he: 'אפשר לקבל …?', en: 'Can I have …?' },
    ja: '{N}をもらえますか', kana: '{N}をもらえますか', romaji: '{N} o moraemasu ka', he_pron: '{N} או מוראאמאס קה',
    he: 'אפשר לקבל {he}?', en: 'Can I have {a}?',
  },
  {
    id: 'show-me', group: 'order', accepts: ['thing', 'this'],
    exclude: ['tissues', 'plaster', 'painkiller', 'cold-medicine', 'stomach-medicine', 'cough-medicine', 'motion-sickness', 'receipt', 'chopsticks', 'fork', 'spoon', 'oshibori', 'plastic-bag', 'paper-bag', 'towel', 'blanket', 'pillow', 'slippers', 'toothbrush', 'toothpaste', 'ticket', 'reserved-ticket', 'stamp', 'postcard', 'mask', 'eye-drops'],
    label: { he: 'אפשר לראות את …?', en: 'Can you show me …?' },
    ja: '{N}を見せてもらえますか', kana: '{N}をみせてもらえますか', romaji: '{N} o misete moraemasu ka', he_pron: '{N} או מיסטה מוראאמאס קה',
    he: 'תוכלו להראות לי את {he_def}?', en: 'Could you show me {the}?',
  },
  {
    id: 'recommend', group: 'order', accepts: ['food', 'drink', 'sight', 'cosmetic', 'game'],
    exclude: [...PLAIN_DRINKS, 'rice', 'cola', 'juice', 'controller'],
    label: { he: 'המלצה על …?', en: 'Any … you recommend?' },
    ja: 'おすすめの{N}はありますか', kana: 'おすすめの{N}はありますか', romaji: 'osusume no {N} wa arimasu ka', he_pron: 'אוסוסומה נו {N} וה ארימאס קה',
    he: 'יש לכם המלצה על {he}?', en: 'Is there {a} you recommend?',
  },
  {
    id: 'rent-price', group: 'order',
    keywords: 'rent rental hire price השכרה להשכיר שכירות מחיר', accepts: ['rentable'],
    label: { he: 'כמה עולה לשכור …?', en: 'How much to rent …?' },
    ja: '{N}のレンタルはいくらですか', kana: '{N}のレンタルはいくらですか', romaji: '{N} no rentaru wa ikura desu ka', he_pron: '{N} נו רנטארו וה איקורה דס קה',
    he: 'כמה עולה לשכור {he}?', en: 'How much is it to rent {a}?',
  },
  {
    id: 'rent-where', group: 'order',
    keywords: 'rent rental hire השכרה להשכיר שכירות', accepts: ['rentable'],
    label: { he: 'איפה אפשר לשכור …?', en: 'Where can I rent …?' },
    ja: '{N}はどこで借りられますか', kana: '{N}はどこでかりられますか', romaji: '{N} wa doko de kariraremasu ka', he_pron: '{N} וה דוקו דה קארירארמאס קה',
    he: 'איפה אפשר לשכור {he}?', en: 'Where can I rent {a}?',
  },
  {
    id: 'included', group: 'order', accepts: ['amenity'],
    exclude: ['blanket', 'pillow'],
    label: { he: '… כלול?', en: 'Is … included?' },
    ja: '{N}は付いていますか', kana: '{N}はついていますか', romaji: '{N} wa tsuite imasu ka', he_pron: '{N} וה צויטה אימאס קה',
    he: 'זה כולל {he}?', en: 'Is {a} included?',
  },

  {
    id: 'take-this', group: 'order', accepts: GOODS,
    exclude: SUPPLIES,
    label: { he: 'ניקח …', en: "We'll have …" },
    ja: '{N}にします', kana: '{N}にします', romaji: '{N} ni shimasu', he_pron: '{N} ני שימאס',
    he: 'ניקח {he}', en: "We'll have {a}",
  },
  {
    id: 'spicy', group: 'order', accepts: ['food', 'this'],
    exclude: [...SWEETS, ...PLAIN_FOODS],
    label: { he: '… חריף?', en: 'Is … spicy?' },
    ja: '{N}は辛いですか', kana: '{N}はからいですか', romaji: '{N} wa karai desu ka', he_pron: '{N} וה קאראי דס קה',
    he: '{he_def} חריף?', en: 'Is {the} spicy?',
  },
  {
    id: 'allergy', group: 'order',
    keywords: 'allergy allergic אלרגיה אלרגי', accepts: ['allergen'],
    label: { he: 'יש לי אלרגיה ל…', en: "I'm allergic to …" },
    ja: '{N}アレルギーがあります', kana: '{N}アレルギーがあります', romaji: '{N} arerugii ga arimasu', he_pron: '{N} ארורגי גה ארימאס',
    he: 'יש לי אלרגיה ל{he}', en: "I'm allergic to {en}",
  },

  {
    id: 'popular', group: 'shopping', accepts: ['food', 'drink', 'thing', 'game', 'fashion', 'cosmetic'],
    exclude: [...SUPPLIES, ...PLAIN_DRINKS, 'umbrella', 'charger', 'adapter', 'sim', 'painkiller', 'cold-medicine', 'stomach-medicine', 'cough-medicine', 'motion-sickness', 'mask', 'rice', 'controller'],
    keywords: 'popular best seller famous פופולרי נמכר',
    label: { he: 'איזה … הכי פופולרי?', en: 'Most popular …?' },
    ja: '一番人気の{N}はどれですか', kana: 'いちばんにんきの{N}はどれですか', romaji: 'ichiban ninki no {N} wa dore desu ka', he_pron: 'איצ\'יבאן נינקי נו {N} וה דורה דס קה',
    he: 'איזה {he} הכי פופולרי כאן?', en: 'Which {en} is the most popular?',
  },
  {
    id: 'in-stock', group: 'shopping', accepts: MERCH,
    exclude: SUPPLIES,
    keywords: 'stock available מלאי',
    label: { he: 'יש … במלאי?', en: 'Is … in stock?' },
    ja: '{N}の在庫はありますか', kana: '{N}のざいこはありますか', romaji: '{N} no zaiko wa arimasu ka', he_pron: '{N} נו זאיקו וה ארימאס קה',
    he: 'יש {he} במלאי?', en: 'Do you have {a} in stock?',
  },
  {
    id: 'other-one', group: 'shopping', accepts: ['adjective'],
    keywords: 'another different other one עוד אחר משהו',
    label: { he: 'יש משהו …?', en: 'Do you have a … one?' },
    ja: 'もっと{N}のはありますか', kana: 'もっと{N}のはありますか', romaji: 'motto {N} no wa arimasu ka', he_pron: 'מוטו {N} נו וה ארימאס קה',
    he: 'יש משהו {he}?', en: 'Do you have a {en} one?',
  },
  {
    id: 'cheaper', group: 'shopping', accepts: ['this', 'game', 'electronic', 'fashion'],
    include: ['kitchen-knife', 'tea-cup'],
    exclude: ['charger', 'power-bank', 'sd-card', 'batteries', 'gacha', 'socks', 'earphones'],
    keywords: 'discount cheaper bargain price הנחה זול מחיר',
    label: { he: 'אפשר הנחה על …?', en: 'Discount on …?' },
    ja: '{N}はもう少し安くなりますか', kana: '{N}はもうすこしやすくなりますか', romaji: '{N} wa mou sukoshi yasuku narimasu ka', he_pron: '{N} וה מו סוקושי יאסוקו נארימאס קה',
    he: 'אפשר קצת הנחה על {he_def}?', en: 'Could {the} be a little cheaper?',
  },
  {
    id: 'tax-included', group: 'shopping', accepts: MERCH,
    exclude: SUPPLIES,
    keywords: 'tax price included מס מחיר כולל',
    label: { he: 'המחיר של … כולל מס?', en: 'Is tax included for …?' },
    ja: '{N}は税込みですか', kana: '{N}はぜいこみですか', romaji: '{N} wa zeikomi desu ka', he_pron: '{N} וה זייקומי דס קה',
    he: 'המחיר של {he_def} כולל מס?', en: 'Does the price of {the} include tax?',
  },
  {
    id: 'used', group: 'shopping', accepts: ['this', 'game', 'electronic', 'fashion'],
    exclude: ['socks', 'batteries', 'sd-card', 'charger', 'power-bank', 'gacha', 'earphones'],
    keywords: 'used second hand pre-owned vintage משומש יד שנייה',
    label: { he: '… יד שנייה?', en: 'Is … second-hand?' },
    ja: '{N}は中古ですか', kana: '{N}はちゅうこですか', romaji: '{N} wa chuuko desu ka', he_pron: '{N} וה צ\'וקו דס קה',
    he: '{he_def} – יד שנייה?', en: 'Is {the} second-hand?',
  },
  {
    id: 'brand-new', group: 'shopping', accepts: ['this', 'game', 'electronic', 'fashion'],
    exclude: ['socks', 'batteries', 'sd-card', 'gacha'],
    keywords: 'new unused sealed חדש באריזה',
    label: { he: '… חדש באריזה?', en: 'Is … brand new?' },
    ja: '{N}は新品ですか', kana: '{N}はしんぴんですか', romaji: '{N} wa shinpin desu ka', he_pron: '{N} וה שינפין דס קה',
    he: '{he_def} – חדש באריזה?', en: 'Is {the} brand new?',
  },
  {
    id: 'works-abroad', group: 'shopping', accepts: ['electronic', 'game'],
    exclude: UNPLUGGED,
    keywords: 'abroad overseas region voltage israel חול ישראל מתח',
    label: { he: '… עובד גם בחו״ל?', en: 'Does … work outside Japan?' },
    ja: '{N}は海外でも使えますか', kana: '{N}はかいがいでもつかえますか', romaji: '{N} wa kaigai demo tsukaemasu ka', he_pron: '{N} וה קאיגאי דמו צוקאאמאס קה',
    he: 'אפשר להשתמש ב{he} גם מחוץ ליפן?', en: 'Does {the} work outside Japan?',
  },
  {
    id: 'sensitive-skin', group: 'shopping', accepts: ['cosmetic'],
    exclude: ['perfume', 'nail-polish', 'hair-oil'],
    keywords: 'skin sensitive עור רגיש',
    label: { he: '… מתאים לעור רגיש?', en: '… for sensitive skin?' },
    ja: '{N}は敏感肌でも使えますか', kana: '{N}はびんかんはだでもつかえますか', romaji: '{N} wa binkanhada demo tsukaemasu ka', he_pron: '{N} וה בינקאנהאדה דמו צוקאאמאס קה',
    he: 'אפשר להשתמש ב{he} עם עור רגיש?', en: 'Is {the} OK for sensitive skin?',
  },
  {
    id: 'tester', group: 'shopping', accepts: ['cosmetic'],
    exclude: ['sheet-mask'],
    keywords: 'tester try sample טסטר דוגמית לנסות',
    label: { he: 'יש טסטר של …?', en: 'Is there a tester for …?' },
    ja: '{N}のテスターはありますか', kana: '{N}のテスターはありますか', romaji: '{N} no tesutaa wa arimasu ka', he_pron: '{N} נו טסוטה וה ארימאס קה',
    he: 'יש טסטר של {he}?', en: 'Is there a tester for {the}?',
  },
  {
    id: 'how-to-use', group: 'shopping', accepts: ['machine', 'cosmetic', 'electronic'],
    exclude: ['batteries', 'sd-card', 'headphones', 'earphones', 'power-bank', 'charger', 'lens', 'controller', 'sunscreen', 'face-wash', 'moisturizer', 'foundation', 'eyeshadow', 'mascara', 'lip-balm', 'lipstick', 'perfume', 'nail-polish', 'hand-cream', 'shampoo', 'conditioner'],
    keywords: 'how to use explain instructions איך משתמשים להסביר',
    label: { he: 'איך משתמשים ב…?', en: 'How do I use …?' },
    ja: '{N}の使い方を教えてください', kana: '{N}のつかいかたをおしえてください', romaji: '{N} no tsukaikata o oshiete kudasai', he_pron: '{N} נו צוקאיקאטה או אושיאטה קודאסאי',
    he: 'תוכלו להסביר איך משתמשים ב{he}?', en: 'Could you show me how to use {the}?',
  },

  {
    id: 'do-for-me', group: 'requests',
    keywords: 'can you could you please help בקשה יכולים תוכלו', accepts: ['request'],
    label: { he: 'תוכלו …?', en: 'Could you …?' },
    ja: '{N}もらえますか', kana: '{N}もらえますか', romaji: '{N} moraemasu ka', he_pron: '{N} מוראאמאס קה',
    he: 'תוכלו {he}?', en: 'Could you {en}?',
  },
  {
    id: 'may-i', group: 'requests',
    keywords: 'can i may i allowed permission מותר אפשר רשות', accepts: ['may-i'],
    label: { he: 'אפשר …?', en: 'May I …?' },
    ja: '{N}もいいですか', kana: '{N}もいいですか', romaji: '{N} mo ii desu ka', he_pron: '{N} מו אי דס קה',
    he: 'אפשר {he}?', en: 'May I {en}?',
  },

  {
    id: 'please-do', group: 'requests', accepts: ['request'],
    label: { he: '…, בבקשה', en: 'Please …' },
    ja: '{N}ください', kana: '{N}ください', romaji: '{N} kudasai', he_pron: '{N} קודאסאי',
    he: 'בבקשה {he}', en: 'Please {en}',
  },
  {
    id: 'borrow', group: 'requests', accepts: ['borrowable'],
    keywords: 'borrow lend loan hotel לשאול להשאיל',
    label: { he: 'אפשר לשאול …?', en: 'Can we borrow …?' },
    ja: '{N}を借りられますか', kana: '{N}をかりられますか', romaji: '{N} o kariraremasu ka', he_pron: '{N} או קארירארמאס קה',
    he: 'אפשר לשאול {he}?', en: 'Can we borrow {a}?',
  },
  {
    id: 'call', group: 'requests', accepts: ['person'],
    label: { he: 'תזמינו …, בבקשה', en: 'Please call …' },
    ja: '{N}を呼んでください', kana: '{N}をよんでください', romaji: '{N} o yonde kudasai', he_pron: '{N} או יונדה קודאסאי',
    he: 'תזמינו {he}, בבקשה', en: 'Please call {a}',
  },

  {
    id: 'looking-for', group: 'shopping', accepts: ['place', 'thing', 'custom', 'game', 'electronic', 'fashion', 'cosmetic'],
    exclude: SERVICE_ITEMS,
    label: { he: 'אנחנו מחפשים …', en: "We're looking for …" },
    ja: '{N}を探しています', kana: '{N}をさがしています', romaji: '{N} o sagashite imasu', he_pron: '{N} או סאגאשיטה אימאס',
    he: 'אנחנו מחפשים {he}', en: "We're looking for {a}",
  },
  {
    id: 'lost', group: 'problems',
    keywords: 'lost missing איבדתי אבד חסר', accepts: ['belonging'],
    label: { he: 'איבדתי את …', en: 'I lost my …' },
    ja: '{N}をなくしました', kana: '{N}をなくしました', romaji: '{N} o nakushimashita', he_pron: '{N} או נאקושימאשיטה',
    he: 'איבדתי את {he_def}', en: 'I lost my {en}',
  },
  {
    id: 'hurts', group: 'problems',
    keywords: 'pain hurt sick doctor כאב כואב רופא חולה', accepts: ['body'],
    label: { he: 'כואב לי …', en: 'My … hurts' },
    ja: '{N}が痛いです', kana: '{N}がいたいです', romaji: '{N} ga itai desu', he_pron: '{N} גה איטאי דס',
    he: 'כואב לי {he_def}', en: 'My {en} hurts',
  },
  {
    id: 'broken', group: 'problems',
    keywords: 'broken fix repair problem תקלה מקולקל שבור לתקן', accepts: ['fixture', 'machine'],
    label: { he: 'יש תקלה ב…', en: '… is broken' },
    ja: '{N}が壊れています', kana: '{N}がこわれています', romaji: '{N} ga kowarete imasu', he_pron: '{N} גה קווארטה אימאס',
    he: 'יש תקלה ב{he}', en: '{The} is broken',
  },
  {
    id: 'not-working', group: 'problems',
    exclude: ['umbrella', 'suitcase'],
    keywords: 'not working broken problem לא עובד תקלה', accepts: ['fixture', 'works', 'machine'],
    label: { he: 'לא מצליחים להשתמש ב…', en: "… doesn't work" },
    ja: '{N}が使えません', kana: '{N}がつかえません', romaji: '{N} ga tsukaemasen', he_pron: '{N} גה צוקאאמאסן',
    he: 'לא מצליחים להשתמש ב{he}', en: "{The} doesn't work",
  },
  {
    id: 'forgot', group: 'problems', accepts: ['belonging'],
    label: { he: 'שכחתי את …', en: 'I left my … behind' },
    ja: '{N}を忘れました', kana: '{N}をわすれました', romaji: '{N} o wasuremashita', he_pron: '{N} או וואסורמאשיטה',
    he: 'שכחתי את {he_def}', en: 'I left my {en} behind',
  },
  {
    id: 'need', group: 'problems', accepts: ['thing', 'amenity', 'cosmetic', 'electronic'],
    exclude: ['switch', 'gameboy', 'playstation', 'retro-console', 'handheld', 'controller', 'souvenir', 'breakfast', 'dinner', 'yukata', 'camera', 'lens', 'film-camera', 'rice-cooker', 'hair-iron', 'headphones', 'earphones', 'perfume', 'lipstick', 'eyeshadow', 'mascara', 'nail-polish', 'foundation', 'kitchen-knife', 'tea-cup', 'sake-cup', 'furoshiki', 'tenugui', 'chopsticks-set', 'matcha-powder', 'folding-fan', 'english-menu', 'stamp', 'postcard'],
    label: { he: 'אנחנו צריכים …', en: 'We need …' },
    ja: '{N}が必要です', kana: '{N}がひつようです', romaji: '{N} ga hitsuyou desu', he_pron: '{N} גה היצויו דס',
    he: 'אנחנו צריכים {he}', en: 'We need {a}',
  },
]
