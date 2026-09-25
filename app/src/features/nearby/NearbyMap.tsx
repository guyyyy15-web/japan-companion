import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLon, Nearby, Facility } from '../../lib/geo'
import { directionsUrl } from '../../lib/geo'

/** Online-only map: OpenStreetMap tiles, you, and the nearest places. Loaded lazily. */
export default function NearbyMap({ here, places, color }: { here: LatLon; places: Nearby<Facility>[]; color: string }) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!el.current) return
    const map = L.map(el.current, { zoomControl: true, attributionControl: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    const me = L.circleMarker([here.lat, here.lon], { radius: 8, color: '#27395a', fillColor: '#27395a', fillOpacity: 0.9, weight: 3 })
    me.addTo(map)
    const pts: L.LatLngExpression[] = [[here.lat, here.lon]]
    places.forEach((p, i) => {
      const m = L.circleMarker([p.item.lat, p.item.lon], { radius: 7, color, fillColor: color, fillOpacity: 0.85, weight: 2 })
      m.bindPopup(`<b>${i + 1}</b> · <a href="${directionsUrl(p.item)}" target="_blank" rel="noopener">Google Maps ↗</a>`)
      m.addTo(map)
      pts.push([p.item.lat, p.item.lon])
    })
    map.fitBounds(L.latLngBounds(pts), { padding: [28, 28], maxZoom: 17 })
    return () => {
      map.remove()
    }
  }, [here, places, color])

  return <div ref={el} className="nearby-map" />
}
