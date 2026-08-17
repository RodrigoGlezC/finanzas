import type { ReactNode } from 'react'

export default function Sheet({ title, onClose, onSave, saveLabel = 'Guardar', hideCancel, children }: {
  title: string
  onClose: () => void
  onSave?: () => void
  saveLabel?: string
  hideCancel?: boolean
  children: ReactNode
}) {
  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <div className="sheet show">
        <div className="grabber" />
        <div className="sheet-head">
          {hideCancel ? <span style={{ width: 60 }} /> : <button className="btn-plain" onClick={onClose}>Cancelar</button>}
          <div className="t">{title}</div>
          {onSave ? <button className="btn-plain save" onClick={onSave}>{saveLabel}</button> : <span style={{ width: 60 }} />}
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  )
}
