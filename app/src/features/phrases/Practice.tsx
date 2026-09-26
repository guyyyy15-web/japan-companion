import { useState } from 'react'
import { CATEGORIES, listening, phrases, type Category } from '../../content'
import { Ja } from '../../components/Ja'
import { SpeakButtons } from '../../components/SpeakButtons'
import { useI18n } from '../../i18n'
import { answer, shuffle } from '../../lib/practice'
import { load, save } from '../../lib/storage'

type Source = 'favorites' | 'listening' | Category
type Direction = 'say' | 'understand'

interface Flash {
  id: string
  ja: string
  romaji: string
  pron?: string
  meaning: string
}

/** Flashcards for the plane: see Hebrew and say it in Japanese, or hear Japanese and understand it. */
export function Practice({ favs }: { favs: string[] }) {
  const { t, lang, pick } = useI18n()
  const [source, setSource] = useState<Source>(() => {
    const saved = load<Source>('jc.practiceSource', favs.length ? 'favorites' : 'basics')
    return saved === 'favorites' && !favs.length ? 'basics' : saved
  })
  const [direction, setDirection] = useState<Direction>('say')
  const [queue, setQueue] = useState<string[]>(() => shuffle(idsFor(source, favs)))
  const [total, setTotal] = useState(queue.length)
  const [knew, setKnew] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const cards = cardsFor(source, favs, lang, pick)
  const current = cards.find((c) => c.id === queue[0])

  const restart = (s: Source = source) => {
    const ids = shuffle(idsFor(s, favs))
    setQueue(ids)
    setTotal(ids.length)
    setKnew(0)
    setRevealed(false)
  }

  const pickSource = (s: Source) => {
    setSource(s)
    save('jc.practiceSource', s)
    // Listening cards are things people say to you, so they practise understanding.
    if (s === 'listening') setDirection('understand')
    restart(s)
  }

  const next = (known: boolean) => {
    setQueue((q) => answer(q, known))
    if (known) setKnew((k) => k + 1)
    setRevealed(false)
  }

  const sources: Source[] = [...(favs.length ? (['favorites'] as Source[]) : []), ...CATEGORIES, 'listening']

  return (
    <div className="practice">
      <div className="practice-controls">
        <label className="field compact">
          <span>{t('practice.deck')}</span>
          <select value={source} onChange={(e) => pickSource(e.target.value as Source)}>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s === 'favorites' ? t('phrases.favorites') : s === 'listening' ? t('phrases.listening') : t(`cat.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="seg two" role="radiogroup" aria-label={t('practice.direction')}>
          {(['say', 'understand'] as Direction[]).map((d) => (
            <button
              key={d}
              role="radio"
              aria-checked={d === direction}
              className={d === direction ? 'seg-btn active' : 'seg-btn'}
              onClick={() => {
                setDirection(d)
                setRevealed(false)
              }}
            >
              {t(`practice.${d}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="practice-progress muted">
        {t('practice.progress', { left: String(queue.length), knew: String(knew), total: String(total) })}
      </div>

      {current ? (
        <div className="practice-card">
          <div className="practice-prompt">
            {direction === 'say' ? (
              <div className="practice-meaning">{current.meaning}</div>
            ) : (
              <>
                <Ja className="practice-ja">{current.ja}</Ja>
                <SpeakButtons text={current.ja} />
              </>
            )}
          </div>
          {revealed ? (
            <div className="practice-answer">
              {direction === 'say' ? (
                <>
                  <Ja className="practice-ja">{current.ja}</Ja>
                  {lang === 'he' && current.pron && <div>{current.pron}</div>}
                  <div className="romaji" dir="ltr">{current.romaji}</div>
                  <SpeakButtons text={current.ja} />
                </>
              ) : (
                <>
                  <div className="romaji" dir="ltr">{current.romaji}</div>
                  <div className="practice-meaning">{current.meaning}</div>
                </>
              )}
              <div className="practice-buttons">
                <button className="practice-btn again" onClick={() => next(false)}>
                  ↺ {t('practice.again')}
                </button>
                <button className="practice-btn knew" onClick={() => next(true)}>
                  ✓ {t('practice.knew')}
                </button>
              </div>
            </div>
          ) : (
            <button className="primary-btn" onClick={() => setRevealed(true)}>
              {t('practice.reveal')}
            </button>
          )}
        </div>
      ) : (
        <div className="practice-card done">
          <div className="practice-meaning">🎉 {t('practice.done', { total: String(total) })}</div>
          <button className="primary-btn" onClick={() => restart()}>
            ↺ {t('practice.restart')}
          </button>
        </div>
      )}
    </div>
  )
}

function idsFor(source: Source, favs: string[]): string[] {
  if (source === 'listening') return listening.map((l) => l.id)
  if (source === 'favorites') return favs.filter((id) => phrases.some((p) => p.id === id))
  return phrases.filter((p) => p.cat === source).map((p) => p.id)
}

function cardsFor(
  source: Source,
  favs: string[],
  lang: 'he' | 'en',
  pick: (b: { he: string; en: string }) => string,
): Flash[] {
  if (source === 'listening') return listening.map((l) => ({ id: l.id, ja: l.ja, romaji: l.romaji, meaning: pick(l) }))
  const ids = new Set(idsFor(source, favs))
  return phrases
    .filter((p) => ids.has(p.id))
    .map((p) => ({ id: p.id, ja: p.ja, romaji: p.romaji, pron: lang === 'he' ? p.he_pron : undefined, meaning: pick(p) }))
}
