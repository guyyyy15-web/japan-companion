import { describe, expect, it } from 'vitest'
import { phrases } from '../content'
import { build, VOCAB } from '../lib/builder'
import { PATTERNS } from '../content/patterns'
import { matches } from '../lib/search'
import { suggest } from '../lib/suggest'

const findPhrases = (q: string) => phrases.filter((p) => matches(q, [p.ja, p.kana, p.romaji, p.he_pron, p.he, p.en])).map((p) => p.id)
const top = (q: string, lang: 'he' | 'en', n = 3) => suggest(q, lang).slice(0, n).map((s) => `${s.pattern.id}+${s.word.id}`)

describe('directions', () => {
  it('are found by searching in Hebrew and English', () => {
    expect(findPhrases('ימינה')).toEqual(expect.arrayContaining(['directions.right', 'directions.turn-right']))
    expect(findPhrases('שמאלה')).toEqual(expect.arrayContaining(['directions.left', 'directions.turn-left']))
    expect(findPhrases('למעלה')).toEqual(expect.arrayContaining(['directions.up', 'directions.upstairs']))
    expect(findPhrases('למטה')).toContain('directions.down')
    expect(findPhrases('קדימה')).toContain('directions.front')
    expect(findPhrases('אחורה')).toEqual(expect.arrayContaining(['directions.behind', 'directions.go-back']))
    expect(findPhrases('straight')).toEqual(expect.arrayContaining(['directions.straight-word', 'directions.go-straight']))
  })

  it('build "Is it …?" sentences', () => {
    const frame = PATTERNS.find((p) => p.id === 'is-it-direction')!
    const upstairs = VOCAB.find((w) => w.id === 'upstairs')!
    expect(build(frame, upstairs, 1)).toMatchObject({ ja: '上の階にありますか', he: 'זה בקומה למעלה?', en: 'Is it upstairs?' })
    expect(top('למעלה', 'he')).toContain('is-it-direction+upstairs')
    expect(top('on the right', 'en')).toContain('is-it-direction+on-right')
  })
})
