import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.13',
  items: [
    { icon: '🧭', tab: 'phrases', he: 'כיוונים: ימינה, שמאלה, ישר, קדימה, אחורה, למעלה, למטה, ומשפטים למונית', en: 'Directions: right, left, straight, forward, back, up, down, plus taxi phrases' },
    { icon: '👂', tab: 'phrases', he: '"מה אומרים לכם": איך יפנים מסבירים את הדרך', en: '"They say": how people give you directions' },
    { icon: '🧩', tab: 'builder', he: 'בונה המשפטים: "זה מימין? למעלה? בצד השני של הרחוב?"', en: 'Builder: "Is it on the right? Upstairs? Across the street?"' },
    { icon: '🈯', tab: 'signs', he: 'שלטים: 上り/下り, מדרגות, קומות, מרתף', en: 'Signs: 上り/下り, stairs, floors, basement' },
  ],
}
