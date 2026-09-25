import { describe, expect, it } from 'vitest'
import { build, customWord, fits, PATTERNS, VOCAB, wordsFor } from '../lib/builder'
import type { WordType } from '../content/patterns'
import { en } from '../i18n/en'

const KANA_ONLY = /^[぀-ゟ゠-ヿー]+$/
const HEBREW = /[א-ת]/
const TYPES: WordType[] = [
  'place', 'pointer-place', 'this', 'thing', 'food', 'drink', 'ingredient', 'body', 'belonging', 'usable',
  'sight', 'fixture', 'rentable', 'amenity', 'vehicle', 'request', 'may-i', 'works',
  'city', 'allergen', 'event', 'person', 'game', 'electronic', 'fashion', 'cosmetic', 'size', 'adjective',
  'machine', 'craft', 'borrowable', 'custom',
]
const HEADING_OF = (t: WordType) => (t === 'pointer-place' || t === 'this' ? 'type.pointer' : t === 'works' ? 'type.usable' : `type.${t}`)
const byId = (id: string) => VOCAB.find((w) => w.id === id)!
const frame = (id: string) => PATTERNS.find((p) => p.id === id)!

describe('vocabulary', () => {
  it('has unique ids, known types and complete fields', () => {
    expect(new Set(VOCAB.map((w) => w.id)).size).toBe(VOCAB.length)
    for (const w of VOCAB) {
      for (const t of w.types) expect(TYPES, w.id).toContain(t)
      expect(w.types, w.id).not.toContain('custom')
      expect(w.kana.replace(/ /g, ''), w.id).toMatch(KANA_ONLY)
      expect(w.romaji, w.id).toMatch(/^[a-z' -]+$/)
      expect(w.he_pron, w.id).toMatch(HEBREW)
      expect(w.he + w.he_def, w.id).toMatch(HEBREW)
      expect(w.en, w.id).toMatch(/[a-z]/i)
      if (w.counter) expect(['tsu', 'mai'], w.id).toContain(w.counter)
    }
  })

  it('puts every word in at least one frame', () => {
    for (const w of VOCAB) expect(PATTERNS.some((p) => wordsFor(p).includes(w)), w.id).toBe(true)
  })
})

describe('frames', () => {
  it('have unique ids, a noun slot and enough words', () => {
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length)
    for (const p of PATTERNS) {
      for (const f of [p.ja, p.kana, p.romaji, p.he_pron]) expect(f, p.id).toContain('{N}')
      if (p.count) expect(p.ja, p.id).toContain('{C}')
      expect(wordsFor(p).length, p.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('never glue a Hebrew prefix letter onto a definite noun (ל+התחנה)', () => {
    for (const p of PATTERNS) expect(p.he, p.id).not.toMatch(/[בלמהוכש]\{he_def\}/)
  })

  it('have a heading for every word type they accept', () => {
    for (const p of PATTERNS)
      for (const t of p.accepts.filter((x) => x !== 'custom'))
        expect(Object.keys(en), `${p.id}/${t}`).toContain(HEADING_OF(t))
  })
})

describe('sense', () => {
  const ok = (f: string, w: string) => fits(frame(f), byId(w))

  it('rules out sentences nobody would say', () => {
    const nonsense: [string, string][] = [
      ['buy-where', 'english-menu'], // where can I buy an English menu?
      ['buy-where', 'receipt'],
      ['how-much', 'oshibori'],
      ['spicy', 'ice-cream'],
      ['spicy', 'parfait'],
      ['works-abroad', 'record'],
      ['works-abroad', 'manga'],
      ['taxi', 'toilet'],
      ['taxi', 'kyoto'],
      ['opens', 'station'],
      ['opens', 'toilet'],
      ['closes', 'konbini'],
      ['know', 'toilet'],
      ['know', 'restaurant'],
      ['walk', 'osaka'],
      ['walk', 'narita'],
      ['does-this-go', 'konbini'],
      ['used', 'socks'],
      ['cheaper', 'stamp'],
      ['cheaper', 'plastic-bag'],
      ['need', 'switch'],
      ['need', 'lipstick'],
      ['can-i-have', 'kitchen-knife'],
      ['popular', 'receipt'],
      ['popular', 'water'],
      ['in-stock', 'chopsticks'],
      ['take-this', 'oshibori'],
      ['included', 'pillow'],
      ['contains', 'ice'],
      ['where', 'osaka'],
      ['not-working', 'umbrella'],
      ['how-to-use', 'batteries'],
      ['know', 'tokyo'],
      ['cheaper', 'socks'],
      ['need', 'credit-card'],
    ]
    for (const [f, w] of nonsense) expect(ok(f, w), `${f} + ${w}`).toBe(false)
  })

  it('keeps the sentences people really need', () => {
    const sensible: [string, string][] = [
      ['buy-where', 'sim'],
      ['buy-where', 'ticket'],
      ['how-much', 'plastic-bag'], // bags cost a few yen at the till
      ['can-i-have', 'english-menu'],
      ['can-i-have', 'oshibori'],
      ['spicy', 'ramen'],
      ['spicy', 'this'],
      ['works-abroad', 'switch'],
      ['works-abroad', 'rice-cooker'],
      ['taxi', 'kyoto-station'],
      ['taxi', 'this-address'],
      ['opens', 'museum'],
      ['know', 'this-address'],
      ['know', 'this'],
      ['know', 'kiyomizu'],
      ['walk', 'asakusa'],
      ['does-this-go', 'narita'],
      ['used', 'gameboy'],
      ['cheaper', 'jacket'],
      ['cheaper', 'kitchen-knife'],
      ['need', 'adapter'],
      ['borrow', 'umbrella'],
      ['borrow', 'charger'],
      ['where', 'toilet'],
      ['where', 'tokyo-station'],
      ['go-to', 'toilet'],
    ]
    for (const [f, w] of sensible) expect(ok(f, w), `${f} + ${w}`).toBe(true)
  })

  it('never offers a pointer where it cannot point', () => {
    expect(ok('know', 'over-there')).toBe(false)
    expect(ok('where', 'here')).toBe(false)
  })
})

describe('build', () => {
  it('produces clean sentences for every frame × word', () => {
    for (const p of PATTERNS)
      for (const w of wordsFor(p))
        for (const n of p.count ? [1, 2, 5] : [1]) {
          const s = build(p, w, n)
          const where = `${p.id}+${w.id}×${n}`
          for (const v of Object.values(s)) expect(v, where).not.toMatch(/[{}]/)
          expect(s.kana.replace(/ /g, ''), where).toMatch(KANA_ONLY)
          expect(s.he, where).toMatch(HEBREW)
          expect(s.he_pron, where).toMatch(HEBREW)
        }
  })

  it('builds the sentences travel guides teach', () => {
    expect(build(frame('where'), byId('toilet')).ja).toBe('トイレはどこですか')
    expect(build(frame('where'), byId('station')).romaji).toBe('eki wa doko desu ka')
    expect(build(frame('taxi'), byId('here')).ja).toBe('ここまでお願いします')
    expect(build(frame('without'), byId('wasabi')).ja).toBe('わさび抜きでお願いします')
    expect(build(frame('hurts'), byId('head')).kana).toBe('あたまがいたいです')
    expect(build(frame('can-use'), byId('credit-card')).ja).toBe('ここでクレジットカードは使えますか')
    expect(build(frame('how-much'), byId('this')).ja).toBe('これはいくらですか')
  })

  it('covers asking people to do things, and asking permission', () => {
    expect(build(frame('do-for-me'), byId('do-heat')).ja).toBe('温めてもらえますか')
    expect(build(frame('do-for-me'), byId('do-heat')).en).toBe('Could you heat it up?')
    expect(build(frame('do-for-me'), byId('do-fix')).romaji).toBe('naoshite moraemasu ka')
    expect(build(frame('may-i'), byId('may-photo')).ja).toBe('写真を撮ってもいいですか')
    expect(build(frame('may-i'), byId('may-card')).he).toBe('אפשר לשלם בכרטיס?')
  })

  it('covers renting, pointing, knowing and broken things', () => {
    expect(build(frame('rent-price'), byId('bicycle')).ja).toBe('自転車のレンタルはいくらですか')
    expect(build(frame('rent-price'), byId('bicycle')).en).toBe('How much is it to rent a bicycle?')
    expect(build(frame('how-much'), byId('that')).ja).toBe('それはいくらですか')
    expect(build(frame('how-much'), byId('that')).en).toBe('How much is that?')
    expect(build(frame('can-i-have'), byId('this')).ja).toBe('これをもらえますか')
    expect(build(frame('show-me'), byId('this')).ja).toBe('これを見せてもらえますか')
    expect(build(frame('know'), byId('here')).ja).toBe('ここを知っていますか')
    expect(build(frame('next'), byId('bus')).ja).toBe('次のバスは何時ですか')
    expect(build(frame('broken'), byId('aircon')).ja).toBe('エアコンが壊れています')
    expect(build(frame('not-working'), byId('suica')).en).toBe("My Suica doesn't work")
    expect(build(frame('included'), byId('breakfast')).en).toBe('Is breakfast included?')
  })

  it('covers the v0.4 frames', () => {
    expect(build(frame('walk'), byId('asakusa')).ja).toBe('浅草まで歩いて行けますか')
    expect(build(frame('platform-for'), byId('kyoto')).ja).toBe('京都行きは何番線ですか')
    expect(build(frame('platform-for'), byId('kyoto')).en).toBe('Which platform for trains to Kyoto?')
    expect(build(frame('what-time'), byId('check-out-time')).ja).toBe('チェックアウトは何時ですか')
    expect(build(frame('what-time'), byId('breakfast')).en).toBe('What time is breakfast?')
    expect(build(frame('allergy'), byId('shrimp')).ja).toBe('えびアレルギーがあります')
    expect(build(frame('allergy'), byId('peanuts')).he).toBe('יש לי אלרגיה לבוטנים')
    expect(build(frame('please-do'), byId('do-slowly')).ja).toBe('ゆっくり話してください')
    expect(build(frame('call'), byId('doctor')).ja).toBe('医者を呼んでください')
    expect(build(frame('call'), byId('police')).en).toBe('Please call the police')
    expect(build(frame('forgot'), byId('umbrella')).ja).toBe('傘を忘れました')
    expect(build(frame('take-this'), byId('this')).ja).toBe('これにします')
    expect(build(frame('where'), byId('tokyo-station')).en).toBe('Where is Tokyo Station?')
  })

  it('covers hobbies, second-hand shopping, prices and skincare (v0.5)', () => {
    expect(build(frame('used'), byId('gameboy')).ja).toBe('ゲームボーイは中古ですか')
    expect(build(frame('works-abroad'), byId('switch')).ja).toBe('ニンテンドースイッチは海外でも使えますか')
    expect(build(frame('cheaper'), byId('this')).ja).toBe('これはもう少し安くなりますか')
    expect(build(frame('cheaper'), byId('jacket')).he).toBe('אפשר קצת הנחה על הז\'קט?')
    expect(build(frame('other-one'), byId('cheaper')).ja).toBe('もっと安いのはありますか')
    expect(build(frame('other-one'), byId('cheaper')).en).toBe('Do you have a cheaper one?')
    expect(build(frame('have'), byId('size-m')).ja).toBe('Mサイズはありますか')
    expect(build(frame('popular'), byId('toner')).ja).toBe('一番人気の化粧水はどれですか')
    expect(build(frame('sensitive-skin'), byId('sunscreen')).ja).toBe('日焼け止めは敏感肌でも使えますか')
    expect(build(frame('how-to-use'), byId('crane-game')).ja).toBe('クレーンゲームの使い方を教えてください')
    expect(build(frame('do-for-me'), byId('do-move-prize')).ja).toBe('景品の位置を直してもらえますか')
    expect(build(frame('may-i'), byId('may-open-box')).ja).toBe('箱の中を見てもいいですか')
    expect(build(frame('looking-for'), byId('vintage-item')).ja).toBe('古着を探しています')
    expect(build(frame('how-get'), byId('akihabara')).en).toBe('How do we get to Akihabara?')
    expect(build(frame('borrow'), byId('umbrella')).ja).toBe('傘を借りられますか')
    expect(build(frame('borrow'), byId('umbrella')).he).toBe('אפשר לשאול מטרייה?')
  })

  it('counts tickets with 枚 whatever the destination', () => {
    const t = build(frame('ticket-to'), byId('kyoto'), 2)
    expect(t.ja).toBe('京都までの切符を二枚お願いします')
    expect(t.kana).toBe('きょうとまでのきっぷをにまいおねがいします')
  })

  it('uses the right counter', () => {
    const tickets = build(frame('count'), byId('ticket'), 2)
    expect(tickets.ja).toBe('切符を二枚お願いします')
    expect(tickets.kana).toBe('きっぷをにまいおねがいします')
    expect(build(frame('count'), byId('beer'), 3).ja).toBe('ビールを三つお願いします')
    expect(build(frame('count'), byId('beer'), 99).romaji).toBe('biiru o itsutsu onegaishimasu')
  })

  it('reads naturally in English and Hebrew', () => {
    expect(build(frame('nearby'), byId('atm')).en).toBe('Is there an ATM nearby?')
    expect(build(frame('where'), byId('pharmacy')).en).toBe('Where is the pharmacy?')
    expect(build(frame('please'), byId('this')).en).toBe('This, please')
    expect(build(frame('lost'), byId('passport')).en).toBe('I lost my passport')
    expect(build(frame('where'), byId('pharmacy')).he).toBe('איפה בית המרקחת?')
    expect(build(frame('have'), byId('this')).he).toBe('יש לכם כזה?')
    expect(build(frame('can-use'), byId('cash')).he).toBe('אפשר להשתמש כאן במזומן?')
  })

  it('takes custom names, including pasted Japanese', () => {
    const latin = build(frame('taxi'), customWord('  Kinkakuji '))
    expect(latin.ja).toBe('Kinkakujiまでお願いします')
    expect(latin.en).toBe('To Kinkakuji, please')
    const ja = build(frame('where'), customWord('金閣寺'))
    expect(ja.ja).toBe('金閣寺はどこですか')
    expect(ja.romaji).toBe('… wa doko desu ka')
  })
})
