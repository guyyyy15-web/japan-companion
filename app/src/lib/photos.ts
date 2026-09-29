// Photos kept on this phone (IndexedDB): receipts attached to wallet expenses, and a gallery of tickets,
// bookings, documents and maps. localStorage is too small for images; IndexedDB stores the files themselves.

export const PHOTO_CATEGORIES = ['tickets', 'hotels', 'docs', 'maps', 'receipts', 'other'] as const
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number]

export const PHOTO_ICON: Record<PhotoCategory, string> = {
  tickets: '🎫',
  hotels: '🏨',
  docs: '🛂',
  maps: '🗺️',
  receipts: '🧾',
  other: '📌',
}

export interface Photo {
  id: string
  category: PhotoCategory
  /** The wallet expense this receipt belongs to. */
  expenseId?: string
  note?: string
  createdAt: string
  /** Shrunk to MAX_SIDE for storage; the original stays in the iPhone's Photos. */
  blob: Blob
  thumb: Blob
}

const DB_NAME = 'jc-photos'
const STORE = 'photos'
/** Big enough to read a receipt or a QR code, small enough that hundreds fit. */
export const MAX_SIDE = 1600
const THUMB_SIDE = 360

let db: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  db ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: 'id' })
      store.createIndex('expenseId', 'expenseId')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      db = null
      reject(req.error)
    }
  })
  return db
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const tx = d.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        tx.oncomplete = () => resolve(req.result)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      }),
  )
}

/** The size to draw an image at so its longest side is at most `max` (never enlarged). */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('not an image'))
    }
    img.src = url
  })
}

function shrink(img: HTMLImageElement, max: number, quality: number): Promise<Blob> {
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, max)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('could not encode'))), 'image/jpeg', quality),
  )
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export async function addPhoto(file: Blob, category: PhotoCategory, extra: { expenseId?: string; note?: string } = {}): Promise<Photo> {
  const img = await loadImage(file)
  const photo: Photo = {
    id: newId(),
    category,
    ...(extra.expenseId ? { expenseId: extra.expenseId } : {}),
    ...(extra.note?.trim() ? { note: extra.note.trim() } : {}),
    createdAt: new Date().toISOString(),
    blob: await shrink(img, MAX_SIDE, 0.82),
    thumb: await shrink(img, THUMB_SIDE, 0.7),
  }
  await run('readwrite', (s) => s.put(photo))
  keepPhotos()
  return photo
}

export async function listPhotos(): Promise<Photo[]> {
  const all = await run<Photo[]>('readonly', (s) => s.getAll() as IDBRequest<Photo[]>)
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function updatePhoto(photo: Photo): Promise<IDBValidKey> {
  return run('readwrite', (s) => s.put(photo))
}

export function deletePhoto(id: string): Promise<undefined> {
  return run('readwrite', (s) => s.delete(id))
}

export async function deletePhotosOf(expenseId: string): Promise<void> {
  for (const p of await listPhotos()) if (p.expenseId === expenseId) await deletePhoto(p.id)
}

/** Ask the browser not to clear this app's storage when the phone runs low on space. */
export function keepPhotos(): void {
  navigator.storage?.persist?.().catch(() => undefined)
}

/** How much the app stores, for the gallery footer. */
export async function storageUsed(): Promise<number | null> {
  try {
    return (await navigator.storage?.estimate?.())?.usage ?? null
  } catch {
    return null
  }
}
