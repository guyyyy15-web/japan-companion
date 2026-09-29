import { useState } from 'react'
import { useI18n } from '../../i18n'
import type { Key } from '../../i18n/en'
import {
  GOOGLE_STORE,
  LENS_APP,
  LENS_WEB,
  TRANSLATE_APP,
  TRANSLATE_STORE,
  openAppOrWeb,
  translateAppUrl,
  translateWebUrl,
  type TranslateLang,
} from '../../lib/googleApps'
import { load, save } from '../../lib/storage'

type Direction = 'he-ja' | 'ja-he' | 'en-ja'
const DIRECTIONS: Record<Direction, { from: TranslateLang; to: TranslateLang; label: Key }> = {
  'he-ja': { from: 'iw', to: 'ja', label: 'translate.heJa' },
  'ja-he': { from: 'ja', to: 'iw', label: 'translate.jaHe' },
  'en-ja': { from: 'en', to: 'ja', label: 'translate.enJa' },
}

const TOOLS: { icon: string; title: Key; how: Key; href: string; store: string }[] = [
  { icon: '📷', title: 'translate.camera', how: 'translate.cameraHow', href: TRANSLATE_APP, store: TRANSLATE_STORE },
  { icon: '🗣️', title: 'translate.conversation', how: 'translate.conversationHow', href: TRANSLATE_APP, store: TRANSLATE_STORE },
  { icon: '🔍', title: 'translate.lens', how: 'translate.lensHow', href: LENS_APP, store: GOOGLE_STORE },
  { icon: '✍️', title: 'translate.handwriting', how: 'translate.handwritingHow', href: TRANSLATE_APP, store: TRANSLATE_STORE },
]

const SETUP: Key[] = ['translate.setup1', 'translate.setup2', 'translate.setup3', 'translate.setup4']

/** Free-text translation handed to Google Translate, plus the Google and iPhone tools worth knowing. */
export function TranslateTool() {
  const { t } = useI18n()
  const [dir, setDir] = useState<Direction>(() => load<Direction>('jc.translateDir', 'he-ja'))
  const [text, setText] = useState('')
  const { from, to } = DIRECTIONS[dir]
  const typed = text.trim()

  const pickDir = (d: Direction) => {
    setDir(d)
    save('jc.translateDir', d)
  }

  const paste = async () => {
    try {
      setText(await navigator.clipboard.readText())
    } catch {
      // Clipboard blocked: the user can long-press the box and paste.
    }
  }

  return (
    <section className="panel translate-tool" aria-label={t('builder.modeTranslate')}>
      <h3 className="translate-title">🌐 {t('builder.modeTranslate')}</h3>
      <div className="seg three compact" role="radiogroup" aria-label={t('translate.direction')}>
        {(Object.keys(DIRECTIONS) as Direction[]).map((d) => (
          <button key={d} role="radio" aria-checked={d === dir} className={d === dir ? 'seg-btn active' : 'seg-btn'} onClick={() => pickDir(d)}>
            {t(DIRECTIONS[d].label)}
          </button>
        ))}
      </div>
      <textarea
        className="search translate-input"
        rows={2}
        dir="auto"
        lang={from === 'ja' ? 'ja' : from === 'iw' ? 'he' : 'en'}
        value={text}
        placeholder={t(from === 'ja' ? 'translate.placeholderJa' : from === 'iw' ? 'translate.placeholderHe' : 'translate.placeholderEn')}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="translate-row">
        <a
          className={typed ? 'primary-btn translate-go' : 'primary-btn translate-go disabled'}
          href={typed ? translateAppUrl(typed, from, to) : undefined}
          aria-disabled={!typed}
          onClick={(e) => {
            e.preventDefault()
            if (typed) openAppOrWeb(translateAppUrl(typed, from, to), translateWebUrl(typed, from, to))
          }}
        >
          🌐 {t('translate.go')}
        </a>
        {'clipboard' in navigator && !typed && (
          <button className="link" onClick={paste}>
            📋 {t('translate.paste')}
          </button>
        )}
        {typed && (
          <button className="link" onClick={() => setText('')}>
            ✕ {t('money.clear')}
          </button>
        )}
      </div>
      {typed && (
        <a className="link translate-web" href={translateWebUrl(typed, from, to)} target="_blank" rel="noopener noreferrer">
          🧭 {t('translate.inBrowser')}
        </a>
      )}

      <div className="tool-chips" aria-label={t('translate.tools')}>
        {TOOLS.map((tool) => (
          <a key={tool.title} className="tool-chip" href={tool.href} title={t(tool.how)}>
            <span aria-hidden>{tool.icon}</span> {t(tool.title)}
          </a>
        ))}
      </div>

      <details className="translate-more">
        <summary>{t('translate.setupTitle')}</summary>
        <ul className="tips">
          {TOOLS.map((tool) => (
            <li key={tool.title}>
              {tool.icon} {t(tool.how)}
            </li>
          ))}
          {SETUP.map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
        <p className="muted small-start">
          {t('translate.noApp')}{' '}
          <a href={TRANSLATE_STORE} target="_blank" rel="noopener noreferrer">Google Translate</a>
          {' · '}
          <a href={GOOGLE_STORE} target="_blank" rel="noopener noreferrer">Google (Lens)</a>
          {' · '}
          <a href={LENS_WEB} target="_blank" rel="noopener noreferrer">Lens web</a>
        </p>
      </details>
    </section>
  )
}
