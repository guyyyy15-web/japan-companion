import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.11',
  items: [
    { icon: '📍', tab: 'nearby', he: 'בסביבה: 60 סוגי מקומות עם רשימת הקרובים ומפה, עם שמות, ישר באפליקציה', en: 'Nearby: the nearest places for 60 searches, named, with a map, right in the app' },
    { icon: '🛒', tab: 'nearby', he: 'חדש: סופר, מידע לתיירים, מוניות, בתי קפה, מאפיות, פארקים, מוזיאונים, אופניים', en: 'New: supermarkets, tourist info, taxis, cafés, bakeries, parks, museums, bike share' },
    { icon: '⬇️', tab: 'nearby', he: 'אפשר לשמור את כל המקומות לשימוש בלי אינטרנט (כ-7MB)', en: 'Save all places for offline use (about 7 MB)' },
  ],
}
