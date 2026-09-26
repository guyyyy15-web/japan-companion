import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { QuickSearch } from '../../content/nearby'
import { Ja } from '../../components/Ja'
import { useI18n } from '../../i18n'
import { compassWord, directionsUrl, formatDistance, nearest, searchUrl, type LatLon } from '../../lib/geo'
import { loadPlaces, type Place } from '../../lib/places'

const NearbyMap = lazy(() => import('./NearbyMap'))

const MAX = 50
const STEP = 10
/** Chains can be far apart (Pokémon Center, Don Quijote), so look up to 50 km away and show the distance. */
const MAX_METERS = 50_000

interface Props {
  search: QuickSearch
  total: number
  here: LatLon | null
  heading: number | null
  locating: boolean
  onLocate: () => void
  onClose: () => void
}

/** The nearest places for one quick search, from the downloaded OpenStreetMap data, with a map and Google Maps. */
export function PlaceResults({ search, total, here, heading, locating, onLocate, onClose }: Props) {
  const { t, lang, pick } = useI18n()
  const [places, setPlaces] = useState<Place[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(STEP)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    // The parent remounts this panel per category (key), so state starts fresh.
    let live = true
    loadPlaces(search.id).then(
      (p) => live && setPlaces(p),
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [search.id])

  const results = useMemo(() => (here && places ? nearest(here, places, MAX, MAX_METERS) : []), [here, places])

  return (
    <div className="place-results" id="place-results">
      <div className="place-results-head">
        <strong>
          {search.icon} {pick(search.label)}
        </strong>
        <button className="icon wallet-del" aria-label={t('card.close')} onClick={onClose}>
          ×
        </button>
      </div>
      <p className="muted small-start">{t('nearby.inJapan', { n: total.toLocaleString('en-US') })}</p>

      {!here ? (
        <button className="primary-btn" onClick={onLocate} disabled={locating}>
          📍 {locating ? t('nearby.locating') : t('nearby.findThese')}
        </button>
      ) : failed ? (
        <p className="warn">{t('nearby.placesOffline')}</p>
      ) : !places ? (
        <p className="muted">{t('nearby.loading')}</p>
      ) : results.length === 0 ? (
        <p className="muted">{t('nearby.noneHere')}</p>
      ) : (
        <>
          <ol className="nearby-list">
            {results.slice(0, shown).map((r, i) => (
              <li key={`${r.item.lat},${r.item.lon},${i}`}>
                <span className="nearby-rank">{i + 1}</span>
                <span className="nearby-arrow" aria-hidden style={{ transform: `rotate(${r.bearing - (heading ?? 0)}deg)` }}>
                  ↑
                </span>
                <span className="nearby-text">
                  {(r.item.name || r.item.en) && (
                    <span className="place-name">
                      {r.item.name && <Ja>{r.item.name}</Ja>}
                      {r.item.en && <span className="place-en" dir="ltr">{r.item.en}</span>}
                    </span>
                  )}
                  <span>
                    <bdi className="nearby-dist">{formatDistance(r.meters, lang)}</bdi>
                    <span className="muted"> · {compassWord(r.bearing, lang)}</span>
                  </span>
                </span>
                <a className="nearby-go" href={directionsUrl(r.item)} target="_blank" rel="noopener noreferrer">
                  {t('nearby.walk')} ↗
                </a>
              </li>
            ))}
          </ol>
          {shown < results.length && (
            <button className="link" onClick={() => setShown((n) => n + STEP)}>
              ＋ {t('nearby.showMore', { n: String(Math.min(STEP, results.length - shown)) })}
            </button>
          )}
          {navigator.onLine ? (
            <>
              <button className="link" onClick={() => setShowMap((s) => !s)}>
                🗺️ {showMap ? t('nearby.hideMap') : t('nearby.showMapN', { n: String(results.length) })}
              </button>
              {showMap && (
                <Suspense fallback={<p className="muted">{t('nearby.loading')}</p>}>
                  <NearbyMap here={here} places={results} color="#c8402a" />
                </Suspense>
              )}
            </>
          ) : (
            <p className="muted small-start">{t('nearby.mapOffline')}</p>
          )}
        </>
      )}
      <a className="quick typed" href={searchUrl(search.query)} target="_blank" rel="noopener noreferrer">
        <span aria-hidden>🔎</span>
        <span className="quick-text">
          <span>{t('nearby.alsoGoogle')}</span>
          <Ja className="quick-ja">{search.query}</Ja>
        </span>
      </a>
    </div>
  )
}
