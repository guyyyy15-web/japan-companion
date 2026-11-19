import { useI18n } from '../i18n'
import { Icon, type IconName } from './Icon'
import { showToast } from './Toast'
import type { Key } from '../i18n/en'
import type { Tab } from './TabBar'

const ITEMS: { tab: Tab; icon: IconName; title: Key; sub: Key }[] = [
  { tab: 'signs', icon: 'signs', title: 'more.signs', sub: 'more.signsSub' },
  { tab: 'gallery', icon: 'gallery', title: 'more.gallery', sub: 'more.gallerySub' },
  { tab: 'guide', icon: 'guide', title: 'more.guide', sub: 'more.guideSub' },
]

/** The "More" tab: the screens that don't fit the bar, sharing the app, the intro again, language. */
export function MoreView({ onOpen, onIntro }: { onOpen: (tab: Tab) => void; onIntro: () => void }) {
  const { t, lang, setLang } = useI18n()
  const share = async () => {
    const url = new URL(import.meta.env.BASE_URL, location.origin).href
    try {
      if (navigator.share) {
        await navigator.share({ title: t('app.title'), text: t('more.shareText'), url })
        return
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(`${t('more.shareText')} ${url}`)
      showToast(t('more.copied'))
    } catch {
      showToast(url)
    }
  }
  return (
    <div className="view more">
      <h2 className="more-title">{t('more.title')}</h2>
      <ul className="more-list">
        {ITEMS.map((x) => (
          <li key={x.tab}>
            <button className="more-item" onClick={() => onOpen(x.tab)}>
              <span className="more-icon"><Icon name={x.icon} /></span>
              <span className="more-text"><strong>{t(x.title)}</strong><span>{t(x.sub)}</span></span>
              <span className="more-go" aria-hidden>›</span>
            </button>
          </li>
        ))}
      </ul>
      <ul className="more-list">
        <li>
          <button className="more-item" onClick={share}>
            <span className="more-icon" aria-hidden>🎁</span>
            <span className="more-text"><strong>{t('more.share')}</strong><span>{t('more.shareSub')}</span></span>
            <span className="more-go" aria-hidden>›</span>
          </button>
        </li>
        <li>
          <button className="more-item" onClick={onIntro}>
            <span className="more-icon" aria-hidden>👋</span>
            <span className="more-text"><strong>{t('more.intro')}</strong></span>
            <span className="more-go" aria-hidden>›</span>
          </button>
        </li>
        <li className="more-lang">
          <span>{t('more.lang')}</span>
          <div className="seg" role="group" aria-label={t('more.lang')}>
            <button aria-pressed={lang === 'he'} onClick={() => setLang('he')}>עברית</button>
            <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
          </div>
        </li>
      </ul>
    </div>
  )
}

/** A thin bar on top of a screen that lives under "More", to go back to the list. */
export function BackToMore({ onBack }: { onBack: () => void }) {
  const { t } = useI18n()
  return (
    <button className="back-more" onClick={onBack}>
      <span className="back-arrow" aria-hidden>‹</span> {t('more.back')}
    </button>
  )
}
