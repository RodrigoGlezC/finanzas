import { useStore } from '../store'
import { getPeriod } from '../lib/period'
import { accBalance, budgetAlerts, budgetSummary, catGroup, spentByCatMonth } from '../lib/calc'
import { upcomingList } from '../lib/recurring'
import { ACC_ICON, iconFor } from '../lib/constants'
import { cap, cssVar, money, monthKey, mondayOf, ymd } from '../lib/format'
import { uid } from '../lib/storage'
import { IconSquare, MiniEmpty } from '../components/ui'
import BudgetRow from '../components/BudgetRow'
import Money from '../components/Money'
import type { Recurring } from '../types'

export default function Inicio() {
  const data = useStore((s) => s.data)
  const anchorMs = useStore((s) => s.anchor)
  const periodMode = useStore((s) => s.periodMode)
  const setView = useStore((s) => s.setView)
  const setFilter = useStore((s) => s.setFilter)
  const openSheet = useStore((s) => s.openSheet)
  const commit = useStore((s) => s.commit)
  const showToast = useStore((s) => s.showToast)

  const anchor = new Date(anchorMs)
  const P = getPeriod(anchor, periodMode)
  const mv = data.movements.filter((m) => P.inRange(m.date) && !m.transfer)
  const ingresos = mv.filter((m) => m.type === 'in').reduce((a, b) => a + b.amount, 0)
  const gastos = mv.filter((m) => m.type === 'out').reduce((a, b) => a + b.amount, 0)
  const ahorro = mv.filter((m) => m.type === 'out' && catGroup(data, m.category) === 'Ahorros').reduce((a, b) => a + b.amount, 0)
  const balance = ingresos - gastos

  // Delta del sobrante vs. el periodo anterior (mismo modo semana/mes)
  const prevAnchor = periodMode === 'week'
    ? new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 7)
    : new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
  const PP = getPeriod(prevAnchor, periodMode)
  const pmv = data.movements.filter((m) => PP.inRange(m.date) && !m.transfer)
  const prevBalance = pmv.filter((m) => m.type === 'in').reduce((a, b) => a + b.amount, 0)
    - pmv.filter((m) => m.type === 'out').reduce((a, b) => a + b.amount, 0)
  const deltaPct = mv.length > 0 && prevBalance !== 0
    ? Math.round(((balance - prevBalance) / Math.abs(prevBalance)) * 100) : null

  const avail = budgetSummary(data, anchor)
  const alerts = budgetAlerts(data, anchor)

  function pagar(r: Recurring, date: Date) {
    const key = r.freq === 'mensual' ? monthKey(date) : 'W' + ymd(mondayOf(date))
    if (data.movements.some((m) => m.recurringId === r.id && m.period === key)) { showToast('Ese pago ya está registrado'); return }
    commit((st) => {
      st.movements.push({ id: uid('m_'), type: r.type, amount: r.amount, category: r.category, date: ymd(date), note: r.note || '', accountId: r.accountId, recurringId: r.id, period: key, _c: Date.now() })
    })
    showToast('Pago registrado ✓')
  }

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
        <div className="h-eyebrow">{P.label}</div>
        <div className="h-lead">
          <div>
            <div className="h-lab">{!mv.length ? 'Tu balance' : balance >= 0 ? 'Te sobran' : 'Te faltan'}</div>
            <div className="h-amt tnum" style={{ color: balance >= 0 ? 'var(--label)' : 'var(--red-ink)' }}><Money value={Math.abs(balance)} decimals /></div>
          </div>
          {deltaPct !== null && (
            <span className={`h-delta ${deltaPct >= 0 ? 'up' : 'down'}`} aria-label={`${deltaPct >= 0 ? 'Subió' : 'Bajó'} ${Math.abs(deltaPct)}% vs. periodo anterior`}>
              {deltaPct >= 0 ? '▲' : '▼'} {Math.abs(deltaPct)}%
            </span>
          )}
        </div>
        <div className="h-note">{!mv.length ? 'Sin movimientos en este periodo' : balance >= 0 ? 'Vas bien este periodo 🎉' : 'Estás gastando de más'}</div>
        <div className="ratio">
          {(ingresos > 0 || gastos > 0) && <span style={{ width: gp + '%', background: 'var(--red)' }} />}
          {sp > 0 && <span style={{ width: sp + '%', background: 'var(--green)' }} />}
        </div>
        <div className="hstats">
          <div className="hstat"><div className="s-top"><span className="dot" style={{ background: 'var(--green)' }} />Ingresos</div><div className="s-val tnum"><Money value={ingresos} /></div></div>
          <div className="hstat"><div className="s-top"><span className="dot" style={{ background: 'var(--red)' }} />Gastos</div><div className="s-val tnum"><Money value={gastos} /></div></div>
          <div className="hstat"><div className="s-top"><span className="dot" style={{ background: 'var(--s7)' }} />Ahorro</div><div className="s-val tnum"><Money value={ahorro} /></div></div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          {alerts.map((a, i) => (
            <div className="alert" key={i}>
              <span className="al-ic">{a.level === 'over' ? '🔴' : '🟠'}</span>
              <div style={{ flex: 1 }}>{a.text}</div>
            </div>
          ))}
        </div>
      )}

      {avail.hasBudgets && (
        <>
          <div className="section-title">Disponible para gastar</div>
          <div className="avail-card">
            <IconSquare emoji="💸" color={cssVar(avail.remaining >= 0 ? '--green' : '--red')} />
            <div className="av-main">
              <div className="av-lab">Te queda del presupuesto de {cap(anchor.toLocaleDateString('es-MX', { month: 'long' }))}</div>
              <div className="av-val tnum" style={{ color: avail.remaining >= 0 ? 'var(--label)' : 'var(--red-ink)' }}><Money value={avail.remaining} /></div>
              <div className="av-day">{avail.remaining > 0 ? `~${money(avail.perDay)} por día los próximos ${avail.daysLeft} días` : 'Ya no queda presupuesto este mes'}</div>
            </div>
          </div>
        </>
      )}

      <div className="section-title">Cuentas {data.accounts.length >= 1 && <button className="act" onClick={() => openSheet({ kind: 'transfer' })}>Transferir</button>}</div>
      <div className="card">
        {data.accounts.map((a) => {
          const bal = accBalance(data, a.id)
          return (
            <div className="row" key={a.id}>
              <IconSquare emoji={ACC_ICON[a.type] || '👛'} color={cssVar('--tint')} />
              <div className="r-main"><div className="r-title">{a.name}</div><div className="r-sub">{cap(a.type)}</div></div>
              <div className="r-amt tnum" style={{ color: bal < 0 ? 'var(--red-ink)' : 'var(--label)' }}><Money value={bal} /></div>
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
              const col = r.type === 'in' ? cssVar('--green') : cssVar('--tint')
              const dd = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
              return (
                <div className="row" key={i}>
                  <IconSquare emoji={iconFor(r.category, r.type, data.cats)} color={col} />
                  <div className="r-main"><div className="r-title">{r.category}</div><div className="r-sub">Vence {dd} · {money(r.amount)}</div></div>
                  <button className="pill-btn" onClick={() => pagar(r, date)}>{r.type === 'in' ? 'Registrar' : 'Pagar'}</button>
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
        ) : miniBudgets.map((b) => <BudgetRow key={b.c} cat={b.c} limit={b.limit} spent={b.spent} cats={data.cats} />)}
      </div>

      <div className="section-title">Gastos por categoría {catRows.length > 6 && <button className="act" onClick={() => { setFilter('out'); setView('movimientos') }}>Ver todos ›</button>}</div>
      <div className="card">
        {catRows.length === 0 ? <MiniEmpty icon="🧾" text="Aún no hay gastos este periodo. Toca + para registrar el primero." /> : catRows.slice(0, 6).map(([name, val]) => {
          const pct = Math.max(4, (val / catMax) * 100)
          const share = Math.round((val / catTotal) * 100)
          return (
            <div className="catrow" key={name}>
              <IconSquare emoji={iconFor(name, 'out', data.cats)} color={cssVar('--tint')} />
              <div className="cbody">
                <div className="cline"><span className="cname">{name}</span><span className="cval tnum"><Money value={val} /><small>{share}%</small></span></div>
                <div className="track"><span style={{ width: pct + '%', background: 'var(--tint)' }} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
