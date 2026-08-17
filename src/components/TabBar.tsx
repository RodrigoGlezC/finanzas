import { useStore } from '../store'
import type { ViewName } from '../types'

const TABS: { view: ViewName; icon: string; label: string }[] = [
  { view: 'inicio', icon: '🏠', label: 'Inicio' },
  { view: 'movimientos', icon: '📋', label: 'Movim.' },
  { view: 'presupuestos', icon: '🎯', label: 'Presup.' },
  { view: 'reportes', icon: '📊', label: 'Reportes' },
  { view: 'ajustes', icon: '⚙️', label: 'Ajustes' },
]

export default function TabBar() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  return (
    <div className="tabbar">
      {TABS.map((t) => (
        <button key={t.view} className={view === t.view ? 'on' : ''} onClick={() => { setView(t.view); window.scrollTo(0, 0) }}>
          <span className="tb-ic">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
