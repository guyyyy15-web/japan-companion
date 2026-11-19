import { useState } from 'react'
import { TabBar, UNDER_MORE, type Tab } from './components/TabBar'
import { MoreView, BackToMore } from './components/MoreView'
import { Intro } from './components/Intro'
import { Toast } from './components/Toast'
import { WhatsNew } from './components/WhatsNew'
import { PhrasesView } from './features/phrases/PhrasesView'
import { BuilderView } from './features/builder/BuilderView'
import { NearbyTab } from './features/nearby/NearbyTab'
import { SignsView } from './features/signs/SignsView'
import { MoneyView } from './features/money/MoneyView'
import { GalleryView } from './features/gallery/GalleryView'
import { GuideView } from './features/guide/GuideView'
import { useI18n } from './i18n'
import { load, save } from './lib/storage'
import { WHATS_NEW } from './content/whatsNew'

const TAB_KEY = 'jc.tab'
const INTRO_KEY = 'jc.introDone'

/**
 * The intro is for someone new. Anyone who already used the app (a saved tab, language or seen release notes)
 * skips it.
 */
function isNewUser(): boolean {
  if (load<boolean>(INTRO_KEY, false)) return false
  try {
    return !['jc.tab', 'jc.lang', 'jc.seenVersion'].some((k) => localStorage.getItem(k) !== null)
  } catch {
    return false
  }
}

export function App() {
  const { t, lang, setLang } = useI18n()
  const [tab, setTabState] = useState<Tab>(() => load<Tab>(TAB_KEY, 'phrases'))
  const [intro, setIntro] = useState(isNewUser)
  const endIntro = () => {
    save(INTRO_KEY, true)
    save('jc.seenVersion', WHATS_NEW.version) // someone new doesn't need "what's new"
    setIntro(false)
    window.scrollTo(0, 0)
  }
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
        {!intro && <WhatsNew onOpen={setTab} />}
        {UNDER_MORE.includes(tab) && <BackToMore onBack={() => setTab('more')} />}
        {tab === 'more' && <MoreView onOpen={setTab} onIntro={() => setIntro(true)} />}
        {tab === 'phrases' && <PhrasesView />}
        {tab === 'builder' && <BuilderView />}
        {tab === 'nearby' && <NearbyTab />}
        {tab === 'signs' && <SignsView />}
        {tab === 'money' && <MoneyView />}
        {tab === 'gallery' && <GalleryView />}
        {tab === 'guide' && <GuideView />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      <Toast />
      {intro && <Intro onDone={endIntro} />}
    </div>
  )
}
