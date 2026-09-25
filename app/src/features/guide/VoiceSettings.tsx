import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n'
import {
  canSpeak,
  isSlow,
  japaneseVoices,
  pickVoice,
  preferredVoiceURI,
  setPreferredVoiceURI,
  setSlow,
  speakJapanese,
  voiceScore,
} from '../../lib/speech'

const SAMPLE = 'すみません、トイレはどこですか。'

function quality(v: SpeechSynthesisVoice): string {
  const s = voiceScore(v)
  return s >= 5 ? '★★★' : s >= 3 ? '★★' : '★'
}

/** Pick the Japanese voice and speed, test them, and explain how to get a better voice. */
export function VoiceSettings() {
  const { t } = useI18n()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(japaneseVoices)
  const [uri, setUri] = useState<string | null>(preferredVoiceURI)
  const [slow, setSlowState] = useState(isSlow)

  useEffect(() => {
    if (!canSpeak()) return
    const refresh = () => setVoices(japaneseVoices())
    speechSynthesis.addEventListener?.('voiceschanged', refresh)
    const timer = window.setTimeout(refresh, 500) // iOS sometimes never fires voiceschanged
    return () => {
      speechSynthesis.removeEventListener?.('voiceschanged', refresh)
      window.clearTimeout(timer)
    }
  }, [])

  if (!canSpeak()) return <p className="muted">{t('voice.unsupported')}</p>

  const current = pickVoice(voices, uri)

  return (
    <div className="voice-settings">
      {voices.length === 0 ? (
        <p className="warn">{t('voice.none')}</p>
      ) : (
        <label className="field">
          <span>{t('voice.choose')}</span>
          <select
            value={current?.voiceURI ?? ''}
            onChange={(e) => {
              setUri(e.target.value)
              setPreferredVoiceURI(e.target.value)
            }}
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {quality(v)} {v.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="seg voice-speed" role="radiogroup" aria-label={t('voice.speed')}>
        {[false, true].map((s) => (
          <button
            key={String(s)}
            role="radio"
            aria-checked={slow === s}
            className={slow === s ? 'seg-btn active' : 'seg-btn'}
            onClick={() => {
              setSlowState(s)
              setSlow(s)
            }}
          >
            {s ? `🐢 ${t('voice.slow')}` : `🔊 ${t('voice.normal')}`}
          </button>
        ))}
      </div>

      <button className="frame active voice-test" onClick={() => speakJapanese(SAMPLE)}>
        ▶ {t('voice.test')}
      </button>
      <p className="muted small-start">{t('voice.hint')}</p>
    </div>
  )
}
