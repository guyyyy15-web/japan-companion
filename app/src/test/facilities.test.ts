import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { decode, nearest, type FacilitiesFile } from '../lib/geo'

// The bundled OpenStreetMap snapshot written by scripts/fetch-facilities.mjs.
const file = JSON.parse(readFileSync(new URL('../../public/data/facilities.json', import.meta.url), 'utf8')) as FacilitiesFile
const data = decode(file)
const inJapan = (p: { lat: number; lon: number }) => p.lat > 24 && p.lat < 46 && p.lon > 122 && p.lon < 146.5

describe('offline facilities data', () => {
  it('has a plausible nationwide set', () => {
    expect(data.toilets.length).toBeGreaterThan(20000)
    expect(data.bins.length).toBeGreaterThan(1000)
    expect(data.konbini.length).toBeGreaterThan(20000)
    // Most konbini are one of the big three chains.
    expect(data.konbini.filter((k) => k.brand).length / data.konbini.length).toBeGreaterThan(0.5)
    expect(file.source).toMatch(/OpenStreetMap/)
    expect(file.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('only holds points inside Japan', () => {
    for (const p of [...data.toilets, ...data.bins, ...data.konbini]) expect(inJapan(p), `${p.lat},${p.lon}`).toBe(true)
  })

  it('finds toilets and konbini near the places on your route', () => {
    for (const [name, here] of Object.entries({
      'Tokyo Station': { lat: 35.6812, lon: 139.7671 },
      'Kyoto Station': { lat: 34.9858, lon: 135.7588 },
      'Osaka Namba': { lat: 34.6661, lon: 135.5006 },
      'Sapporo Station': { lat: 43.0687, lon: 141.3508 },
    })) {
      expect(nearest(here, data.toilets, 3, 1500).length, name).toBeGreaterThan(0)
      expect(nearest(here, data.konbini, 3, 1000).length, name).toBeGreaterThan(0)
    }
  })
})
