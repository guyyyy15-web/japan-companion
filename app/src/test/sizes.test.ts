import { describe, expect, it } from 'vitest'
import { euToJpShoe } from '../lib/sizes'

describe('shoe sizes', () => {
  it('matches common charts', () => {
    expect(euToJpShoe(36)).toBe(22.5)
    expect(euToJpShoe(38)).toBe(24)
    expect(euToJpShoe(40)).toBe(25)
    expect(euToJpShoe(42)).toBe(26.5)
    expect(euToJpShoe(44)).toBe(28)
  })
})
