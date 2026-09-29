import { useMemo, useState } from 'react'
import { CATEGORIES, LISTEN_PLACES, listening, phrases, type Category, type ListenPlace, type Phrase } from '../../content'
import { Chips } from '../../components/Chips'
import { Icon } from '../../components/Icon'
import { Ja } from '../../components/Ja'
import { ShowCard, type CardContent } from '../../components/ShowCard'
import { useI18n } from '../../i18n'
import { SpeakButtons } from '../../components/SpeakButtons'
import { matches } from '../../lib/search'
import { load, save } from '../../lib/storage'
import { Practice } from './Practice'

type Filter = 'favorites' | 'listening' | 'practice' | Category
const FAV_KEY = 'jc.favorites'

export function PhrasesView() {
  const { t, lang, pick } = useI18n()
  const [filter, setFilter] = useState<Filter>(() => (load<string[]>(FAV_KEY, []).length ? 'favorites' : 'basics'))
  const [query, setQuery] = useState('')
  const [favs, setFavs] = useState<string[]>(() => load<string[]>(FAV_KEY, []))
  const [card, setCard] = useState<CardContent | null>(null)
  const [place, setPlace] = useState<'all' | ListenPlace>('all')

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]
    setFavs(next)
    save(FAV_KEY, next)
  }

  const chips = [
    { id: 'favorites' as Filter, label: t('phrases.favorites') },
    ...CATEGORIES.map((c) => ({ id: c as Filter, label: t(`cat.${c}`) })),
    { id: 'listening' as Filter, label: t('phrases.listening') },
    { id: 'practice' as Filter, label: `🎴 ${t('practice.title')}` },
  ]

  const list = useMemo(() => {
    const q = query.trim()
    if (q) return phrases.filter((p) => matches(q, [p.ja, p.kana, p.romaji, p.he_pron, p.he, p.en]))
    if (filter === 'favorites') return favs.map((id) => phrases.find((p) => p.id === id)).filter((p): p is Phrase => !!p)
    if (filter === 'listening' || filter === 'practice') return []
    return phrases.filter((p) => p.cat === filter)
  }, [query, filter, favs])

  const showListening = !query.trim() && filter === 'listening'

  return (
    <div className="view">
      <input
        className="search"
        type="search"
        placeholder={t('phrases.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {!query.trim() && <Chips items={chips} value={filter} onChange={setFilter} />}

      {!query.trim() && filter === 'practice' ? (
        <Practice favs={favs} />
      ) : showListening ? (
        <>
          <Chips
            items={[
              { id: 'all' as const, label: t('signs.all') },
              ...LISTEN_PLACES.map((p) => ({ id: p, label: t(`place.${p}`) })),
            ]}
            value={place}
            onChange={setPlace}
          />
          <ul className="cards">
            {listening
              .filter((l) => place === 'all' || l.where === place)
              .map((l) => (
                <li key={l.id} className="card listen">
                  <div className="meaning-top">👂 {pick(l)}</div>
                  <div className="row">
                    <Ja className="ja-line">{l.ja}</Ja>
                    <div className="actions">
                      <SpeakButtons text={l.ja} slowButton={false} />
                    </div>
                  </div>
                  <div className="romaji" dir="ltr">{l.romaji}</div>
                  <div className="reply">
                    <div className="reply-title">
                      💬 {t('phrases.reply')}: <span className="muted">{lang === 'he' ? l.reply_he : l.reply_en}</span>
                    </div>
                    {l.replies?.map((r) => (
                      <div key={r.ja} className="reply-option">
                        <div className="reply-text">
                          <span className="reply-meaning">{pick(r)}</span>
                          <Ja className="reply-ja">{r.ja}</Ja>
                          <span className="reply-pron">
                            {lang === 'he' && <span>{r.he_pron}</span>}
                            <span className="romaji" dir="ltr">{r.romaji}</span>
                          </span>
                        </div>
                        <div className="actions">
                          <SpeakButtons text={r.ja} />
                          <button
                            className="icon"
                            aria-label={t('phrases.show')}
                            onClick={() => setCard({ ja: r.ja, kana: r.kana, romaji: r.romaji, meaning: pick(r) })}
                          >
                            <Icon name="card" size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        </>
      ) : list.length === 0 ? (
        <p className="empty">{filter === 'favorites' && !query ? t('phrases.noFavorites') : t('phrases.noResults')}</p>
      ) : (
        <ul className="cards">
          {list.map((p) => {
            const fav = favs.includes(p.id)
            return (
              <li key={p.id} className="card">
                <div className="meaning-top">{pick(p)}</div>
                <button
                  className="phrase-main"
                  onClick={() => setCard({ ja: p.ja, kana: p.kana, romaji: p.romaji, meaning: pick(p) })}
                  aria-label={t('phrases.show')}
                >
                  <Ja className="ja-line">{p.ja}</Ja>
                </button>
                <div className="pron">
                  {lang === 'he' ? <span>{p.he_pron}</span> : null}
                  <span className="romaji" dir="ltr">{p.romaji}</span>
                </div>
                <div className="actions">
                  <SpeakButtons text={p.ja} />
                  <button
                    className="icon"
                    aria-label={t('phrases.show')}
                    onClick={() => setCard({ ja: p.ja, kana: p.kana, romaji: p.romaji, meaning: pick(p) })}
                  >
                    <Icon name="card" size={20} />
                  </button>
                  <button
                    className={fav ? 'icon fav on' : 'icon fav'}
                    aria-label={fav ? t('phrases.unfavorite') : t('phrases.favorite')}
                    aria-pressed={fav}
                    onClick={() => toggleFav(p.id)}
                  >
                    {fav ? '★' : '☆'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {card && <ShowCard card={card} onClose={() => setCard(null)} />}
    </div>
  )
}
