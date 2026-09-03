import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

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

  // --- Arrastre para cerrar (solo bottom-sheet móvil <600px) ---
  const [offset, setOffset] = useState(0)      // px que el sheet ha bajado (0 = abierto)
  const [dragging, setDragging] = useState(false)
  const [closing, setClosing] = useState(false)
  const gest = useRef({ active: false, startY: 0, height: 0 })

  function onGrabStart(e: React.PointerEvent) {
    if (window.innerWidth >= 600) return                       // en desktop es modal centrado, no se arrastra
    if ((e.target as HTMLElement).closest('button')) return    // no secuestrar Cancelar/Guardar
    gest.current = { active: true, startY: e.clientY, height: dialogRef.current?.offsetHeight || 400 }
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  function onGrabMove(e: React.PointerEvent) {
    if (!gest.current.active) return
    const dy = e.clientY - gest.current.startY
    setOffset(dy > 0 ? dy : dy * 0.2)                          // resistencia rubber-band hacia arriba
  }
  function onGrabEnd() {
    if (!gest.current.active) return
    gest.current.active = false
    setDragging(false)
    const h = gest.current.height
    if (offset > Math.min(140, h * 0.28)) {                    // pasó el umbral → cerrar deslizando
      setClosing(true)
      setOffset(h + 40)
      setTimeout(onClose, 280)
    } else {
      setOffset(0)                                             // vuelve arriba con el resorte del CSS
    }
  }

  // Estilos derivados del arrastre (no se aplican en desktop: offset queda en 0).
  const sheetStyle = (dragging || closing || offset)
    ? { transform: `translateX(-50%) translateY(${offset}px)`, transition: dragging ? 'none' : undefined }
    : undefined
  const scrimStyle = (dragging || closing) && gest.current.height
    ? { opacity: Math.max(0, 1 - offset / gest.current.height) }
    : undefined
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
      <div className="scrim show" style={scrimStyle} onClick={onClose} />
      <div className="sheet show" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef} tabIndex={-1} style={sheetStyle}>
        <div className="sheet-grab" onPointerDown={onGrabStart} onPointerMove={onGrabMove} onPointerUp={onGrabEnd} onPointerCancel={onGrabEnd}>
          <div className="grabber" />
          <div className="sheet-head">
            {hideCancel ? <span style={{ width: 60 }} /> : <button className="btn-plain" onClick={onClose}>Cancelar</button>}
            <div className="t" id={titleId}>{title}</div>
            {onSave ? <button className="btn-plain save" onClick={onSave}>{saveLabel}</button> : <span style={{ width: 60 }} />}
          </div>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  )
}
