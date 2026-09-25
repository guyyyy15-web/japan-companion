import { load, save } from './storage'

/** The subset of SpeechSynthesisVoice we rank on, so ranking is testable without a browser. */
export interface VoiceLike {
  name: string
  lang: string
  voiceURI: string
  localService?: boolean
}

export type SpeakResult = 'ok' | 'no-voice' | 'unsupported'

const VOICE_KEY = 'jc.voiceURI'
const SLOW_KEY = 'jc.slowSpeech'
export const NORMAL_RATE = 0.9
export const SLOW_RATE = 0.6

export function isJapanese(v: VoiceLike): boolean {
  return /^ja([-_]|$)/i.test(v.lang)
}

/**
 * Higher is better; -1 means "not Japanese". iOS lists Premium/Enhanced voices once they're downloaded
 * (Settings → Accessibility → Spoken Content → Voices → Japanese) and they sound far more natural
 * than the compact default. Chrome/Android's "Google 日本語" is also good.
 */
export function voiceScore(v: VoiceLike): number {
  if (!isJapanese(v)) return -1
  const n = v.name.toLowerCase()
  let s = 1
  if (/premium|プレミアム/.test(n)) s += 4
  else if (/enhanced|拡張|siri/.test(n)) s += 3
  if (/google/.test(n)) s += 2
  if (/kyoko|o-ren|otoya|hattori|haruka|ayumi|nanami|keita|sayaka/.test(n)) s += 1
  if (v.localService) s += 0.5 // works offline
  return s
}

/** The user's chosen voice if it's still installed, otherwise the best-ranked Japanese voice. */
export function pickVoice<V extends VoiceLike>(voices: V[], preferredURI?: string | null): V | undefined {
  const ja = voices.filter(isJapanese)
  return ja.find((v) => v.voiceURI === preferredURI) ?? [...ja].sort((a, b) => voiceScore(b) - voiceScore(a))[0]
}

/** Text to hand to the voice: drop typographic bits that some engines read aloud or stumble on. */
export function speakableText(text: string): string {
  return text.replace(/[…×]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function japaneseVoices(): SpeechSynthesisVoice[] {
  if (!canSpeak()) return []
  return speechSynthesis
    .getVoices()
    .filter(isJapanese)
    .sort((a, b) => voiceScore(b) - voiceScore(a))
}

export function preferredVoiceURI(): string | null {
  return load<string | null>(VOICE_KEY, null)
}

export function setPreferredVoiceURI(uri: string | null): void {
  save(VOICE_KEY, uri)
}

export function isSlow(): boolean {
  return load<boolean>(SLOW_KEY, false)
}

export function setSlow(slow: boolean): void {
  save(SLOW_KEY, slow)
}

/**
 * Speaks Japanese with the best available Japanese voice. Pass the kanji text (`ja`), not kana-only:
 * with kanji the engine can find word boundaries, so particles like は come out as "wa", not "ha".
 */
export function speakJapanese(text: string, opts: { slow?: boolean } = {}): SpeakResult {
  if (!canSpeak()) return 'unsupported'
  const voice = pickVoice(speechSynthesis.getVoices(), preferredVoiceURI())
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(speakableText(text))
  u.lang = 'ja-JP'
  u.rate = (opts.slow ?? isSlow()) ? SLOW_RATE : NORMAL_RATE
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
  if (!voice) {
    // Voices can load late on iOS; only report "missing" once the list has actually loaded.
    return speechSynthesis.getVoices().length > 0 ? 'no-voice' : 'ok'
  }
  return 'ok'
}

if (canSpeak()) {
  speechSynthesis.getVoices()
  speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices())
}
