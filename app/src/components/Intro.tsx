import { useState } from 'react'
import { useI18n } from '../i18n'
import { Icon, type IconName } from './Icon'
import type { Key } from '../i18n/en'

const TOUR: { icon: IconName; key: Key }[] = [
  { icon: 'phrases', key: 'intro.2phrases' },
  { icon: 'builder', key: 'intro.2builder' },
  { icon: 'nearby', key: 'intro.2nearby' },
  { icon: 'money', key: 'intro.2money' },
  { icon: 'more', key: 'intro.2more' },
]

const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const standalone = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true

/** Three short screens for someone who opens the app for the first time (a friend got the link). */
export function Intro({ onDone }: { onDone: () => void }) {
  const { t, lang, setLang } = useI18n()
  // The last step (add to Home Screen) is skipped when it already runs from the Home Screen.
  const steps = standalone() ? 2 : 3
  const [step, setStep] = useState(0)
  const last = step === steps - 1
  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label={t('intro.1title')}>
      <div className="intro-top">
        <div className="seg" role="group" aria-label={t('intro.lang')}>
          <button aria-pressed={lang === 'he'} onClick={() => setLang('he')}>עברית</button>
          <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
        </div>
        {!last && <button className="intro-skip" onClick={onDone}>{t('intro.skip')}</button>}
      </div>
      <div className="intro-body">
        {step === 0 && (
          <>
            <span className="intro-hanko" lang="ja" aria-hidden>旅</span>
            <h2>{t('intro.1title')}</h2>
            <p>{t('intro.1body')}</p>
            <p className="intro-ja" lang="ja" dir="ltr">こんにちは · ありがとう · いくらですか？</p>
          </>
        )}
        {step === 1 && (
          <>
            <h2>{t('intro.2title')}</h2>
            <ul className="intro-tour">
              {TOUR.map((x) => (
                <li key={x.key}><span className="more-icon"><Icon name={x.icon} /></span><span>{t(x.key)}</span></li>
              ))}
            </ul>
          </>
        )}
        {step === 2 && (
          <>
            <span className="intro-big" aria-hidden>📲</span>
            <h2>{t('intro.3title')}</h2>
            <p>{isIOS() ? t('intro.3body') : `${t('intro.3body')} ${t('intro.3android')}`}</p>
          </>
        )}
      </div>
      <div className="intro-foot">
        <div className="intro-dots" aria-hidden>
          {Array.from({ length: steps }, (_, i) => <span key={i} className={i === step ? 'on' : ''} />)}
        </div>
        <button className="intro-next" onClick={() => (last ? onDone() : setStep(step + 1))}>
          {last ? t('intro.start') : t('intro.next')}
        </button>
      </div>
    </div>
  )
}
