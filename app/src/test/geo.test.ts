import { describe, expect, it } from 'vitest'
import { bearing, compassWord, decode, directionsUrl, distance, formatDistance, nearest, searchUrl } from '../lib/geo'

const tokyoStation = { lat: 35.6812, lon: 139.7671 }
const imperialPalace = { lat: 35.6852, lon: 139.7528 }

describe('geo', () => {
  it('measures distance like a map does', () => {
    const d = distance(tokyoStation, imperialPalace)
    expect(d).toBeGreaterThan(1300)
    expect(d).toBeLessThan(1450)
    expect(distance(tokyoStation, tokyoStation)).toBe(0)
  })

  it('gives compass bearings', () => {
    expect(bearing({ lat: 35, lon: 139 }, { lat: 36, lon: 139 })).toBeCloseTo(0, 0) // north
    expect(bearing({ lat: 35, lon: 139 }, { lat: 35, lon: 140 })).toBeCloseTo(90, 0) // east
    expect(compassWord(0, 'en')).toBe('north')
    expect(compassWord(95, 'he')).toBe('מזרח')
    expect(compassWord(350, 'en')).toBe('north')
  })

  it('returns the closest places first, within the radius', () => {
    const items = [
      { lat: 35.6852, lon: 139.7528 }, // ~1.4 km
      { lat: 35.6815, lon: 139.7675 }, // ~50 m
      { lat: 35.7, lon: 139.8 }, // ~3.6 km
      { lat: 34.7, lon: 135.5 }, // Osaka
    ]
    const res = nearest(tokyoStation, items, 8, 3000)
    expect(res.map((r) => r.item)).toEqual([items[1], items[0]])
    expect(res[0].meters).toBeLessThan(res[1].meters)
    expect(nearest(tokyoStation, items, 1, 3000)).toHaveLength(1)
  })

  it('formats distances the way signs do', () => {
    expect(formatDistance(3, 'en')).toBe('10 m')
    expect(formatDistance(447, 'en')).toBe('450 m')
    expect(formatDistance(1234, 'en')).toBe('1.2 km')
    expect(formatDistance(1234, 'he')).toBe('1.2 ק״מ')
  })

  it('decodes the compact data file', () => {
    const f = decode({ source: 'OSM', updated: '2026-09-25', scale: 1e5, toilets: [[3568120, 13976710, 1]], bins: [[3568520, 13975280]] })
    expect(f.toilets[0]).toEqual({ lat: 35.6812, lon: 139.7671, paid: true })
    expect(f.bins[0]).toEqual({ lat: 35.6852, lon: 139.7528 })
  })

  it('builds Google Maps links', () => {
    expect(directionsUrl(tokyoStation)).toBe('https://www.google.com/maps/dir/?api=1&destination=35.681200,139.767100&travelmode=walking')
    expect(searchUrl('公衆トイレ')).toBe('https://www.google.com/maps/search/?api=1&query=%E5%85%AC%E8%A1%86%E3%83%88%E3%82%A4%E3%83%AC')
  })
})
