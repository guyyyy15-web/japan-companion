import { useCallback, useEffect, useState } from 'react'
import { PhotoPicker, PhotoThumb, PhotoViewer } from '../../components/Photos'
import { useI18n } from '../../i18n'
import { formatMoney } from '../../lib/money'
import { addPhoto, deletePhoto, listPhotos, PHOTO_CATEGORIES, PHOTO_ICON, storageUsed, updatePhoto, type Photo, type PhotoCategory } from '../../lib/photos'
import { load } from '../../lib/storage'
import { CATEGORY_ICON, sanitize, WALLET_KEY, type Expense } from '../../lib/wallet'

type Filter = 'all' | PhotoCategory

/** Tickets, bookings, documents, maps and receipts: saved on the phone, open without internet. */
export function GalleryView() {
  const { t, lang } = useI18n()
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<Photo | null>(null)
  const [busy, setBusy] = useState(false)
  const [used, setUsed] = useState<number | null>(null)
  const [expenses] = useState<Expense[]>(() => sanitize(load(WALLET_KEY, [])))

  const refresh = useCallback(() => {
    listPhotos().then(setPhotos, () => setFailed(true))
    storageUsed().then(setUsed)
  }, [])

  useEffect(refresh, [refresh])

  const add = async (file: File) => {
    setBusy(true)
    try {
      await addPhoto(file, filter === 'all' || filter === 'receipts' ? 'other' : filter)
      refresh()
    } catch {
      window.alert(t('gallery.addFailed'))
    } finally {
      setBusy(false)
    }
  }

  const receiptCaption = (p: Photo) => {
    const e = expenses.find((x) => x.id === p.expenseId)
    if (!e) return p.note
    const day = new Date(e.at).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short' })
    return `${CATEGORY_ICON[e.cat]} ${e.note ?? t(`wallet.cat.${e.cat}`)} · ${formatMoney(e.yen, 'JPY', lang)} · ${day}`
  }

  const count = (c: Filter) => (photos ?? []).filter((p) => c === 'all' || p.category === c).length
  const shown = (photos ?? []).filter((p) => filter === 'all' || p.category === filter)
  const filters: Filter[] = ['all', ...PHOTO_CATEGORIES]

  return (
    <div className="view gallery">
      <div className="chips" role="tablist">
        {filters.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={c === filter}
            className={c === filter ? 'chip active' : 'chip'}
            onClick={() => setFilter(c)}
          >
            {c === 'all' ? t('signs.all') : `${PHOTO_ICON[c]} ${t(`gallery.cat.${c}`)}`}
            {photos && <bdi className="chip-count">{count(c)}</bdi>}
          </button>
        ))}
      </div>

      {filter === 'receipts' ? (
        <p className="muted small-start">{t('gallery.receiptsNote')}</p>
      ) : (
        <PhotoPicker className="primary-btn" onPick={add}>
          {busy ? t('gallery.saving') : `📷 ${t('gallery.add')}${filter === 'all' ? '' : ` · ${t(`gallery.cat.${filter}`)}`}`}
        </PhotoPicker>
      )}

      {failed ? (
        <p className="warn">{t('gallery.unavailable')}</p>
      ) : photos && shown.length === 0 ? (
        <p className="empty">{t('gallery.empty')}</p>
      ) : (
        <div className="photo-grid">
          {shown.map((p) => (
            <figure key={p.id} className="photo-cell">
              <PhotoThumb photo={p} onOpen={() => setOpen(p)} />
              <figcaption>
                {PHOTO_ICON[p.category]} {p.category === 'receipts' ? receiptCaption(p) ?? t('gallery.cat.receipts') : t(`gallery.cat.${p.category}`)}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <p className="muted small-start">
        {t('gallery.note')}
        {used !== null && ` · ${t('gallery.used', { mb: (used / 1024 / 1024).toFixed(1) })}`}
      </p>

      {open && (
        <PhotoViewer
          photo={open}
          caption={open.category === 'receipts' ? receiptCaption(open) : undefined}
          onClose={() => setOpen(null)}
          onDelete={async () => {
            await deletePhoto(open.id)
            setOpen(null)
            refresh()
          }}
          onChange={async (p) => {
            await updatePhoto(p)
            setOpen(p)
            refresh()
          }}
        />
      )}
    </div>
  )
}
