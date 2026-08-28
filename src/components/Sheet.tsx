import { useEffect, useId, useRef, type ReactNode } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export default function Sheet({ title, onClose, onSave, saveLabel = 'Guardar', hideCancel, children }: {
  title: string
  onClose: () => void
  onSave?: () => void
  saveLabel?: string
  hideCancel?: boolean
  children: ReactNode
}) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  // Elemento que tenía el foco al abrir (para restaurarlo al cerrar). Se captura en
  // el primer render, antes de que un autoFocus interno mueva el foco.
  const openerRef = useRef<HTMLElement | null>(null)
  if (openerRef.current === null && typeof document !== 'undefined') {
    openerRef.current = document.activeElement as HTMLElement
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // Foco inicial: si nada dentro ya lo tiene (autoFocus), enfoca el primer control.
    if (!dialog.contains(document.activeElement)) {
      const first = dialog.querySelector<HTMLElement>(FOCUSABLE)
      ;(first || dialog).focus()
    }

    // Bloquea el scroll del fondo mientras el sheet está abierto.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab') return
      const items = Array.from(dialog!.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    dialog.addEventListener('keydown', onKey)

    const opener = openerRef.current
    return () => {
      dialog.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus?.()
    }
  }, [onClose])

  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <div className="sheet show" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef} tabIndex={-1}>
        <div className="grabber" />
        <div className="sheet-head">
          {hideCancel ? <span style={{ width: 60 }} /> : <button className="btn-plain" onClick={onClose}>Cancelar</button>}
          <div className="t" id={titleId}>{title}</div>
          {onSave ? <button className="btn-plain save" onClick={onSave}>{saveLabel}</button> : <span style={{ width: 60 }} />}
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  )
}
