import { useEffect } from 'react'
import { useStore } from '../store'

export default function Toast() {
  const toast = useStore((s) => s.toast)
  const clearToast = useStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const ms = toast.undo ? 7000 : 2300
    const t = setTimeout(clearToast, ms)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null
  return (
    <div className="toast show" role="status" aria-live="polite" aria-atomic="true">
      <span>{toast.msg}</span>
      {toast.undo && (
        <button
          className="undo-btn"
          onClick={() => { toast.undo?.(); clearToast() }}
        >Deshacer</button>
      )}
    </div>
  )
}
