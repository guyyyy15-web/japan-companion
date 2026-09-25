import { useI18n } from '../i18n'
import { canSpeak, speakJapanese } from '../lib/speech'
import { showToast } from './Toast'

/** 🔊 normal and 🐢 slow playback of a Japanese sentence (pass the kanji text). */
export function SpeakButtons({ text, slowButton = true }: { text: string; slowButton?: boolean }) {
  const { t } = useI18n()
  if (!canSpeak()) return null
  // Normal play follows the saved speed setting; 🐢 always plays slowly.
  const play = (slow?: boolean) => {
    if (speakJapanese(text, { slow }) === 'no-voice') showToast(t('voice.missing'))
  }
  return (
    <>
      <button className="icon" aria-label={t('phrases.speak')} onClick={() => play()}>🔊</button>
      {slowButton && (
        <button className="icon" aria-label={t('voice.slow')} onClick={() => play(true)}>🐢</button>
      )}
    </>
  )
}
