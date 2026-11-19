import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.18',
  items: [
    { icon: '🧭', tab: 'more', he: 'סרגל מסודר יותר: שלטים, גלריה ומדריך נמצאים עכשיו תחת "עוד"', en: 'A tidier tab bar: Signs, Gallery and Guide now live under "More"' },
    { icon: '🎁', tab: 'more', he: 'חברים טסים ליפן? "עוד" ← שלחו להם את האפליקציה. בפתיחה הראשונה הם יקבלו הסבר קצר', en: 'Friends flying to Japan? More → send them the app. They get a short intro the first time they open it' },
  ],
}
