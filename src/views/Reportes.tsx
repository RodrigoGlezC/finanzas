import { useStore } from '../store'
import { catGroup, monthlySeries } from '../lib/calc'
import { cap, cssVar, parseD } from '../lib/format'
import { IconSquare } from '../components/ui'
import { Icon } from '../lib/icons'
import Money from '../components/Money'
import TrendChart from '../charts/TrendChart'

export default function Reportes() {
  const data = useStore((s) => s.data)
  const anchorMs = useStore((s) => s.anchor)
  const year = new Date(anchorMs).getFullYear()

  if (!data.movements.length) {
    return (
      <div className="card"><div className="empty">
        <div className="e-ic"><Icon name="chart" /></div>
        <div className="e-t">Sin datos todavía</div>
        <div className="e-s">Registra tus primeros movimientos y aquí verás tu evolución, comparativas y el resumen del año. Toca + para empezar.</div>
      </div></div>
    )
  }

  const S = monthlySeries(data, 6)
  const cur = S[S.length - 1]
  const prev = S[S.length - 2] || { in: 0, out: 0 }
  const dIn = prev.in ? ((cur.in - prev.in) / prev.in) * 100 : 0
  const dOut = prev.out ? ((cur.out - prev.out) / prev.out) * 100 : 0

  const ym = data.movements.filter((m) => +m.date.slice(0, 4) === year && !m.transfer)
  const tin = ym.filter((m) => m.type === 'in').reduce((a, b) => a + b.amount, 0)
  const tout = ym.filter((m) => m.type === 'out').reduce((a, b) => a + b.amount, 0)
  const tsave = ym.filter((m) => m.type === 'out' && catGroup(data, m.category) === 'Ahorros').reduce((a, b) => a + b.amount, 0)

  const byCat: Record<string, number> = {}
  ym.filter((m) => m.type === 'out').forEach((m) => { byCat[m.category] = (byCat[m.category] || 0) + m.amount })
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]

  const perMonth: Record<string, { in: number; out: number }> = {}
  ym.forEach((m) => { const k = m.date.slice(0, 7); (perMonth[k] = perMonth[k] || { in: 0, out: 0 })[m.type === 'in' ? 'in' : 'out'] += m.amount })
  const monthsArr = Object.entries(perMonth).map(([k, v]) => ({ k, net: v.in - v.out }))
  const best = monthsArr.slice().sort((a, b) => b.net - a.net)[0]
  const worst = monthsArr.slice().sort((a, b) => a.net - b.net)[0]
  const nMonths = monthsArr.length || 1
  const mName = (k?: string) => (k ? cap(parseD(k + '-01').toLocaleDateString('es-MX', { month: 'long' })) : '—')

  return (
    <>
      <div className="section-title">Evolución (últimos 6 meses)</div>
      <div className="card">
        <div className="chartbox"><TrendChart series={S} /></div>
        <div className="legend" style={{ flexDirection: 'row', gap: 18, padding: '0 18px 14px' }}>
          <div className="legrow"><span className="legdot" style={{ background: 'var(--s1)' }} /><span className="ln" style={{ flex: 0 }}>Ingresos</span></div>
          <div className="legrow"><span className="legdot" style={{ background: 'var(--s2)' }} /><span className="ln" style={{ flex: 0 }}>Gastos</span></div>
        </div>
      </div>

      <div className="section-title">Comparativa</div>
      <div className="card">
        <div className="row">
          <IconSquare name="coins" color={cssVar('--green')} />
          <div className="r-main"><div className="r-title">Ingresos</div><div className="r-sub">vs mes anterior</div></div>
          <div className="r-trail"><span className="r-amt tnum"><Money value={cur.in} /></span><span className={`badge ${dIn >= 0 ? 'ok' : 'over'}`}>{dIn >= 0 ? '▲' : '▼'} {Math.abs(Math.round(dIn))}%</span></div>
        </div>
        <div className="row">
          <IconSquare name="receipt" color={cssVar('--red')} />
          <div className="r-main"><div className="r-title">Gastos</div><div className="r-sub">vs mes anterior</div></div>
          <div className="r-trail"><span className="r-amt tnum"><Money value={cur.out} /></span><span className={`badge ${dOut <= 0 ? 'ok' : 'over'}`}>{dOut >= 0 ? '▲' : '▼'} {Math.abs(Math.round(dOut))}%</span></div>
        </div>
        <div className="row">
          <IconSquare name="trending-up" color={cssVar('--s7')} />
          <div className="r-main"><div className="r-title">Sobrante</div><div className="r-sub">este mes</div></div>
          <div className="r-amt tnum" style={{ color: cur.in - cur.out >= 0 ? 'var(--green-ink)' : 'var(--red-ink)' }}><Money value={cur.in - cur.out} /></div>
        </div>
      </div>

      <div className="section-title">Resumen {year}</div>
      <div className="tiles">
        <div className="tile"><div className="t-lab">Ingresos del año</div><div className="t-val tnum" style={{ color: 'var(--green-ink)' }}><Money value={tin} /></div></div>
        <div className="tile"><div className="t-lab">Gastos del año</div><div className="t-val tnum"><Money value={tout} /></div></div>
        <div className="tile"><div className="t-lab">Ahorrado</div><div className="t-val tnum" style={{ color: 'var(--s7)' }}><Money value={tsave} /></div></div>
        <div className="tile"><div className="t-lab">Sobrante</div><div className="t-val tnum" style={{ color: tin - tout >= 0 ? 'var(--green-ink)' : 'var(--red-ink)' }}><Money value={tin - tout} /></div></div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row"><IconSquare name="chart" color={cssVar('--s2')} /><div className="r-main"><div className="r-title">Donde más gastas</div><div className="r-sub">{topCat ? topCat[0] : '—'}</div></div><div className="r-amt tnum">{topCat ? <Money value={topCat[1]} /> : '—'}</div></div>
        <div className="row"><IconSquare name="trending-up" color={cssVar('--green')} /><div className="r-main"><div className="r-title">Mejor mes</div><div className="r-sub">{best ? mName(best.k) : '—'}</div></div><div className="r-amt tnum" style={{ color: 'var(--green-ink)' }}>{best ? <Money value={best.net} /> : '—'}</div></div>
        <div className="row"><IconSquare name="trending-down" color={cssVar('--red')} /><div className="r-main"><div className="r-title">Mes más apretado</div><div className="r-sub">{worst ? mName(worst.k) : '—'}</div></div><div className="r-amt tnum" style={{ color: worst && worst.net < 0 ? 'var(--red-ink)' : 'var(--label)' }}>{worst ? <Money value={worst.net} /> : '—'}</div></div>
        <div className="row"><IconSquare name="calendar" color={cssVar('--s1')} /><div className="r-main"><div className="r-title">Gasto promedio mensual</div><div className="r-sub">{nMonths} {nMonths === 1 ? 'mes' : 'meses'} con datos</div></div><div className="r-amt tnum"><Money value={tout / nMonths} /></div></div>
      </div>
    </>
  )
}
