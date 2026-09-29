import { useState } from 'react'
import { ATTRACTIONS, CITIES, INTEREST_ICON, INTERESTS, type Attraction, type City, type Interest } from '../../content/attractions'
import { Ja } from '../../components/Ja'
import { useI18n } from '../../i18n'
import { searchUrl } from '../../lib/geo'
import { load, save } from '../../lib/storage'

const KEY = 'jc.attractions'

interface Marks {
  want: string[]
  booked: string[]
  been: string[]
}

type Mark = keyof Marks

function loadMarks(): Marks {
  const m = load<Partial<Marks>>(KEY, {})
  return { want: m.want ?? [], booked: m.booked ?? [], been: m.been ?? [] }
}

/** Hand-picked attractions by city and interest, with booking warnings and a personal list. */
export function AttractionsView() {
  const { t, pick } = useI18n()
  const [city, setCity] = useState<'all' | City>(() => load('jc.attractionsCity', 'all'))
  const [interests, setInterests] = useState<Interest[]>([])
  const [onlyMine, setOnlyMine] = useState(false)
  const [marks, setMarks] = useState<Marks>(loadMarks)

  const toggle = (mark: Mark, id: string) => {
    const has = marks[mark].includes(id)
    const next = { ...marks, [mark]: has ? marks[mark].filter((x) => x !== id) : [...marks[mark], id] }
    setMarks(next)
    save(KEY, next)
  }

  const pickCity = (c: 'all' | City) => {
    setCity(c)
    save('jc.attractionsCity', c)
  }

  const toggleInterest = (i: Interest) => setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))

  const shown = ATTRACTIONS.filter(
    (x) =>
      (city === 'all' || x.city === city) &&
      (interests.length === 0 || x.interests.some((i) => interests.includes(i))) &&
      (!onlyMine || marks.want.includes(x.id)),
  )
  // Bookable things not booked yet, hardest first: the ones to sort out now.
  const toBook = ATTRACTIONS.filter((x) => x.booking !== 'none' && !marks.booked.includes(x.id) && !marks.been.includes(x.id))
    .filter((x) => city === 'all' || x.city === city)
    .sort((x, y) => (x.booking === y.booking ? 0 : x.booking === 'hard' ? -1 : 1))

  return (
    <div className="attractions">
      <div className="chips" role="tablist" aria-label={t('attr.city')}>
        {(['all', ...CITIES] as const).map((c) => (
          <button key={c} role="tab" aria-selected={c === city} className={c === city ? 'chip active' : 'chip'} onClick={() => pickCity(c)}>
            {c === 'all' ? t('signs.all') : t(`attr.city.${c}`)}
          </button>
        ))}
      </div>
      <div className="interest-row">
        {INTERESTS.map((i) => (
          <button key={i} className={interests.includes(i) ? 'tool-chip on' : 'tool-chip'} aria-pressed={interests.includes(i)} onClick={() => toggleInterest(i)}>
            {INTEREST_ICON[i]} {t(`attr.interest.${i}`)}
          </button>
        ))}
        <button className={onlyMine ? 'tool-chip on' : 'tool-chip'} aria-pressed={onlyMine} onClick={() => setOnlyMine(!onlyMine)}>
          ⭐ {t('attr.mine')} <bdi>{marks.want.length}</bdi>
        </button>
      </div>

      {toBook.length > 0 && (
        <details className="panel book-now" open={toBook.some((x) => x.booking === 'hard')}>
          <summary>
            📅 {t('attr.bookNow')} <bdi className="chip-count">{toBook.length}</bdi>
          </summary>
          <ul>
            {toBook.map((x) => (
              <li key={x.id}>
                <span className={`badge ${x.booking}`}>{x.booking === 'hard' ? '🔴' : '🟡'}</span>
                <a href={`#attr-${x.id}`}>{pick(x.name)}</a>
                <span className="muted"> · {t(`attr.city.${x.city}`)}</span>
              </li>
            ))}
          </ul>
          <p className="muted small-start">{t('attr.bookNowNote')}</p>
        </details>
      )}

      <ul className="attr-list">
        {shown.map((x) => (
          <AttractionCard key={x.id} x={x} marks={marks} onToggle={toggle} />
        ))}
      </ul>
      {shown.length === 0 && <p className="empty">{t('attr.none')}</p>}
      <p className="muted small-start">{t('attr.note')}</p>
    </div>
  )
}

function AttractionCard({ x, marks, onToggle }: { x: Attraction; marks: Marks; onToggle: (m: Mark, id: string) => void }) {
  const { t, pick } = useI18n()
  const want = marks.want.includes(x.id)
  const booked = marks.booked.includes(x.id)
  const been = marks.been.includes(x.id)
  return (
    <li id={`attr-${x.id}`} className={been ? 'attr-card been' : 'attr-card'}>
      <div className="attr-head">
        <span className="attr-icon" aria-hidden>{x.icon}</span>
        <div className="attr-title">
          <strong>{pick(x.name)}</strong>
          <Ja className="attr-ja">{x.ja}</Ja>
        </div>
        <button className={want ? 'icon fav on' : 'icon fav'} aria-pressed={want} aria-label={t('attr.want')} onClick={() => onToggle('want', x.id)}>
          {want ? '★' : '☆'}
        </button>
      </div>
      <p className="attr-what">{pick(x.what)}</p>
      <div className={`attr-booking ${x.booking}`}>
        {x.booking === 'none' ? `🟢 ${t('attr.noBooking')}` : x.booking === 'book' ? `🟡 ${t('attr.bookAhead')}` : `🔴 ${t('attr.hardBooking')}`}
        {x.bookNote && <span> {pick(x.bookNote)}</span>}
      </div>
      {x.tip && <p className="attr-tip">💡 {pick(x.tip)}</p>}
      <div className="attr-actions">
        <a className="tool-chip" href={searchUrl(x.ja)} target="_blank" rel="noopener noreferrer">
          📍 {t('attr.map')}
        </a>
        {x.url && (
          <a className="tool-chip" href={x.url} target="_blank" rel="noopener noreferrer">
            🔗 {t('attr.site')}
          </a>
        )}
        {x.booking !== 'none' && (
          <button className={booked ? 'tool-chip on' : 'tool-chip'} aria-pressed={booked} onClick={() => onToggle('booked', x.id)}>
            🎟️ {booked ? t('attr.booked') : t('attr.markBooked')}
          </button>
        )}
        <button className={been ? 'tool-chip on' : 'tool-chip'} aria-pressed={been} onClick={() => onToggle('been', x.id)}>
          ✓ {t('attr.been')}
        </button>
      </div>
    </li>
  )
}
