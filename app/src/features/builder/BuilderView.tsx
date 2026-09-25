import { useMemo, useState } from 'react'
import { PATTERNS, type Pattern, type PatternGroup, type WordType } from '../../content/patterns'
import { Icon } from '../../components/Icon'
import { Ja } from '../../components/Ja'
import { ShowCard, type CardContent } from '../../components/ShowCard'
import { SpeakButtons } from '../../components/SpeakButtons'
import { useI18n } from '../../i18n'
import type { Key } from '../../i18n/en'
import { build, customWord, fits, MAX_COUNT, VOCAB, wordsFor, type Word } from '../../lib/builder'
import { matches } from '../../lib/search'
import { load, save } from '../../lib/storage'
import { suggest } from '../../lib/suggest'

const GROUPS: { id: PatternGroup; icon: string }[] = [
  { id: 'around', icon: '🧭' },
  { id: 'order', icon: '🍜' },
  { id: 'shopping', icon: '🛍️' },
  { id: 'requests', icon: '🙏' },
  { id: 'problems', icon: '🆘' },
]

const HEADING: Record<Exclude<WordType, 'custom'>, Key> = {
  place: 'type.place',
  'pointer-place': 'type.pointer',
  this: 'type.pointer',
  thing: 'type.thing',
  food: 'type.food',
  drink: 'type.drink',
  ingredient: 'type.ingredient',
  body: 'type.body',
  belonging: 'type.belonging',
  usable: 'type.usable',
  works: 'type.usable',
  sight: 'type.sight',
  fixture: 'type.fixture',
  rentable: 'type.rentable',
  amenity: 'type.amenity',
  vehicle: 'type.vehicle',
  request: 'type.request',
  'may-i': 'type.may-i',
  city: 'type.city',
  allergen: 'type.allergen',
  event: 'type.event',
  person: 'type.person',
  game: 'type.game',
  electronic: 'type.electronic',
  fashion: 'type.fashion',
  cosmetic: 'type.cosmetic',
  size: 'type.size',
  adjective: 'type.adjective',
  machine: 'type.machine',
  craft: 'type.craft',
  borrowable: 'type.borrowable',
}

interface Recent {
  p: string
  w: string // word id, or "custom:<text>"
  n: number
}
const RECENT_KEY = 'jc.builderRecent'
const MAX_RECENT = 8
const WORD_FILTER_MIN = 16
/** Words shown per group before "+N more", so long lists don't flood a phone screen. */
const GROUP_PREVIEW = 12

function resolveWord(ref: string): Word | undefined {
  return ref.startsWith('custom:') ? customWord(ref.slice(7)) : VOCAB.find((v) => v.id === ref)
}

