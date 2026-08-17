import { useRef, useState } from 'react'
import { useStore } from '../store'
import { getPeriod } from '../lib/period'
import { clearAll, exportCsv, exportJson, importJson, loadExample } from '../lib/dataOps'

const TITLES: Record<string, string> = {
  inicio: 'Inicio', movimientos: 'Movimientos', presupuestos: 'Presupuestos',
  reportes: 'Reportes', ajustes: 'Ajustes',
}

export default function Nav() {
  const view = useStore((s) => s.view)
  const periodMode = useStore((s) => s.periodMode)
  const anchor = useStore((s) => s.anchor)
  const theme = useStore((s) => s.theme)
  const step = useStore((s) => s.step)
  const setPeriodMode = useStore((s) => s.setPeriodMode)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const openSheet = useStore((s) => s.openSheet)
  const [menuOpen, setMenuOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const showStepper = view === 'inicio' || view === 'movimientos'
  const label = getPeriod(new Date(anchor), periodMode).label

  return (
    <div className="nav">
      <div className="nav-row">
        <div className="nav-title">{TITLES[view]}</div>
        <div className="grow" />
        <div className="stepper" style={{ visibility: showStepper ? 'visible' : 'hidden' }}>
          <button onClick={() => step(-1)} aria-label="Anterior">‹</button>
          <span className="m">{label}</span>
          <button onClick={() => step(1)} aria-label="Siguiente">›</button>
        </div>
      </div>
      <div className="nav-row" style={{ marginTop: 10, gap: 8 }}>
        <div className="seg" style={{ maxWidth: 180, visibility: showStepper ? 'visible' : 'hidden' }}>
          <button className={periodMode === 'month' ? 'on' : ''} onClick={() => setPeriodMode('month')}>Mes</button>
          <button className={periodMode === 'week' ? 'on' : ''} onClick={() => setPeriodMode('week')}>Semana</button>
        </div>
        <div className="grow" />
        <button className="navbtn" onClick={toggleTheme} title="Tema">{theme === 'dark' ? '☀️' : '🌙'}</button>
        <div style={{ position: 'relative' }}>
          <button className="navbtn" onClick={() => setMenuOpen((v) => !v)} title="Opciones">⋯</button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 54 }} onClick={() => setMenuOpen(false)} />
              <div className="menu show" style={{ top: 44 }}>
                <button onClick={() => { setMenuOpen(false); loadExample() }}><span className="mi">✨</span> Cargar datos de ejemplo</button>
                <button onClick={() => { setMenuOpen(false); exportJson() }}><span className="mi">⬇️</span> Exportar respaldo</button>
                <button onClick={() => { setMenuOpen(false); fileRef.current?.click() }}><span className="mi">⬆️</span> Importar respaldo</button>
                <button onClick={() => { setMenuOpen(false); exportCsv() }}><span className="mi">📄</span> Exportar periodo a CSV</button>
                <div className="msep" />
                <button className="danger" onClick={() => { setMenuOpen(false); clearAll() }}><span className="mi">🗑️</span> Borrar todos los datos</button>
              </div>
            </>
          )}
        </div>
        <button className="navbtn add" onClick={() => openSheet({ kind: 'movement' })} title="Nuevo">+</button>
      </div>
      <input
        ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }}
      />
    </div>
  )
}
