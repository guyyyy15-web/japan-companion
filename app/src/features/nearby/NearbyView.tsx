import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NEARBY_PHRASES, NEARBY_TIPS, QUICK_SEARCHES, TRASH_MAP_URL } from '../../content/nearby'
import { Ja } from '../../components/Ja'
import { ShowCard, type CardContent } from '../../components/ShowCard'
import { SpeakButtons } from '../../components/SpeakButtons'
import { Icon } from '../../components/Icon'
import { useI18n } from '../../i18n'
import {
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

type Kind = 'toilets' | 'bins'
type Status = 'idle' | 'locating' | 'ready' | 'denied' | 'error'
const MAX_METERS = 3000
const LIMIT = 8
const COLORS: Record<Kind, string> = { toilets: '#27395a', bins: '#c8402a' }

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
  const watchId = useRef<number | null>(null)

  useEffect(() => {
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

  const results = useMemo(
    () => (here && data ? nearest(here, data[kind], LIMIT, MAX_METERS) : []),
    [here, data, kind],
  )

  return (
    <div className="view nearby">
      <div className="seg" role="radiogroup" aria-label={t('nearby.kind')}>
        {(['toilets', 'bins'] as Kind[]).map((k) => (
          <button
            key={k}
            role="radio"
            aria-checked={kind === k}
            className={kind === k ? 'seg-btn active' : 'seg-btn'}
            onClick={() => setKind(k)}
          >
            {k === 'toilets' ? `🚻 ${t('nearby.toilets')}` : `🗑️ ${t('nearby.bins')}`}
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
              <strong>{t(kind === 'toilets' ? 'nearby.nearestToilets' : 'nearby.nearestBins')}</strong>
              {heading === null ? (
                <button className="link" onClick={enableCompass}>🧭 {t('nearby.compass')}</button>
              ) : (
                <span className="muted small-start">🧭 {t('nearby.compassOn')}</span>
              )}
            </div>
            {!data && <p className="muted">{t('nearby.loading')}</p>}
            {data && results.length === 0 && <p className="muted">{t(kind === 'toilets' ? 'nearby.noneToilets' : 'nearby.noneBins')}</p>}
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
                      <NearbyMap here={here} places={results} color={COLORS[kind]} />
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

      <section className="panel">
        <h3>{t('nearby.search')}</h3>
        <div className="quick-grid">
          {QUICK_SEARCHES.map((q) => (
            <a key={q.id} className="quick" href={searchUrl(q.query)} target="_blank" rel="noopener noreferrer">
              <span aria-hidden>{q.icon}</span>
              <span>{pick(q.label)}</span>
            </a>
          ))}
          <a className="quick" href={TRASH_MAP_URL} target="_blank" rel="noopener noreferrer">
            <span aria-hidden>🗺️</span>
            <span>{t('nearby.trashMap')}</span>
          </a>
        </div>
        <p className="muted small-start">{t('nearby.searchNote')}</p>
      </section>

      <section className="panel">
        <h3>{t('nearby.say')}</h3>
        <ul className="nearby-phrases">
          {NEARBY_PHRASES.map((p) => (
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
