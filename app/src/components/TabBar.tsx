import { useI18n } from '../i18n'
import { Icon, type IconName } from './Icon'
import type { Key } from '../i18n/en'

export type Tab = 'phrases' | 'builder' | 'nearby' | 'signs' | 'money' | 'gallery' | 'guide' | 'more'

/** Five tabs in the bar; signs, gallery and guide live under "More" (seven didn't fit a phone). */
const TABS: { id: Tab; icon: IconName; key: Key }[] = [
  { id: 'phrases', icon: 'phrases', key: 'tab.phrases' },
  { id: 'builder', icon: 'builder', key: 'tab.builder' },
  { id: 'nearby', icon: 'nearby', key: 'tab.nearby' },
  { id: 'money', icon: 'money', key: 'tab.money' },
  { id: 'more', icon: 'more', key: 'tab.more' },
]
export const UNDER_MORE: Tab[] = ['signs', 'gallery', 'guide']

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const { t } = useI18n()
  const current = UNDER_MORE.includes(tab) ? 'more' : tab
  return (
    <nav className="tabbar">
      {TABS.map((x) => (
        <button
          key={x.id}
          className={x.id === current ? 'tab active' : 'tab'}
          aria-current={x.id === current ? 'page' : undefined}
          onClick={() => onChange(x.id)}
        >
          <span className="tab-icon"><Icon name={x.icon} /></span>
          <span>{t(x.key)}</span>
        </button>
      ))}
    </nav>
  )
}
