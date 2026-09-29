import { useState } from 'react'
import { useI18n } from '../../i18n'
import { load, save } from '../../lib/storage'
import { AttractionsView } from './AttractionsView'
import { NearbyView } from './NearbyView'

type Mode = 'near' | 'attractions'

/** The Nearby tab: what's around you right now, or the hand-picked attractions of the trip. */
export function NearbyTab() {
  const { t } = useI18n()
  const [mode, setModeState] = useState<Mode>(() => load<Mode>('jc.nearbyMode', 'near'))
  const setMode = (m: Mode) => {
    setModeState(m)
    save('jc.nearbyMode', m)
  }
  return (
    <div className="view">
      <div className="seg two nearby-mode" role="radiogroup" aria-label={t('attr.mode')}>
        {(['near', 'attractions'] as Mode[]).map((m) => (
          <button key={m} role="radio" aria-checked={m === mode} className={m === mode ? 'seg-btn active' : 'seg-btn'} onClick={() => setMode(m)}>
            {m === 'near' ? `📍 ${t('attr.modeNear')}` : `🎌 ${t('attr.modeAttractions')}`}
          </button>
        ))}
      </div>
      {mode === 'near' ? <NearbyView /> : <AttractionsView />}
    </div>
  )
}
