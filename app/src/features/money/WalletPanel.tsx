import { useState } from 'react'
import { MoneyText } from '../../components/MoneyText'
import { useI18n } from '../../i18n'
import { formatMoney } from '../../lib/money'
import { load, save } from '../../lib/storage'
import {
  CATEGORIES,
  CATEGORY_ICON,
  dayOf,
  newExpense,
  sanitize,
  totals,
  WALLET_KEY,
  type Category,
  type Expense,
  type Method,
} from '../../lib/wallet'

interface Props {
  /** The amount on the converter, in yen (0 when empty). */
  yen: number
  toIls: (yen: number) => number
  onAdded: () => void
}

/** Log what you spend in yen and see the trip total in shekels. Kept on this phone only. */
export function WalletPanel({ yen, toIls, onAdded }: Props) {
  const { t, lang } = useI18n()
  const [list, setList] = useState<Expense[]>(() => sanitize(load(WALLET_KEY, [])))
  const [cat, setCat] = useState<Category>('food')
  const [method, setMethod] = useState<Method>(() => load<Method>('jc.walletMethod', 'card'))
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)

  const store = (next: Expense[]) => {
    setList(next)
    save(WALLET_KEY, next)
  }

  const add = () => {
    store([...list, newExpense(yen, cat, method, note)])
    save('jc.walletMethod', method)
    setNote('')
    onAdded()
  }

  const remove = (id: string) => store(list.filter((e) => e.id !== id))

  const sum = totals(list)
  const today = sum.byDay.find((d) => d.day === dayOf({ at: new Date().toISOString() }))
  const max = Math.max(1, ...sum.byCat.map((c) => c.yen))
  const locale = lang === 'he' ? 'he-IL' : 'en-GB'
  const dayLabel = (day: string) =>
    new Date(`${day}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

  const shareText = () =>
    [
      `${t('wallet.title')}: ${formatMoney(sum.total, 'JPY', lang)} ≈ ${formatMoney(toIls(sum.total), 'ILS', lang)}`,
      ...sum.byCat.map((c) => `${CATEGORY_ICON[c.cat]} ${t(`wallet.cat.${c.cat}`)}: ${formatMoney(c.yen, 'JPY', lang)}`),
      '',
      ...sum.byDay.flatMap((d) => [
        `${dayLabel(d.day)} · ${formatMoney(d.yen, 'JPY', lang)}`,
        ...d.items.map((e) => `  ${CATEGORY_ICON[e.cat]} ${e.note ?? t(`wallet.cat.${e.cat}`)} ${formatMoney(e.yen, 'JPY', lang)}`),
      ]),
    ].join('\n')

  const share = async () => {
    const text = shareText()
    try {
      if (navigator.share) return await navigator.share({ text })
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Share sheet dismissed, or clipboard blocked: nothing to do.
    }
  }

  const clearAll = () => {
    if (window.confirm(t('wallet.confirmClear'))) store([])
  }

  return (
    <>
      {yen > 0 && (
        <section className="panel wallet-add">
          <h3>
            ➕ {t('wallet.add')} <MoneyText amount={yen} currency="JPY" />
          </h3>
          <div className="cat-grid" role="radiogroup" aria-label={t('wallet.category')}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={c === cat}
                className={c === cat ? 'cat-btn active' : 'cat-btn'}
                onClick={() => setCat(c)}
              >
                <span aria-hidden>{CATEGORY_ICON[c]}</span> {t(`wallet.cat.${c}`)}
              </button>
            ))}
          </div>
          <div className="wallet-row">
            <div className="seg two" role="radiogroup" aria-label={t('wallet.method')}>
              {(['card', 'cash'] as Method[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={m === method}
                  className={m === method ? 'seg-btn active' : 'seg-btn'}
                  onClick={() => setMethod(m)}
                >
                  {m === 'card' ? '💳' : '💴'} {t(`wallet.${m}`)}
                </button>
              ))}
            </div>
          </div>
          <input
            className="search small"
            value={note}
            maxLength={60}
            placeholder={t('wallet.notePlaceholder')}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="primary-btn" onClick={add}>
            {t('wallet.addButton')}
          </button>
        </section>
      )}

      <section className="panel wallet">
        <h3>👛 {t('wallet.title')}</h3>
        {list.length === 0 ? (
          <p className="muted small-start">{t('wallet.empty')}</p>
        ) : (
          <>
            <div className="wallet-total">
              <MoneyText amount={sum.total} currency="JPY" />
              <span className="muted">
                ≈ <MoneyText amount={toIls(sum.total)} currency="ILS" />
              </span>
            </div>
            <div className="wallet-sub muted">
              {today && (
                <span>
                  {t('wallet.today')} <MoneyText amount={today.yen} currency="JPY" />
                </span>
              )}
              <span>
                💴 <MoneyText amount={sum.cash} currency="JPY" />
              </span>
              <span>
                💳 <MoneyText amount={sum.card} currency="JPY" />
              </span>
            </div>
            <ul className="cat-bars">
              {sum.byCat.map((c) => (
                <li key={c.cat}>
                  <span className="cat-bar-label">
                    {CATEGORY_ICON[c.cat]} {t(`wallet.cat.${c.cat}`)}
                  </span>
                  <span className="cat-bar-track">
                    <span className="cat-bar-fill" style={{ inlineSize: `${(c.yen / max) * 100}%` }} />
                  </span>
                  <MoneyText amount={c.yen} currency="JPY" />
                </li>
              ))}
            </ul>
            {sum.byDay.map((d, i) => (
              <details key={d.day} className="wallet-day" open={i === 0}>
                <summary>
                  <span>{dayLabel(d.day)}</span>
                  <span>
                    <MoneyText amount={d.yen} currency="JPY" />
                    <span className="muted">
                      {' '}
                      ≈ <MoneyText amount={toIls(d.yen)} currency="ILS" />
                    </span>
                  </span>
                </summary>
                <ul className="wallet-items">
                  {d.items.map((e) => (
                    <li key={e.id}>
                      <span aria-hidden>{CATEGORY_ICON[e.cat]}</span>
                      <span className="wallet-item-text">
                        <span dir="auto">{e.note ?? t(`wallet.cat.${e.cat}`)}</span>
                        <span className="muted">
                          {time(e.at)} · {e.method === 'cash' ? '💴' : '💳'}
                        </span>
                      </span>
                      <MoneyText amount={e.yen} currency="JPY" />
                      <button className="icon wallet-del" aria-label={t('wallet.delete')} onClick={() => remove(e.id)}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <div className="wallet-actions">
              <button className="link" onClick={share}>
                📤 {copied ? t('wallet.copied') : t('wallet.share')}
              </button>
              <button className="link danger" onClick={clearAll}>
                🗑 {t('wallet.clear')}
              </button>
            </div>
          </>
        )}
        <p className="muted small-start">{t('wallet.note')}</p>
      </section>
    </>
  )
}
