import { useMemo, useState } from 'react'
import { PATTERNS, type Pattern, type PatternGroup, type WordType } from '../../content/patterns'
import { Icon } from '../../components/Icon'
import { Ja } from '../../components/Ja'
import { ShowCard, type CardContent } from '../../components/ShowCard'
import { SpeakButtons } from '../../components/SpeakButtons'
import { useI18n } from '../../i18n'
import type { Key } from '../../i18n/en'
import { build, customWord, fits, MAX_COUNT, VOCAB, wordsFor, type Word } from '../../lib/builder'
import { translateWebUrl } from '../../lib/googleApps'
import { matches } from '../../lib/search'
import { load, save } from '../../lib/storage'
import { suggest } from '../../lib/suggest'
import { TranslateTool } from './TranslateTool'

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
  direction: 'type.direction',
}

/** The builder is a four-step wizard on one screen: situation → sentence → word → result. */
type Step = 'situation' | 'frame' | 'word' | 'result'
const STEPS: Step[] = ['situation', 'frame', 'word', 'result']
type Mode = 'build' | 'translate'

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
/** Other words offered on the result card for a quick swap. */
const SWAP_COUNT = 10

function resolveWord(ref: string): Word | undefined {
  return ref.startsWith('custom:') ? customWord(ref.slice(7)) : VOCAB.find((v) => v.id === ref)
}

