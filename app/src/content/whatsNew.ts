import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.12',
  items: [
    { icon: '🧩', tab: 'builder', he: 'בניית משפטים מחדש: שלב אחרי שלב במסך אחד, בלי גלילה ארוכה', en: 'Sentence builder redone: one step at a time on one screen, no long scrolling' },
    { icon: '🌐', tab: 'builder', he: 'תרגום חופשי: כותבים או מדביקים ושולחים לגוגל טרנסלייט', en: 'Free translation: type or paste, then open it in Google Translate' },
    { icon: '📷', tab: 'builder', he: 'קיצורים למצלמה ולשיחה של גוגל טרנסלייט ולגוגל לנז, והכנות לפני הטיסה', en: 'Shortcuts to Google Translate camera and conversation, Google Lens, and a pre-flight checklist' },
  ],
}
