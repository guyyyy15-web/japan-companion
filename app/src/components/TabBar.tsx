import { useI18n } from '../i18n'
import { Icon, type IconName } from './Icon'
import type { Key } from '../i18n/en'

export type Tab = 'phrases' | 'builder' | 'nearby' | 'signs' | 'money' | 'guide'

const TABS: { id: Tab; icon: IconName; key: Key }[] = [
  { id: 'phrases', icon: 'phrases', key: 'tab.phrases' },
  { id: 'builder', icon: 'builder', key: 'tab.builder' },
  { id: 'nearby', icon: 'nearby', key: 'tab.nearby' },
  { id: 'signs', icon: 'signs', key: 'tab.signs' },
  { id: 'money', icon: 'money', key: 'tab.money' },
  { id: 'guide', icon: 'guide', key: 'tab.guide' },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const { t } = useI18n()
  return (
    <nav className="tabbar">
      {TABS.map((x) => (
        <button
          key={x.id}
          className={x.id === tab ? 'tab active' : 'tab'}
          aria-current={x.id === tab ? 'page' : undefined}
          onClick={() => onChange(x.id)}
        >
          <span className="tab-icon"><Icon name={x.icon} /></span>
          <span>{t(x.key)}</span>
        </button>
      ))}
    </nav>
  )
}
