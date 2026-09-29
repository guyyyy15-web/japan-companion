import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.14',
  items: [
    { icon: '👂', tab: 'phrases', he: '"מה אומרים לכם": 46 מצבים, ולכל אחד תשובות מוכנות עם השמעה וכרטיס להצגה', en: '"They say": 46 situations, each with ready answers you can hear and show' },
    { icon: '🏨', tab: 'phrases', he: 'חדש: מלון, מסעדה, קונביני, חנות ורכבת, עם סינון לפי מקום', en: 'New: hotel, restaurant, konbini, shop and train, filtered by place' },
    { icon: '🌐', tab: 'builder', he: 'גוגל טרנסלייט נפתח קודם באפליקציה (מהיר יותר), והדפדפן רק כגיבוי', en: 'Google Translate opens in the app first (faster); the browser is the fallback' },
  ],
}
