import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.9',
  items: [
    { icon: '👛', tab: 'money', he: 'ארנק הטיול: מתעדים הוצאות ורואים סך הכל בשקלים', en: 'Trip wallet: log spending, see the total in ₪' },
    { icon: '🏨', tab: 'nearby', he: 'כרטיס למונית עם כתובת המלון ביפנית', en: 'Taxi card with your hotel\'s Japanese address' },
    { icon: '🏪', tab: 'nearby', he: 'הקונביני הקרוב, 60+ חיפושים ואפליקציות של מקומיים', en: 'Nearest konbini, 60+ searches and apps locals use' },
    { icon: '🎴', tab: 'phrases', he: 'תרגול כרטיסיות לטיסה (בסוף רשימת הקטגוריות)', en: 'Flashcard practice for the flight (end of the category list)' },
    { icon: '🍙', tab: 'signs', he: 'תוויות קונביני: מילויי אוניגירי, הנחות, חם/קר', en: 'Konbini labels: onigiri fillings, discounts, hot/cold' },
    { icon: '🍁', tab: 'guide', he: 'סתיו ביפן ומידות בגדים ונעליים', en: 'Autumn in Japan, plus clothes & shoe sizes' },
  ],
}
