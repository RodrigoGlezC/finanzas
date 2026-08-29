import { useStore } from '../store'

/**
 * Captura al pulgar: botón flotante en la zona baja (alcanzable con una mano)
 * para la acción #1 de la app — registrar un movimiento. Abre el sheet keypad-first.
 */
export default function QuickAdd() {
  const openSheet = useStore((s) => s.openSheet)
  return (
    <button className="fab" aria-label="Nuevo movimiento" onClick={() => openSheet({ kind: 'movement' })}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}