export function BuilderView() {
  const { t, lang, pick } = useI18n()
  const [pattern, setPattern] = useState<Pattern>(PATTERNS[0])
  const [group, setGroup] = useState<PatternGroup>(PATTERNS[0].group)
  const [word, setWord] = useState<Word | null>(null)
  const [count, setCount] = useState(1)
  const [query, setQuery] = useState('')
  const [wordFilter, setWordFilter] = useState('')
  const [custom, setCustom] = useState('')
  const [recent, setRecent] = useState<Recent[]>(() => load<Recent[]>(RECENT_KEY, []))
  const [card, setCard] = useState<CardContent | null>(null)
  // The frame grid folds into a one-line bar once a frame is picked, so the words sit right below.
  const [framesOpen, setFramesOpen] = useState(true)
  const [expanded, setExpanded] = useState<Key[]>([])

  const remember = (p: Pattern, w: Word, n: number) => {
    const entry: Recent = { p: p.id, w: w.id === 'custom' ? `custom:${w.ja}` : w.id, n }
    const next = [entry, ...recent.filter((r) => !(r.p === entry.p && r.w === entry.w && r.n === entry.n))].slice(0, MAX_RECENT)
    setRecent(next)
    save(RECENT_KEY, next)
  }

  const choose = (p: Pattern, w: Word | null, n = 1) => {
    setPattern(p)
    setGroup(p.group)
    setWord(w)
    setCount(n)
    setWordFilter('')
    if (p.id !== pattern.id) setExpanded([])
    if (w) remember(p, w, n)
  }

  const choosePattern = (p: Pattern) => {
    choose(p, word && fits(p, word) ? word : null, 1)
    setFramesOpen(false)
  }

  const changeCount = (n: number) => {
    const next = Math.min(MAX_COUNT, Math.max(1, n))
    setCount(next)
    if (word) remember(pattern, word, next)
  }

  const suggestions = useMemo(() => suggest(query, lang), [query, lang])

  // Words for this frame, grouped under the first accepted type they have.
  const sections = useMemo(() => {
    const q = wordFilter.trim()
    const list = wordsFor(pattern).filter((w) => !q || matches(q, [w.en, w.he, w.ja, w.kana, w.romaji]))
    const byHeading = new Map<Key, Word[]>()
    for (const w of list) {
      const type = w.types.find((x) => pattern.accepts.includes(x)) as Exclude<WordType, 'custom'>
      const key = HEADING[type]
      byHeading.set(key, [...(byHeading.get(key) ?? []), w])
    }
    return [...byHeading.entries()]
  }, [pattern, wordFilter])

  const total = wordsFor(pattern).length
  const result = word ? build(pattern, word, count) : null
  const allowsCustom = pattern.accepts.includes('custom')
  const blank = pick(pattern.label).replace('…', '＿＿')

  return (
    <div className="view builder">
      <div className="smart">
        <input
          className="search"
          type="search"
          enterKeyHint="search"
          placeholder={t('builder.smart')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.trim() && (
          <ul className="suggest" role="listbox">
            {suggestions.map((s) => (
              <li key={`${s.pattern.id}:${s.word.id}`}>
                <button
                  role="option"
                  className="suggest-item"
                  onClick={() => {
                    choose(s.pattern, s.word)
                    setFramesOpen(false)
                    setQuery('')
                  }}
                >
                  <span className="suggest-gloss">{lang === 'he' ? s.built.he : s.built.en}</span>
                  <Ja className="suggest-ja">{s.built.ja}</Ja>
                </button>
              </li>
            ))}
            {suggestions.length === 0 && <li className="empty">{t('builder.noSuggest')}</li>}
          </ul>
        )}
      </div>

      {!query.trim() && (
        <>
          {recent.length > 0 && (
            <div className="recent">
              <span className="recent-title">{t('builder.recent')}</span>
              <div className="chips">
                {recent.map((r, i) => {
                  const p = PATTERNS.find((x) => x.id === r.p)
                  const w = resolveWord(r.w)
                  if (!p || !w) return null
                  return (
                    <button key={i} className="chip small" onClick={() => { choose(p, w, r.n); setFramesOpen(false) }}>
                      <Ja>{build(p, w, r.n).ja}</Ja>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <section className="builder-step">
            {framesOpen ? (
              <>
                <h3 className="step">① {t('builder.step1')}</h3>
                <div className="group-tabs" role="tablist">
                  {GROUPS.map((g) => (
                    <button
                      key={g.id}
                      role="tab"
                      aria-selected={g.id === group}
                      className={g.id === group ? 'group-tab active' : 'group-tab'}
                      onClick={() => setGroup(g.id)}
                    >
                      <span aria-hidden>{g.icon}</span>
                      <span>{t(`groupShort.${g.id}`)}</span>
                    </button>
                  ))}
                </div>
                <div className="frame-grid">
                  {PATTERNS.filter((p) => p.group === group).map((p) => (
                    <button
                      key={p.id}
                      className={p.id === pattern.id ? 'frame active' : 'frame'}
                      aria-pressed={p.id === pattern.id}
                      onClick={() => choosePattern(p)}
                    >
                      {pick(p.label)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="frame-bar">
                <span className="frame-bar-label">①</span>
                <span className="frame-bar-current">{pick(pattern.label)}</span>
                <button className="link" onClick={() => setFramesOpen(true)}>{t('builder.change')} ▾</button>
              </div>
            )}
          </section>

          <section className="builder-step">
            <h3 className="step">
              ② {t('builder.step2')} <span className="step-frame">{blank}</span>
            </h3>
            {total >= WORD_FILTER_MIN && (
              <input
                className="search small"
                type="search"
                placeholder={t('builder.search')}
                value={wordFilter}
                onChange={(e) => setWordFilter(e.target.value)}
              />
            )}
            {sections.map(([heading, words]) => {
              const open = expanded.includes(heading) || wordFilter.trim() !== ''
              // Keep the chosen word visible even when its group is folded.
              const shown = open
                ? words
                : [...words.slice(0, GROUP_PREVIEW), ...words.slice(GROUP_PREVIEW).filter((w) => w.id === word?.id)]
              const hidden = words.length - shown.length
              return (
                <div key={heading} className="word-group">
                  <div className="group-title">{t(heading)}</div>
                  <div className="words">
                    {shown.map((w) => (
                      <button
                        key={w.id}
                        className={word?.id === w.id ? 'word active' : 'word'}
                        aria-pressed={word?.id === w.id}
                        onClick={() => choose(pattern, w, count)}
                      >
                        {lang === 'he' ? w.he : w.en}
                        <Ja className="word-ja">{w.ja}</Ja>
                      </button>
                    ))}
                    {hidden > 0 && (
                      <button className="word more" onClick={() => setExpanded([...expanded, heading])}>
                        {t('builder.more', { n: String(hidden) })}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {sections.length === 0 && <p className="empty">{t('phrases.noResults')}</p>}

            {allowsCustom && (
              <form
                className="custom"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (custom.trim()) choose(pattern, customWord(custom), count)
                }}
              >
                <label className="group-title" htmlFor="custom-word">{t('builder.custom')}</label>
                <div className="custom-row">
                  <input
                    id="custom-word"
                    className="search small"
                    value={custom}
                    placeholder="Kinkakuji / 金閣寺"
                    onChange={(e) => setCustom(e.target.value)}
                  />
                  <button className="frame active" type="submit" disabled={!custom.trim()}>{t('builder.use')}</button>
                </div>
                <small className="muted">{t('builder.customHint')}</small>
              </form>
            )}
          </section>
        </>
      )}

      {result && word && (
        <section className="builder-result" aria-live="polite">
          <div className="result-text">
            <div className="result-gloss">{lang === 'he' ? result.he : result.en}</div>
            <Ja className="result-ja">{result.ja}</Ja>
            <div className="result-pron">
              {lang === 'he' && <span>{result.he_pron}</span>}
              <span className="romaji" dir="ltr">{result.romaji}</span>
            </div>
          </div>
          <div className="result-actions">
            {pattern.count && (
              <div className="stepper" role="group" aria-label={t('builder.count')}>
                <button className="icon" onClick={() => changeCount(count - 1)} aria-label="−">−</button>
                <span className="stepper-n">{count}</span>
                <button className="icon" onClick={() => changeCount(count + 1)} aria-label="+">+</button>
              </div>
            )}
            <SpeakButtons text={result.ja} />
            <button
              className="icon"
              aria-label={t('phrases.show')}
              onClick={() => setCard({ ja: result.ja, kana: result.kana, romaji: result.romaji, meaning: lang === 'he' ? result.he : result.en })}
            >
              <Icon name="card" size={20} />
            </button>
          </div>
        </section>
      )}
      {card && <ShowCard card={card} onClose={() => setCard(null)} />}
    </div>
  )
}
