import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { PHOTO_CATEGORIES, PHOTO_ICON, type Photo, type PhotoCategory } from '../lib/photos'

/** An <img> for a stored image. The object URL is set and revoked here, so nothing leaks. */
export function BlobImage({ blob, alt = '', className }: { blob: Blob; alt?: string; className?: string }) {
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const url = URL.createObjectURL(blob)
    if (img.current) img.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [blob])
  return <img ref={img} alt={alt} className={className} />
}

export function PhotoThumb({ photo, onOpen, small = false }: { photo: Photo; onOpen: () => void; small?: boolean }) {
  const { t } = useI18n()
  return (
    <button className={small ? 'photo-thumb small' : 'photo-thumb'} onClick={onOpen} aria-label={t('gallery.open')}>
      <BlobImage blob={photo.thumb} />
    </button>
  )
}

/** A hidden file input behind a button: the iPhone offers "Take photo" or "Photo library". */
export function PhotoPicker({ onPick, children, className }: { onPick: (file: File) => void; children: ReactNode; className?: string }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={className} onClick={() => input.current?.click()}>
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          e.target.value = ''
        }}
      />
    </>
  )
}

interface ViewerProps {
  photo: Photo
  caption?: string
  onClose: () => void
  onDelete: () => void
  onChange?: (photo: Photo) => void
}

/** Full-screen photo: tap to zoom, share to Photos or a chat, move to another category, delete. */
export function PhotoViewer({ photo, caption, onClose, onDelete, onChange }: ViewerProps) {
  const { t } = useI18n()
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const file = () => new File([photo.blob], `japan-${photo.createdAt.slice(0, 10)}.jpg`, { type: 'image/jpeg' })
  const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file()] })

  return (
    <div className="photo-viewer" role="dialog" aria-modal="true">
      <div className={zoom ? 'photo-stage zoomed' : 'photo-stage'} onClick={() => setZoom((z) => !z)}>
        <BlobImage blob={photo.blob} alt={photo.note ?? ''} />
      </div>
      <div className="photo-bar">
        {(caption || photo.note) && <div className="photo-caption">{caption ?? photo.note}</div>}
        {onChange && photo.category !== 'receipts' && (
          <select
            className="photo-category"
            aria-label={t('gallery.category')}
            value={photo.category}
            onChange={(e) => onChange({ ...photo, category: e.target.value as PhotoCategory })}
          >
            {PHOTO_CATEGORIES.filter((c) => c !== 'receipts').map((c) => (
              <option key={c} value={c}>
                {PHOTO_ICON[c]} {t(`gallery.cat.${c}`)}
              </option>
            ))}
          </select>
        )}
        <div className="photo-actions">
          {canShare && (
            <button onClick={() => navigator.share({ files: [file()] }).catch(() => undefined)}>📤 {t('gallery.share')}</button>
          )}
          <button onClick={() => window.confirm(t('gallery.confirmDelete')) && onDelete()}>🗑 {t('wallet.delete')}</button>
          <button className="primary" onClick={onClose}>
            ✕ {t('card.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
