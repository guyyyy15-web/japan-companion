import { describe, expect, it } from 'vitest'
import { answer, shuffle } from '../lib/practice'

describe('practice queue', () => {
  it('shuffles without losing cards', () => {
    const deck = [1, 2, 3, 4, 5, 6]
    const s = shuffle(deck, () => 0.3)
    expect([...s].sort()).toEqual(deck)
    expect(deck).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('drops known cards and brings missed ones back soon', () => {
    expect(answer([1, 2, 3], true)).toEqual([2, 3])
    expect(answer([1, 2, 3, 4, 5, 6], false)).toEqual([2, 3, 4, 1, 5, 6])
    expect(answer([1, 2], false)).toEqual([2, 1])
    expect(answer([1], false)).toEqual([1])
    expect(answer([], true)).toEqual([])
  })
})
