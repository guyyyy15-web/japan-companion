import { useState } from 'react'
import { Ja } from '../../components/Ja'
import type { CardContent } from '../../components/ShowCard'
import { useI18n } from '../../i18n'
import { addressDirectionsUrl, directionsUrl, type LatLon } from '../../lib/geo'
import { load, save } from '../../lib/storage'

/** A saved place: the hotel (with its address for the taxi card) or a spot saved by GPS. */
export interface Place {
  id: string
  name: string
  address?: string
  lat?: number
  lon?: number
}

const KEY = 'jc.places'
const TAXI_LEAD = 'この住所までお願いします'
const TAXI_ROMAJI = 'kono jūsho made onegai shimasu'

function loadPlaces(): Place[] {
  const raw = load<unknown>(KEY, [])
  return Array.isArray(raw)
    ? raw.filter((p): p is Place => !!p && typeof p.id === 'string' && typeof p.name === 'string' && (!!p.address || Number.isFinite(p.lat)))
    : []
}

/** Hotels and saved spots: a big taxi card with the Japanese address, and directions back. */
export function PlacesPanel({ here, onShow }: { here: LatLon | null; onShow: (card: CardContent) => void }) {
  const { t } = useI18n()
  const [places, setPlaces] = useState<Place[]>(loadPlaces)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [locating, setLocating] = useState(false)

  const store = (next: Place[]) => {
    setPlaces(next)
    save(KEY, next)
  }
  const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

  const addAddress = () => {
    if (!address.trim()) return
    store([...places, { id: id(), name: name.trim() || t('places.hotel'), address: address.trim() }])
    setName('')
    setAddress('')
    setAdding(false)
  }

  const saveSpot = (at: LatLon) => {
    const label = name.trim() || `${t('places.spot')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    store([...places, { id: id(), name: label, lat: at.lat, lon: at.lon }])
    setName('')
    setAdding(false)
  }

  const saveHere = () => {
    if (here) return saveSpot(here)
    if (!('geolocation' in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false)
        saveSpot({ lat: p.coords.latitude, lon: p.coords.longitude })
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 20000 },
    )
  }

  return (
    <section className="panel places">
      <h3>🏨 {t('places.title')}</h3>
      {places.length === 0 && !adding && <p className="muted small-start">{t('places.empty')}</p>}
      <ul className="place-list">
        {places.map((p) => (
          <li key={p.id}>
            <div className="place-text">
              <strong dir="auto">{p.name}</strong>
              {p.address && <Ja className="place-address">{p.address}</Ja>}
              {!p.address && <span className="muted">📍 {t('places.gps')}</span>}
            </div>
            <div className="place-actions">
              {p.address && (
                <button
                  className="nearby-go"
                  onClick={() => onShow({ ja: p.address!, kana: p.address!, romaji: TAXI_ROMAJI, meaning: `${t('places.taxiMeaning')} ${p.name}`, lead: TAXI_LEAD })}
                >
                  🚕 {t('places.taxi')}
                </button>
              )}
              <a
                className="nearby-go"
                href={p.address ? addressDirectionsUrl(p.address) : directionsUrl({ lat: p.lat!, lon: p.lon! })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('places.go')} ↗
              </a>
              <button
                className="icon wallet-del"
                aria-label={t('wallet.delete')}
                onClick={() => window.confirm(t('places.confirmDelete', { name: p.name })) && store(places.filter((x) => x.id !== p.id))}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="place-form">
          <input className="search small" value={name} maxLength={40} placeholder={t('places.namePlaceholder')} onChange={(e) => setName(e.target.value)} />
          <textarea
            className="search small"
            rows={2}
            value={address}
            placeholder={t('places.addressPlaceholder')}
            onChange={(e) => setAddress(e.target.value)}
          />
          <small className="muted">{t('places.addressHint')}</small>
          <div className="place-form-actions">
            <button className="primary-btn" onClick={addAddress} disabled={!address.trim()}>
              {t('places.save')}
            </button>
            <button className="link" onClick={saveHere} disabled={locating}>
              📍 {locating ? t('nearby.locating') : t('places.saveHere')}
            </button>
            <button className="link" onClick={() => setAdding(false)}>
              {t('places.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button className="link" onClick={() => setAdding(true)}>
          ＋ {t('places.add')}
        </button>
      )}
    </section>
  )
}
