import { describe, expect, it } from 'vitest'
import { pickVoice, speakableText, voiceScore, type VoiceLike } from '../lib/speech'

const v = (name: string, lang: string, extra: Partial<VoiceLike> = {}): VoiceLike => ({ name, lang, voiceURI: name, ...extra })

describe('voice choice', () => {
  const voices = [
    v('Samantha', 'en-US'),
    v('Carmit', 'he-IL'),
    v('Kyoko', 'ja-JP', { localService: true }),
    v('Kyoko (Enhanced)', 'ja-JP', { localService: true }),
    v('O-ren (Premium)', 'ja-JP', { localService: true }),
  ]

  it('never picks a non-Japanese voice', () => {
    expect(voiceScore(v('Carmit', 'he-IL'))).toBe(-1)
    expect(pickVoice([v('Samantha', 'en-US'), v('Carmit', 'he-IL')])).toBeUndefined()
  })

  it('prefers Premium, then Enhanced, then compact', () => {
    expect(pickVoice(voices)?.name).toBe('O-ren (Premium)')
    expect(pickVoice(voices.slice(0, 4))?.name).toBe('Kyoko (Enhanced)')
    expect(pickVoice(voices.slice(0, 3))?.name).toBe('Kyoko')
  })

  it("honours the user's choice while it's installed", () => {
    expect(pickVoice(voices, 'Kyoko')?.name).toBe('Kyoko')
    expect(pickVoice(voices, 'Uninstalled voice')?.name).toBe('O-ren (Premium)')
  })

  it('accepts ja_JP-style tags and Google voices', () => {
    expect(voiceScore(v('Google 日本語', 'ja_JP'))).toBeGreaterThan(voiceScore(v('Kyoko', 'ja-JP')))
  })
})

describe('speakableText', () => {
  it('drops ellipses and multiplication signs that engines read aloud', () => {
    expect(speakableText('次は…です')).toBe('次は です')
    expect(speakableText('  トイレ  はどこ ')).toBe('トイレ はどこ')
  })
})
