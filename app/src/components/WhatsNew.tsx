import { useState } from 'react'
import { WHATS_NEW } from '../content/whatsNew'
import { useI18n } from '../i18n'
import { load, save } from '../lib/storage'
import type { Tab } from './TabBar'

const SEEN_KEY = 'jc.seenVersion'

/** A one-time card after an update: what's new, each line jumping to its tab. */
export function WhatsNew({ onOpen }: { onOpen: (tab: Tab) => void }) {
  const { t, pick } = useI18n()
  const [open, setOpen] = useState(() => load<string>(SEEN_KEY, '') !== WHATS_NEW.version)
  if (!open) return null

  const close = () => {
    save(SEEN_KEY, WHATS_NEW.version)
    setOpen(false)
  }

  return (
    <section className="whatsnew" aria-label={t('whatsNew.title')}>
      <div className="whatsnew-head">
        <strong>✨ {t('whatsNew.title')}</strong>
        <button className="whatsnew-close" onClick={close} aria-label={t('card.close')}>
          ✕
        </button>
      </div>
      <ul>
        {WHATS_NEW.items.map((item, i) => (
          <li key={i}>
            <button
              className="whatsnew-item"
              onClick={() => {
                close()
                onOpen(item.tab)
              }}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{pick(item)}</span>
              <span aria-hidden className="whatsnew-go">›</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
