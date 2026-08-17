import { useStore } from '../store'
import { getPeriod } from '../lib/period'
import { accBalance, catGroup, spentByCatMonth } from '../lib/calc'
import { upcomingList } from '../lib/recurring'
import { ACC_ICON, iconFor } from '../lib/constants'
import { cap, colorForName, cssVar, money } from '../lib/format'
import { IconSquare, MiniEmpty } from '../components/ui'
import BudgetRow from '../components/BudgetRow'
import Donut from '../charts/Donut'

export default function Inicio() {
  const data = useStore((s) => s.data)
  const anchorMs = useStore((s) => s.anchor)
  const periodMode = useStore((s) => s.periodMode)
  const setView = useStore((s) => s.setView)
  const openSheet = useStore((s) => s.openSheet)

  const anchor = new Date(anchorMs)
  const P = getPeriod(anchor, periodMode)
  const mv = data.movements.filter((m) => P.inRange(m.date))
  const ingresos = mv.filter((m) => m.type === 'in').reduce((a, b) => a + b.amount, 0)
  const gastos = mv.filter((m) => m.type === 'out').reduce((a, b) => a + b.amount, 0)
  const ahorro = mv.filter((m) => m.type === 'out' && catGroup(data, m.category) === 'Ahorros').reduce((a, b) => a + b.amount, 0)
  const balance = ingresos - gastos

  // ratio bar
  const base = Math.max(ingresos, gastos, 1)
  const gp = Math.min(100, (gastos / base) * 100)
  const sp = balance > 0 ? Math.min(100, (balance / base) * 100) : 0

  // gastos por categoría
  const byCat: Record<string, number> = {}
  mv.filter((m) => m.type === 'out').forEach((m) => { byCat[m.category] = (byCat[m.category] || 0) + m.amount })
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const catMax = catRows.length ? catRows[0][1] : 1
  const catTotal = catRows.reduce((a, b) => a + b[1], 0)

  // grupos (donut)
  const byGroup: Record<string, number> = {}
  mv.filter((m) => m.type === 'out').forEach((m) => { const g = catGroup(data, m.category); byGroup[g] = (byGroup[g] || 0) + m.amount })
  const groupEntries = Object.entries(byGroup).sort((a, b) => b[1] - a[1])
  const groupTotal = groupEntries.reduce((a, b) => a + b[1], 0)

  // presupuestos mini
  const budgetCats = Object.keys(data.budgets).filter((c) => data.budgets[c] > 0)
  const spentM = spentByCatMonth(data, anchor)
  const miniBudgets = budgetCats
    .map((c) => ({ c, limit: data.budgets[c], spent: spentM[c] || 0 }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .slice(0, 3)

  const upcoming = upcomingList(data, 31).slice(0, 4)

  return (
    <>
      <div className="hero">
        <div className="h-lab">Sobrante · {P.label}</div>
        <div className="h-amt tnum" style={{ color: balance >= 0 ? 'var(--label)' : 'var(--red-ink)' }}>{money(balance)}</div>
        <div className="h-note">{!mv.length ? 'Sin movimientos en este periodo' : balance >= 0 ? 'Vas bien este periodo 🎉' : 'Estás gastando de más'}</div>
        <div className="ratio">
          {(ingresos > 0 || gastos > 0) && <span style={{ width: gp + '%', background: 'var(--red)' }} />}
          {sp > 0 && <span style={{ width: sp + '%', background: 'var(--green)' }} />}
        </div>
        <div className="hstats">
          <div className="hstat"><div className="s-top"><span className="dot" style={{ background: 'var(--green)' }} />Ingresos</div><div className="s-val tnum">{money(ingresos)}</div></div>
          <div className="hstat"><div className="s-top"><span className="dot" style={{ background: 'var(--red)' }} />Gastos</div><div className="s-val tnum">{money(gastos)}</div></div>
          <div className="hstat"><div className="s-top"><span className="dot" style={{ background: 'var(--s7)' }} />Ahorro</div><div className="s-val tnum">{money(ahorro)}</div></div>
        </div>
      </div>

      <div className="section-title">Cuentas</div>
      <div className="card">
        {data.accounts.map((a) => {
          const bal = accBalance(data, a.id)
          return (
            <div className="row" key={a.id}>
              <IconSquare emoji={ACC_ICON[a.type] || '👛'} color={cssVar('--tint')} />
              <div className="r-main"><div className="r-title">{a.name}</div><div className="r-sub">{cap(a.type)}</div></div>
              <div className="r-amt tnum" style={{ color: bal < 0 ? 'var(--red-ink)' : 'var(--label)' }}>{money(bal)}</div>
            </div>
          )
        })}
        <div className="row tappable" onClick={() => openSheet({ kind: 'account' })}>
          <span className="ic" style={{ background: 'var(--fill)' }}>＋</span>
          <div className="r-main"><div className="r-title" style={{ color: 'var(--tint)' }}>Añadir cuenta</div></div>
        </div>
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="section-title">Próximos pagos</div>
          <div className="card">
            {upcoming.map(({ r, date }, i) => {
              const col = r.type === 'in' ? cssVar('--green') : colorForName(r.category)
              const dd = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
              return (
                <div className="row" key={i}>
                  <IconSquare emoji={iconFor(r.category, r.type)} color={col} />
                  <div className="r-main"><div className="r-title">{r.category}</div><div className="r-sub">Vence {dd}</div></div>
                  <div className="r-amt tnum">{money(r.amount)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="section-title">Presupuestos <button className="act" onClick={() => setView('presupuestos')}>Ver todos ›</button></div>
      <div className="card">
        {miniBudgets.length === 0 ? (
          <div className="row tappable" onClick={() => { setView('presupuestos'); openSheet({ kind: 'budget' }) }}>
            <span className="ic" style={{ background: 'var(--fill)' }}>🎯</span>
            <div className="r-main"><div className="r-title" style={{ color: 'var(--tint)' }}>Crear un presupuesto</div><div className="r-sub">Define límites y recibe alertas</div></div>
          </div>
        ) : miniBudgets.map((b) => <BudgetRow key={b.c} cat={b.c} limit={b.limit} spent={b.spent} />)}
      </div>

      <div className="section-title">Gastos por categoría</div>
      <div className="card">
        {catRows.length === 0 ? <MiniEmpty text="Sin gastos en este periodo" /> : catRows.map(([name, val]) => {
          const col = colorForName(name)
          const pct = Math.max(4, (val / catMax) * 100)
          const share = Math.round((val / catTotal) * 100)
          return (
            <div className="catrow" key={name}>
              <IconSquare emoji={iconFor(name, 'out')} color={col} />
              <div className="cbody">
                <div className="cline"><span className="cname">{name}</span><span className="cval tnum">{money(val)}<small>{share}%</small></span></div>
                <div className="track"><span style={{ width: pct + '%', background: col }} /></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-title">A dónde se va tu dinero</div>
      <div className="card">
        <div className="donut-wrap">
          <Donut entries={groupEntries} />
          <div className="legend">
            {groupEntries.length === 0 ? <MiniEmpty text="Sin datos" /> : groupEntries.map(([g, v], i) => (
              <div className="legrow" key={g}>
                <span className="legdot" style={{ background: cssVar(`--s${(i % 8) + 1}`) }} />
                <span className="ln">{g}</span>
                <span className="lv tnum">{money(v)}</span>
                <span className="lp">{Math.round((v / groupTotal) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
