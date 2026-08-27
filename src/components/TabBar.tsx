import { useStore } from '../store'
import type { ViewName } from '../types'
import type { ReactNode } from 'react'

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ICONS: Record<ViewName, ReactNode> = {
  inicio: (
    <svg width="25" height="25" viewBox="0 0 24 24" {...S}><path d="M3 10.8 12 3.5l9 7.3" /><path d="M5.5 9.4V20a1 1 0 0 0 1 1H9v-6h6v6h2.5a1 1 0 0 0 1-1V9.4" /></svg>
  ),
  movimientos: (
    <svg width="25" height="25" viewBox="0 0 24 24" {...S}><path d="M8.5 6.5H21M8.5 12H21M8.5 17.5H21" /><path d="M3.5 6.5h.01M3.5 12h.01M3.5 17.5h.01" /></svg>
  ),
  presupuestos: (
    <svg width="25" height="25" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
  ),
  reportes: (
    <svg width="25" height="25" viewBox="0 0 24 24" {...S}><path d="M4 20.5h16" /><path d="M7 20.5v-6M12 20.5V8.5M17 20.5v-8.5" strokeWidth={2.4} /></svg>
  ),
  ajustes: (
    <svg width="25" height="25" viewBox="0 0 24 24" {...S}><path d="M4 8h7M15 8h5M4 16h5M13 16h7" /><circle cx="13" cy="8" r="2.1" /><circle cx="11" cy="16" r="2.1" /></svg>
  ),
}

const TABS: { view: ViewName; label: string }[] = [
  { view: 'inicio', label: 'Inicio' },
  { view: 'movimientos', label: 'Movim.' },
  { view: 'presupuestos', label: 'Presup.' },
  { view: 'reportes', label: 'Reportes' },
  { view: 'ajustes', label: 'Ajustes' },
]

export default function TabBar() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {TABS.map((t) => (
        <button
          key={t.view} className={view === t.view ? 'on' : ''}
          aria-current={view === t.view ? 'page' : undefined}
          onClick={() => { setView(t.view); window.scrollTo(0, 0) }}
        >
          <span className="tb-ic" aria-hidden="true">{ICONS[t.view]}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
