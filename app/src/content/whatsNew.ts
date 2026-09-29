import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.16',
  items: [
    { icon: '🎌', tab: 'nearby', he: 'אטרקציות: 46 מקומות נבחרים בטוקיו, הוקאידו, קיוטו ואוסקה, לפי תחומי עניין', en: 'Attractions: 46 hand-picked places in Tokyo, Hokkaido, Kyoto and Osaka, by interest' },
    { icon: '📅', tab: 'nearby', he: '"להזמין עכשיו": מה דורש הזמנה מראש, והרשימה האישית שלכם', en: '"Book these now": what needs booking, plus your own list' },
    { icon: '🎳', tab: 'nearby', he: 'חדש בחיפוש: באולינג, מנגה קפה, קולנוע, פארקי שעשועים, חדרי בריחה ועוד', en: 'New searches: bowling, manga cafés, cinemas, theme parks, escape rooms and more' },
  ],
}
