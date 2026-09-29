import { describe, expect, it } from 'vitest'
import { fitWithin, MAX_SIDE, PHOTO_CATEGORIES } from '../lib/photos'

describe('photos', () => {
  it('shrinks big photos to the longest side, never enlarges small ones', () => {
    expect(fitWithin(4032, 3024, MAX_SIDE)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin(1170, 2532, MAX_SIDE)).toEqual({ width: 739, height: 1600 })
    expect(fitWithin(800, 600, MAX_SIDE)).toEqual({ width: 800, height: 600 })
  })

  it('has a receipts category for the wallet', () => {
    expect(PHOTO_CATEGORIES).toContain('receipts')
  })
})
