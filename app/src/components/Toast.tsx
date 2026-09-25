import { useEffect, useState } from 'react'

const EVENT = 'jc:toast'

/** Shows a short message at the bottom of the screen for a few seconds. */
export function showToast(message: string): void {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }))
}

export function Toast() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    let timer: number | undefined
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setMessage(null), 6000)
    }
    window.addEventListener(EVENT, onToast)
    return () => {
      window.removeEventListener(EVENT, onToast)
      window.clearTimeout(timer)
    }
  }, [])
  if (!message) return null
  return (
    <div className="toast" role="status" onClick={() => setMessage(null)}>
      {message}
    </div>
  )
}
