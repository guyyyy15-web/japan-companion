import { PATTERNS, type Pattern } from '../content/patterns'
import { build, fits, VOCAB, type Built, type Word } from './builder'
import type { Lang } from './money'

export interface Suggestion {
  pattern: Pattern
  word: Word
  built: Built
}

interface Entry extends Suggestion {
  wordText: string
  wordLabel: Record<Lang, string>
  frameText: string
  sentence: string
}

const MAX_PER_FRAME = 3
const MAX_PER_WORD = 3

/** Lowercase, drop niqqud, apostrophes and punctuation so "צ'ק" ≈ "צק" and "where?" ≈ "where". */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-֑ͯ-ׇ'׳"״]/g, '')
    .replace(/[?!.,…×()\-–/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

let index: Entry[] | null = null

// Every frame × every word it accepts, built once on first search.
function entries(): Entry[] {
  if (index) return index
  index = []
  for (const pattern of PATTERNS)
    for (const word of VOCAB) {
      if (!fits(pattern, word)) continue
      const built = build(pattern, word, 1)
      index.push({
        pattern,
        word,
        built,
        wordText: normalize([word.he, word.he_def, word.en, word.romaji, word.ja, word.kana].join(' ')),
        wordLabel: { he: normalize(word.he), en: normalize(word.en) },
        frameText: normalize(
          [pattern.label.he, pattern.label.en, pattern.keywords ?? '', pattern.romaji, pattern.ja].join(' '),
        ),
        sentence: normalize([built.he, built.en, built.romaji, built.ja].join(' ')),
      })
    }
  return index
}

function score(e: Entry, tokens: string[], lang: Lang): number {
  let total = 0
  for (const tok of tokens) {
    const inWord = e.wordText.includes(tok)
    const inFrame = e.frameText.includes(tok)
    if (!inWord && !inFrame && !e.sentence.includes(tok)) return 0
    if (e.wordLabel[lang].startsWith(tok) || e.wordLabel[lang].includes(` ${tok}`)) total += 4
    else if (inWord) total += 2
    if (inFrame) total += 1.5
    if (!inWord && !inFrame) total += 0.5
  }
  // Prefer short, common sentences, and the order frames appear in the builder.
  return total - e.built.ja.length / 100 - PATTERNS.indexOf(e.pattern) / 1000
}

/** Ranked, varied ready-made sentences for a free-text query in either language, romaji or Japanese. */
export function suggest(query: string, lang: Lang, limit = 8): Suggestion[] {
  const tokens = normalize(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return []
  const ranked = entries()
    .map((e) => ({ e, s: score(e, tokens, lang) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)

  const perFrame = new Map<string, number>()
  const perWord = new Map<string, number>()
  const out: Suggestion[] = []
  for (const { e } of ranked) {
    const f = perFrame.get(e.pattern.id) ?? 0
    const w = perWord.get(e.word.id) ?? 0
    if (f >= MAX_PER_FRAME || w >= MAX_PER_WORD) continue
    perFrame.set(e.pattern.id, f + 1)
    perWord.set(e.word.id, w + 1)
    out.push({ pattern: e.pattern, word: e.word, built: e.built })
    if (out.length === limit) break
  }
  return out
}
