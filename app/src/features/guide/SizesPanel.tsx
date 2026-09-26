import { useState } from 'react'
import { Ja } from '../../components/Ja'
import { useI18n } from '../../i18n'
import { EU_SHOE_SIZES, euToJpShoe, MEN_SIZES, WOMEN_SIZES } from '../../lib/sizes'
import { load, save } from '../../lib/storage'

/** Shoe and clothing sizes for shopping in Japan. */
export function SizesPanel() {
  const { t } = useI18n()
  const [eu, setEu] = useState<number>(() => load('jc.shoeEu', 38))

  return (
    <div className="sizes">
      <label className="field">
        <span>{t('sizes.shoeEu')}</span>
        <select
          value={eu}
          onChange={(e) => {
            const v = Number(e.target.value)
            setEu(v)
            save('jc.shoeEu', v)
          }}
        >
          {EU_SHOE_SIZES.map((s) => (
            <option key={s} value={s}>
              EU {s}
            </option>
          ))}
        </select>
      </label>
      <div className="size-result">
        <span className="muted">{t('sizes.inJapan')}</span>
        <bdi className="size-big">{euToJpShoe(eu)} cm</bdi>
      </div>
      <p className="muted small-start">{t('sizes.shoeNote')}</p>

      <h4>{t('sizes.women')}</h4>
      <table className="anchors sizes-table">
        <thead>
          <tr>
            <th>🇯🇵</th>
            <th>S/M/L</th>
            <th>EU</th>
          </tr>
        </thead>
        <tbody>
          {WOMEN_SIZES.map((r) => (
            <tr key={r.jp}>
              <td><Ja>{r.jp}</Ja></td>
              <td>{r.letter}</td>
              <td>{r.eu}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>{t('sizes.men')}</h4>
      <table className="anchors sizes-table">
        <thead>
          <tr>
            <th>🇯🇵</th>
            <th>{t('sizes.yours')}</th>
          </tr>
        </thead>
        <tbody>
          {MEN_SIZES.map((r) => (
            <tr key={r.jp}>
              <td>{r.jp}</td>
              <td>{r.yours}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small-start">{t('sizes.tip')}</p>
    </div>
  )
}