export function BuilderView() {
  const { t, lang, pick } = useI18n()
  const [mode, setModeState] = useState<Mode>(() => load<Mode>('jc.builderMode', 'build'))
  const [step, setStepState] = useState<Step>('situation')
  const [group, setGroup] = useState<PatternGroup>(PATTERNS[0].group)
  const [pattern, setPattern] = useState<Pattern>(PATTERNS[0])
  const [word, setWord] = useState<Word | null>(null)
  const [count, setCount] = useState(1)
  const [query, setQuery] = useState('')
  const [wordFilter, setWordFilter] = useState('')
  const [custom, setCustom] = useState('')
  const [recent, setRecent] = useState<Recent[]>(() => load<Recent[]>(RECENT_KEY, []))
  const [card, setCard] = useState<CardContent | null>(null)
  const [expanded, setExpanded] = useState<Key[]>([])

  const setMode = (m: Mode) => {
    setModeState(m)
    save('jc.builderMode', m)
  }

  const goTo = (s: Step) => {
    setStepState(s)
    window.scrollTo(0, 0)
  }

  const remember = (p: Pattern, w: Word, n: number) => {
    const entry: Recent = { p: p.id, w: w.id === 'custom' ? `custom:${w.ja}` : w.id, n }
    const next = [entry, ...recent.filter((r) => !(r.p === entry.p && r.w === entry.w && r.n === entry.n))].slice(0, MAX_RECENT)
    setRecent(next)
    save(RECENT_KEY, next)
  }

  /** Jump straight to a finished sentence (from search, recents, or a word tap). */
  const finish = (p: Pattern, w: Word, n = 1) => {
    setPattern(p)
    setGroup(p.group)
    setWord(w)
    setCount(n)
    setWordFilter('')
    remember(p, w, n)
    goTo('result')
  }

  const pickGroup = (g: PatternGroup) => {
    setGroup(g)
    goTo('frame')
  }

  const pickPattern = (p: Pattern) => {
    if (p.id !== pattern.id) {
      setExpanded([])
      setCount(1)
    }
    setPattern(p)
    setWordFilter('')
    // Keep the word when it still makes sense in the new sentence.
    if (word && fits(p, word)) return finish(p, word, 1)
    setWord(null)
    goTo('word')
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
  const groupInfo = GROUPS.find((g) => g.id === group)!
  const reached = STEPS.indexOf(step)

  // Quick swaps on the result card: other words from the same heading.
  const swaps = useMemo(() => {
    if (!word || word.id === 'custom') return []
    const type = word.types.find((x) => pattern.accepts.includes(x))
    return wordsFor(pattern)
      .filter((w) => w.id !== word.id && w.types.find((x) => pattern.accepts.includes(x)) === type)
      .slice(0, SWAP_COUNT)
  }, [pattern, word])

  const crumbs: { step: Step; label: string }[] = [
    { step: 'situation', label: groupInfo.icon },
    { step: 'frame', label: pick(pattern.label) },
    { step: 'word', label: word ? (word.id === 'custom' ? word.ja : lang === 'he' ? word.he : word.en) : t('builder.crumbWord') },
    { step: 'result', label: t('builder.crumbResult') },
  ]

  return (
    <div className="view builder">
      <div className="seg two mode-switch" role="radiogroup" aria-label={t('builder.mode')}>
        {(['build', 'translate'] as Mode[]).map((m) => (
          <button key={m} role="radio" aria-checked={m === mode} className={m === mode ? 'seg-btn active' : 'seg-btn'} onClick={() => setMode(m)}>
            {m === 'build' ? `🧩 ${t('builder.modeBuild')}` : `🌐 ${t('builder.modeTranslate')}`}
          </button>
        ))}
      </div>

      {mode === 'translate' ? (
        <TranslateTool />
      ) : (
        <>
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
                        finish(s.pattern, s.word)
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
            <section className="wizard">
              <nav className="crumbs" aria-label={t('builder.steps')}>
                {crumbs.map((c, i) => (
                  <button
                    key={c.step}
                    className={c.step === step ? 'crumb active' : 'crumb'}
                    aria-current={c.step === step ? 'step' : undefined}
                    disabled={i > reached && !(c.step === 'result' && result)}
                    onClick={() => goTo(c.step)}
                  >
                    <span className="crumb-n">{i + 1}</span>
                    <span className="crumb-label">{i <= reached || (c.step === 'result' && result) ? c.label : ''}</span>
                  </button>
                ))}
              </nav>

              {step === 'situation' && (
                <div className="wizard-step" key="situation">
                  <h3 className="step">{t('builder.qSituation')}</h3>
                  <div className="situations">
                    {GROUPS.map((g) => (
                      <button key={g.id} className={g.id === group ? 'situation active' : 'situation'} onClick={() => pickGroup(g.id)}>
                        <span className="situation-icon" aria-hidden>{g.icon}</span>
                        <span className="situation-name">{t(`groupShort.${g.id}`)}</span>
                        <span className="situation-count muted">{t('builder.nSentences', { n: String(PATTERNS.filter((p) => p.group === g.id).length) })}</span>
                      </button>
                    ))}
                  </div>
                  {recent.length > 0 && (
                    <div className="recent">
                      <span className="recent-title">{t('builder.recent')}</span>
                      <div className="chips">
                        {recent.map((r, i) => {
                          const p = PATTERNS.find((x) => x.id === r.p)
                          const w = resolveWord(r.w)
                          if (!p || !w) return null
                          return (
                            <button key={i} className="chip small" onClick={() => finish(p, w, r.n)}>
                              <Ja>{build(p, w, r.n).ja}</Ja>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 'frame' && (
                <div className="wizard-step" key="frame">
                  <h3 className="step">{t('builder.qFrame')}</h3>
                  <div className="frame-grid">
                    {PATTERNS.filter((p) => p.group === group).map((p) => (
                      <button
                        key={p.id}
                        className={p.id === pattern.id && reached > 1 ? 'frame active' : 'frame'}
                        onClick={() => pickPattern(p)}
                      >
                        {pick(p.label)}
                      </button>
                    ))}
                  </div>
                  <button className="link wizard-back" onClick={() => goTo('situation')}>
                    ‹ {t('builder.back')}
                  </button>
                </div>
              )}

              {step === 'word' && (
                <div className="wizard-step" key="word">
                  <h3 className="step">
                    {t('builder.qWord')} <span className="step-frame">{blank}</span>
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
                  <div className="wizard-scroll">
                    {sections.map(([heading, words]) => {
                      const open = expanded.includes(heading) || wordFilter.trim() !== ''
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
                                onClick={() => finish(pattern, w, count)}
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
                          if (custom.trim()) finish(pattern, customWord(custom), count)
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
                  </div>
                  <button className="link wizard-back" onClick={() => goTo('frame')}>
                    ‹ {t('builder.back')}
                  </button>
                </div>
              )}

              {step === 'result' && result && word && (
                <div className="wizard-step" key="result">
                  <section className="builder-result big" aria-live="polite">
                    <div className="result-gloss">{lang === 'he' ? result.he : result.en}</div>
                    <Ja className="result-ja">{result.ja}</Ja>
                    <div className="result-pron">
                      {lang === 'he' && <span>{result.he_pron}</span>}
                      <span className="romaji" dir="ltr">{result.romaji}</span>
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
                      <a
                        className="icon result-google"
                        href={translateWebUrl(result.ja, 'ja', lang === 'he' ? 'iw' : 'en')}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('builder.checkGoogle')}
                        title={t('builder.checkGoogle')}
                      >
                        🌐
                      </a>
                    </div>
                  </section>

                  {swaps.length > 0 && (
                    <div className="swaps">
                      <span className="recent-title">{t('builder.swap')}</span>
                      <div className="chips">
                        {swaps.map((w) => (
                          <button key={w.id} className="chip small swap" onClick={() => finish(pattern, w, count)}>
                            {lang === 'he' ? w.he : w.en} <Ja className="word-ja">{w.ja}</Ja>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="result-nav">
                    <button className="frame" onClick={() => goTo('word')}>✏️ {t('builder.otherWord')}</button>
                    <button className="frame" onClick={() => goTo('frame')}>↩︎ {t('builder.otherFrame')}</button>
                    <button className="frame active" onClick={() => goTo('situation')}>✨ {t('builder.newSentence')}</button>
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
      {card && <ShowCard card={card} onClose={() => setCard(null)} />}
    </div>
  )
}
