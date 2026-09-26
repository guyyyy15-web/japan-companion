import { EMERGENCY_CONTACTS, GUIDE } from '../../content/guide'
import { useI18n } from '../../i18n'
import { SizesPanel } from './SizesPanel'
import { VoiceSettings } from './VoiceSettings'

export function GuideView() {
  const { t, pick } = useI18n()
  return (
    <div className="view">
      <section className="panel">
        <h3>🆘 {t('guide.contacts')}</h3>
        <ul className="contacts">
          {EMERGENCY_CONTACTS.map((c) => (
            <li key={c.tel}>
              <span>{pick(c.label)}</span>
              <a className="tel" href={`tel:${c.tel.replace(/-/g, '')}`} aria-label={`${t('guide.call')} ${pick(c.label)}`}>
                <bdi>{c.tel}</bdi>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <details className="panel guide" id="voice">
        <summary>
          <span aria-hidden>🔊</span> {t('voice.title')}
        </summary>
        <VoiceSettings />
      </details>

      <details className="panel guide" id="sizes">
        <summary>
          <span aria-hidden>👟</span> {t('sizes.title')}
        </summary>
        <SizesPanel />
      </details>

      {GUIDE.map((s) => (
        <details key={s.id} className="panel guide" open={s.id === 'setup'}>
          <summary>
            <span aria-hidden>{s.icon}</span> {pick(s.title)}
          </summary>
          <ul>
            {s.points.map((p, i) => (
              <li key={i}>{pick(p)}</li>
            ))}
          </ul>
        </details>
      ))}

      <p className="muted small">{t('guide.about')}</p>
    </div>
  )
}
