import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  LOCAL_APPS,
  NEARBY_PHRASES,
  NEARBY_TIPS,
  QUICK_SEARCHES,
  SEARCH_CATEGORIES,
  TATTOO_PHRASES,
  TATTOO_SEARCHES,
  TATTOO_SITE,
  TATTOO_TIPS,
  TRASH_MAP_URL,
  type NearbyPhrase,
  type QuickSearch,
} from '../../content/nearby'
import { Ja } from '../../components/Ja'
import { ShowCard, type CardContent } from '../../components/ShowCard'
import { SpeakButtons } from '../../components/SpeakButtons'
import { Icon } from '../../components/Icon'
import { useI18n } from '../../i18n'
import { PlacesPanel } from './PlacesPanel'
import { PlaceResults } from './PlaceResults'
import { loadPlaces, loadPlacesIndex, type PlacesIndex } from '../../lib/places'
import type { Key } from '../../i18n/en'
import { matches } from '../../lib/search'
import { load, save } from '../../lib/storage'
import {
  BRAND_NAMES,
  compassWord,
  decode,
  directionsUrl,
  formatDistance,
  nearest,
  searchUrl,
  type Facilities,
  type FacilitiesFile,
  type LatLon,
} from '../../lib/geo'

const NearbyMap = lazy(() => import('./NearbyMap'))

type Kind = 'toilets' | 'bins' | 'konbini'
type Status = 'idle' | 'locating' | 'ready' | 'denied' | 'error'
const MAX_METERS = 3000
const LIMIT = 8
const KINDS: { id: Kind; icon: string; label: Key; nearest: Key; none: Key; color: string }[] = [
  { id: 'toilets', icon: '🚻', label: 'nearby.toilets', nearest: 'nearby.nearestToilets', none: 'nearby.noneToilets', color: '#27395a' },
  { id: 'bins', icon: '🗑️', label: 'nearby.bins', nearest: 'nearby.nearestBins', none: 'nearby.noneBins', color: '#c8402a' },
  { id: 'konbini', icon: '🏪', label: 'nearby.konbini', nearest: 'nearby.nearestKonbini', none: 'nearby.noneKonbini', color: '#3f7a4f' },
]

let cache: Promise<Facilities> | null = null
/** The bundled OpenStreetMap snapshot; precached by the service worker, so it loads offline too. */
function loadFacilities(): Promise<Facilities> {
  cache ??= fetch(`${import.meta.env.BASE_URL}data/facilities.json`)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status))
      return r.json() as Promise<FacilitiesFile>
    })
    .then(decode)
  cache.catch(() => (cache = null))
  return cache
}

type OrientationWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number }
type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

