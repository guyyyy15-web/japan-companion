import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.10',
  items: [
    { icon: '🐉', tab: 'nearby', he: 'בסביבה: מתג "רק ידידותי לקעקועים" לאונסן, מרחצאות, סאונה, חדר כושר ובריכה', en: 'Nearby: a "tattoo-friendly only" switch for onsen, sento, saunas, gyms and pools' },
    { icon: '🈯', tab: 'signs', he: 'שלטים: איך נראה שלט "אין כניסה עם קעקועים"', en: 'Signs: what a "no tattoos" notice looks like' },
  ],
}
