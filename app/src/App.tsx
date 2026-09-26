import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { Toast } from './components/Toast'
import { WhatsNew } from './components/WhatsNew'
import { PhrasesView } from './features/phrases/PhrasesView'
import { BuilderView } from './features/builder/BuilderView'
import { NearbyView } from './features/nearby/NearbyView'
import { SignsView } from './features/signs/SignsView'
import { MoneyView } from './features/money/MoneyView'
import { GuideView } from './features/guide/GuideView'
import { useI18n } from './i18n'
import { load, save } from './lib/storage'

const TAB_KEY = 'jc.tab'

export function App() {
  const { t, lang, setLang } = useI18n()
  const [tab, setTabState] = useState<Tab>(() => load<Tab>(TAB_KEY, 'phrases'))
  const setTab = (next: Tab) => {
    setTabState(next)
    save(TAB_KEY, next)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="hanko" lang="ja" aria-hidden>旅</span>
          <div className="brand-text">
            <h1>{t('app.title')}</h1>
            <span className="brand-sub" lang="ja">日本旅行のおとも</span>
          </div>
        </div>
        <button className="lang" onClick={() => setLang(lang === 'he' ? 'en' : 'he')}>
          {t('app.langToggle')}
        </button>
      </header>
      <main>
        <WhatsNew onOpen={setTab} />
        {tab === 'phrases' && <PhrasesView />}
        {tab === 'builder' && <BuilderView />}
        {tab === 'nearby' && <NearbyView />}
        {tab === 'signs' && <SignsView />}
        {tab === 'money' && <MoneyView />}
        {tab === 'guide' && <GuideView />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      <Toast />
    </div>
  )
}