export function NearbyView() {
  const { t, lang, pick } = useI18n()
  const [kind, setKind] = useState<Kind>('toilets')
  const [status, setStatus] = useState<Status>('idle')
  const [here, setHere] = useState<LatLon | null>(null)
  const [data, setData] = useState<Facilities | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [card, setCard] = useState<CardContent | null>(null)
  const [category, setCategory] = useState(SEARCH_CATEGORIES[0].id)
  const [text, setText] = useState('')
  // Categories with an in-app list (downloaded OpenStreetMap places); the rest open Google Maps.
  const [placesIndex, setPlacesIndex] = useState<PlacesIndex | null>(null)
  const [selected, setSelected] = useState<QuickSearch | null>(null)
  const [saving, setSaving] = useState<{ done: number; total: number } | null>(null)
  // Tattoo-friendly mode: onsen, sento, sauna, gym and pool searches limited to places that allow tattoos.
  const [tattoo, setTattoo] = useState(() => load('jc.tattooFriendly', false))
  const toggleTattoo = () => {
    setTattoo(!tattoo)
    save('jc.tattooFriendly', !tattoo)
  }
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    loadPlacesIndex().then(setPlacesIndex)
    loadFacilities().then(setData, () => setData(null))
    return () => {
      if (watchId.current !== null) navigator.geolocation?.clearWatch(watchId.current)
    }
  }, [])

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) return setStatus('error')
    setStatus('locating')
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setHere({ lat: p.coords.latitude, lon: p.coords.longitude })
        setStatus('ready')
      },
      (e) => setStatus(e.code === e.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 15000 },
    )
  }, [])

  // Optional live compass: rotates the arrows to where you're facing (iPhone asks for permission once).
  const enableCompass = async () => {
    const ctor = window.DeviceOrientationEvent as OrientationCtor | undefined
    try {
      if (ctor?.requestPermission && (await ctor.requestPermission()) !== 'granted') return
    } catch {
      return
    }
    window.addEventListener('deviceorientation', (e) => {
      const ev = e as OrientationWithCompass
      const h = ev.webkitCompassHeading ?? (ev.alpha !== null ? 360 - ev.alpha : null)
      if (h !== null && h !== undefined) setHeading(h)
    })
  }

  const listed = (q: QuickSearch) => (tattoo ? undefined : placesIndex?.categories[q.id])

  const openList = (q: QuickSearch) => {
    setSelected(q)
    if (status !== 'ready' && status !== 'locating') locate()
    requestAnimationFrame(() => document.getElementById('place-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  // Fetch every category once so the lists work offline (the service worker keeps them).
  const saveAll = async () => {
    const ids = Object.keys(placesIndex?.categories ?? {})
    setSaving({ done: 0, total: ids.length })
    for (const [i, id] of ids.entries()) {
      await loadPlaces(id).catch(() => undefined)
      setSaving({ done: i + 1, total: ids.length })
    }
  }

  const current = KINDS.find((k) => k.id === kind)!
  const typed = text.trim()
  // Typing filters every quick search (in Hebrew, English or Japanese); anything else is searched as typed.
  const pool = tattoo ? TATTOO_SEARCHES : QUICK_SEARCHES
  const searches = typed
    ? pool.filter((s) => matches(typed, [s.label.he, s.label.en, s.query]))
    : tattoo
      ? TATTOO_SEARCHES
      : SEARCH_CATEGORIES.find((c) => c.id === category)!.items
  const typedQuery = tattoo ? `タトゥーOK ${typed}` : typed

  const results = useMemo(
    () => (here && data ? nearest(here, data[kind], LIMIT, MAX_METERS) : []),
    [here, data, kind],
  )

  const phraseList = (list: NearbyPhrase[]) => (
    <ul className="nearby-phrases">
      {list.map((p) => (
        <li key={p.id}>
          <div className="nearby-phrase-text">
            <span className="meaning">{pick(p)}</span>
            <Ja className="ja-line small">{p.ja}</Ja>
            <span className="romaji" dir="ltr">{p.romaji}</span>
          </div>
          <div className="actions">
            <SpeakButtons text={p.ja} slowButton={false} />
            <button
              className="icon"
              aria-label={t('phrases.show')}
              onClick={() => setCard({ ja: p.ja, kana: p.kana, romaji: p.romaji, meaning: pick(p) })}
            >
              <Icon name="card" size={20} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="view nearby">
      <div className="seg" role="radiogroup" aria-label={t('nearby.kind')}>
        {KINDS.map((k) => (
          <button
            key={k.id}
            role="radio"
            aria-checked={kind === k.id}
            className={kind === k.id ? 'seg-btn active' : 'seg-btn'}
            onClick={() => setKind(k.id)}
          >
            {k.icon} {t(k.label)}
          </button>
        ))}
      </div>

      <section className="panel nearby-panel">
        {status !== 'ready' ? (
          <>
            <button className="primary-btn" onClick={locate} disabled={status === 'locating'}>
              📍 {status === 'locating' ? t('nearby.locating') : t('nearby.find')}
            </button>
            {status === 'denied' && <p className="warn">{t('nearby.denied')}</p>}
            {status === 'error' && <p className="warn">{t('nearby.error')}</p>}
            <p className="muted small-start">{t('nearby.offlineNote')}</p>
          </>
        ) : (
          <>
            <div className="nearby-head">
              <strong>{t(current.nearest)}</strong>
              {heading === null ? (
                <button className="link" onClick={enableCompass}>🧭 {t('nearby.compass')}</button>
              ) : (
                <span className="muted small-start">🧭 {t('nearby.compassOn')}</span>
              )}
            </div>
            {!data && <p className="muted">{t('nearby.loading')}</p>}
            {data && results.length === 0 && <p className="muted">{t(current.none)}</p>}
            <ol className="nearby-list">
              {results.map((r, i) => (
                <li key={`${r.item.lat},${r.item.lon}`}>
                  <span className="nearby-rank">{i + 1}</span>
                  <span
                    className="nearby-arrow"
                    aria-hidden
                    style={{ transform: `rotate(${r.bearing - (heading ?? 0)}deg)` }}
                  >
                    ↑
                  </span>
                  <span className="nearby-text">
                    <bdi className="nearby-dist">{formatDistance(r.meters, lang)}</bdi>
                    <span className="muted"> · {compassWord(r.bearing, lang)}</span>
                    {r.item.paid && <span className="tag">{t('nearby.paid')}</span>}
                    {r.item.brand && <span className="tag brand">{BRAND_NAMES[r.item.brand]}</span>}
                  </span>
                  <a className="nearby-go" href={directionsUrl(r.item)} target="_blank" rel="noopener noreferrer">
                    {t('nearby.walk')} ↗
                  </a>
                </li>
              ))}
            </ol>
            {heading === null && results.length > 0 && <p className="muted small-start">{t('nearby.northUp')}</p>}
            {here && results.length > 0 && (
              navigator.onLine ? (
                <>
                  <button className="link" onClick={() => setShowMap((s) => !s)}>
                    🗺️ {showMap ? t('nearby.hideMap') : t('nearby.showMap')}
                  </button>
                  {showMap && (
                    <Suspense fallback={<p className="muted">{t('nearby.loading')}</p>}>
                      <NearbyMap here={here} places={results} color={current.color} />
                    </Suspense>
                  )}
                </>
              ) : (
                <p className="muted small-start">{t('nearby.mapOffline')}</p>
              )
            )}
            {data && (
              <p className="muted attribution">
                © OpenStreetMap contributors · {t('nearby.updated', { date: data.updated })}
              </p>
            )}
          </>
        )}
      </section>

      <PlacesPanel here={here} onShow={setCard} />

      <section className="panel nearby-search">
        <h3>{t('nearby.search')}</h3>
        <input
          className="search small"
          type="search"
          enterKeyHint="search"
          placeholder={t('nearby.searchAny')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className={tattoo ? 'tattoo-toggle on' : 'tattoo-toggle'} aria-pressed={tattoo} onClick={toggleTattoo}>
          <span aria-hidden>🐉</span> {t('nearby.tattoo')}
          <span className="tattoo-switch" aria-hidden />
        </button>
        {!typed && !tattoo && (
          <div className="group-tabs four" role="tablist">
            {SEARCH_CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={c.id === category}
                className={c.id === category ? 'group-tab active' : 'group-tab'}
                onClick={() => setCategory(c.id)}
              >
                <span aria-hidden>{c.icon}</span>
                <span>{pick(c.label)}</span>
              </button>
            ))}
          </div>
        )}
        {selected && !tattoo && placesIndex?.categories[selected.id] && (
          <PlaceResults
            key={selected.id}
            search={selected}
            total={placesIndex.categories[selected.id]}
            here={here}
            heading={heading}
            locating={status === 'locating'}
            onLocate={locate}
            onClose={() => setSelected(null)}
          />
        )}
        <div className="quick-grid">
          {typed && (
            <a className="quick typed" href={searchUrl(typedQuery)} target="_blank" rel="noopener noreferrer">
              <span aria-hidden>🔎</span>
              <span className="quick-text">
                <span>{t('nearby.searchTyped', { text: typedQuery })}</span>
              </span>
            </a>
          )}
          {searches.map((q) =>
            listed(q) ? (
              <button
                key={q.id}
                className={selected?.id === q.id ? 'quick listed active' : 'quick listed'}
                aria-pressed={selected?.id === q.id}
                onClick={() => openList(q)}
              >
                <span aria-hidden>{q.icon}</span>
                <span className="quick-text">
                  <span>{pick(q.label)}</span>
                  <Ja className="quick-ja">{q.query}</Ja>
                </span>
                <span className="quick-pin" aria-label={t('nearby.hasList')}>📍</span>
              </button>
            ) : (
              <a key={q.id} className="quick" href={searchUrl(q.query)} target="_blank" rel="noopener noreferrer">
                <span aria-hidden>{q.icon}</span>
                <span className="quick-text">
                  <span>{pick(q.label)}</span>
                  <Ja className="quick-ja">{q.query}</Ja>
                </span>
              </a>
            ),
          )}
          {!typed && !tattoo && category === 'essentials' && (
            <a className="quick" href={TRASH_MAP_URL} target="_blank" rel="noopener noreferrer">
              <span aria-hidden>🗺️</span>
              <span className="quick-text">
                <span>{t('nearby.trashMap')}</span>
              </span>
            </a>
          )}
        </div>
        <p className="muted small-start">{t(tattoo ? 'nearby.tattooNote' : placesIndex ? 'nearby.listNote' : 'nearby.searchNote')}</p>
        {placesIndex && !tattoo && (
          <button className="link" onClick={saveAll} disabled={!!saving && saving.done < saving.total}>
            {!saving
              ? `⬇️ ${t('nearby.saveAll')}`
              : saving.done < saving.total
                ? `⬇️ ${t('nearby.saving', { done: String(saving.done), total: String(saving.total) })}`
                : `✓ ${t('nearby.saved')}`}
          </button>
        )}
        {tattoo && (
          <div className="tattoo-panel">
            <a className="app-link" href={TATTOO_SITE.url} target="_blank" rel="noopener noreferrer">
              <span className="app-icon" aria-hidden>🐉</span>
              <span className="app-text">
                <span className="app-name">{TATTOO_SITE.name}</span>
                <span className="muted app-what">{t('nearby.tattooSite')}</span>
              </span>
              <span aria-hidden className="app-go">↗</span>
            </a>
            <ul className="tips">
              {TATTOO_TIPS.map((tip, i) => (
                <li key={i}>{pick(tip)}</li>
              ))}
            </ul>
            {phraseList(TATTOO_PHRASES)}
          </div>
        )}
      </section>

      <details className="panel guide nearby-apps">
        <summary>
          <span aria-hidden>📱</span> {t('nearby.apps')}
        </summary>
        <p className="muted small-start">{t('nearby.appsNote')}</p>
        {LOCAL_APPS.map((g) => (
          <div key={g.id} className="app-group">
            <div className="group-title">{pick(g.label)}</div>
            <ul className="apps">
              {g.apps.map((a) => (
                <li key={a.id}>
                  <a className="app-link" href={a.url} target="_blank" rel="noopener noreferrer">
                    <span className="app-icon" aria-hidden>{a.icon}</span>
                    <span className="app-text">
                      <span className="app-name" dir="auto">{a.name}</span>
                      <span className="muted app-what">{pick(a.what)}</span>
                    </span>
                    <span aria-hidden className="app-go">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>

      <section className="panel">
        <h3>{t('nearby.say')}</h3>
        {phraseList(NEARBY_PHRASES)}
      </section>

      <section className="panel">
        <h3>💡 {t('nearby.tips')}</h3>
        <ul className="tips">
          {NEARBY_TIPS.map((tip, i) => (
            <li key={i}>{pick(tip)}</li>
          ))}
        </ul>
      </section>

      {card && <ShowCard card={card} onClose={() => setCard(null)} />}
    </div>
  )
}
