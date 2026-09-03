import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { getPeriod } from '../lib/period'
import { Icon } from '../lib/icons'

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

  const showStepper = view === 'inicio' || view === 'movimientos'
  const label = getPeriod(new Date(anchor), periodMode).label
  const title = TITLES[view]

  const largeRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  // Seguimiento del scroll de ventana (rAF-throttled) para el large-title colapsable y el
  // "scroll edge" del nav. Es dinámica ligada al dedo, no una animación → no la gobierna
  // prefers-reduced-motion (moverse con el scroll es lo esperado).
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; setScrollY(window.scrollY) })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  // Al cambiar de vista, volver arriba para reponer el título grande (como iOS al cambiar de tab).
  useEffect(() => { window.scrollTo(0, 0) }, [view])

  const h = largeRef.current?.offsetHeight || 48
  const progress = Math.min(1, Math.max(0, scrollY / h)) // 0 = arriba del todo · 1 = título ya colapsado
  const scrolled = scrollY > 2
  // El título compacto entra en el tramo final del colapso (crossfade con el grande).
  const titleShown = Math.min(1, Math.max(0, (progress - 0.35) / 0.5))

  return (
    <>
      <div className={'nav' + (scrolled ? ' scrolled' : '')}>
        <div className="nav-row">
          <div
            className="nav-title compact"
            aria-hidden="true"
            style={{ opacity: titleShown, transform: `translateY(${(1 - titleShown) * 4}px)` }}
          >
            {title}
          </div>
          <div className="grow" />
          <div className="stepper" style={{ visibility: showStepper ? 'visible' : 'hidden' }}>
            <button onClick={() => step(-1)} aria-label="Anterior">‹</button>
            <span className="m">{label}</span>
            <button onClick={() => step(1)} aria-label="Siguiente">›</button>
          </div>
        </div>
        <div className="nav-row" style={{ marginTop: 10, gap: 8 }}>
          <div className="seg" style={{ maxWidth: 180, visibility: showStepper ? 'visible' : 'hidden' }}>
            <button className={periodMode === 'week' ? 'on' : ''} onClick={() => setPeriodMode('week')}>Semana</button>
            <button className={periodMode === 'month' ? 'on' : ''} onClick={() => setPeriodMode('month')}>Mes</button>
          </div>
          <div className="grow" />
          <button className="navbtn" onClick={toggleTheme} title="Tema" aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
        </div>
      </div>
      <div className="nav-large" ref={largeRef}>
        <h1>{title}</h1>
      </div>
    </>
  )
}
