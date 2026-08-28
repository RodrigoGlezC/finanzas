import { useEffect, useRef } from 'react'
import { useStore } from '../store'

/** Alert de confirmación estilo iOS. Reemplaza los confirm() nativos; se dispara
 *  con useStore().askConfirm(...) que devuelve una promesa de boolean. */
export default function ConfirmDialog() {
  const box = useStore((s) => s.confirmBox)
  const resolveConfirm = useStore((s) => s.resolveConfirm)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!box) return
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') resolveConfirm(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [box, resolveConfirm])

  if (!box) return null
  return (
    <>
      <div className="confirm-scrim" onClick={() => resolveConfirm(false)} />
      <div className="confirm-box" role="alertdialog" aria-modal="true" aria-label={box.title || box.message}>
        {box.title && <div className="confirm-title">{box.title}</div>}
        <div className="confirm-msg">{box.message}</div>
        <div className="confirm-actions">
          <button className="confirm-btn" onClick={() => resolveConfirm(false)}>Cancelar</button>
          <button ref={confirmRef} className={`confirm-btn primary ${box.danger ? 'danger' : ''}`} onClick={() => resolveConfirm(true)}>
            {box.confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
