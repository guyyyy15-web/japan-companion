import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.15',
  items: [
    { icon: '🖼️', tab: 'gallery', he: 'גלריה: כרטיסים, QR, הזמנות, מסמכים ומפות, לפי קטגוריות וגם בלי אינטרנט', en: 'Gallery: tickets, QR codes, bookings, documents and maps, by category and offline' },
    { icon: '🧾', tab: 'money', he: 'ארנק: מצמידים צילום קבלה לכל הוצאה', en: 'Wallet: attach a receipt photo to any expense' },
    { icon: '🧩', tab: 'builder', he: 'משפטים ותרגום חופשי במסך אחד, והכלים של גוגל בכפתורים קטנים', en: 'Sentences and free translation on one screen, with compact Google tool buttons' },
  ],
}
