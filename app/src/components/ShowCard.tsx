import { useEffect, useState } from 'react'
import { Ja } from './Ja'
import { useI18n } from '../i18n'
import { SpeakButtons } from './SpeakButtons'
import { keepAwake } from '../lib/wakeLock'

export interface CardContent {
  ja: string
  kana: string
  romaji: string
  meaning: string
  /** Optional line above the big text, e.g. "please take me to this address" over an address. */
  lead?: string
}

/** Full-screen card to hand to someone: big Japanese, screen kept on, flippable toward them. */
export function ShowCard({ card, onClose }: { card: CardContent; onClose: () => void }) {
  const { t } = useI18n()
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    let release = () => {}
    keepAwake().then((r) => (release = r))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      release()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const size = card.ja.length > 14 ? 'long' : card.ja.length > 7 ? 'mid' : 'short'

  return (
    <div className="showcard" role="dialog" aria-modal="true">
      <div className={`showcard-face ${flipped ? 'flipped' : ''}`}>
        {card.lead && <Ja className="showcard-lead">{card.lead}</Ja>}
        <Ja className={`showcard-ja ${size}`}>{card.ja}</Ja>
        {card.kana !== card.ja && <Ja className="showcard-kana">{card.kana}</Ja>}
      </div>
      <div className="showcard-mine">
        <div className="showcard-meaning">{card.meaning}</div>
        <div className="showcard-romaji" dir="ltr">{card.romaji}</div>
        <div className="showcard-actions">
          <button onClick={() => setFlipped((f) => !f)}>🔄 {t('card.rotate')}</button>
          <SpeakButtons text={card.lead ?? card.ja} />
          <button className="primary" onClick={onClose}>✕ {t('card.close')}</button>
        </div>
      </div>
    </div>
  )
}
