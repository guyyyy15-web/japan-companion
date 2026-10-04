import type { Tab } from '../components/TabBar'
import type { Bi } from './guide'

/** Shown once after an update. Bump `version` and replace the items when shipping something worth pointing at. */
export const WHATS_NEW: { version: string; items: (Bi & { icon: string; tab: Tab })[] } = {
  version: '0.17',
  items: [
    { icon: '🙏', tab: 'phrases', he: 'מילות בסיס ונימוס: 42 מילים ומשפטים קצרים ליום-יום (לילה טוב, להתראות, תודה על האוכל, היה ממש טעים…)', en: 'Basics & manners: 42 everyday words and short phrases (good night, goodbye, thanks for the meal, it was delicious…)' },
    { icon: '🍜', tab: 'phrases', he: 'לפני ואחרי האוכל: いただきます, ごちそうさまでした ותגובות כמו "מדהים!" ו"איזה יפה!"', en: 'Before and after meals: いただきます, ごちそうさまでした, plus reactions like "Amazing!" and "How beautiful!"' },
  ],
}
