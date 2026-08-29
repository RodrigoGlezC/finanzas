import { useStore } from '../store'
import { goalSaved, avgMonthlySavings, spentByCatMonth } from '../lib/calc'
import { cssVar, money } from '../lib/format'
import { Icon } from '../lib/icons'
import BudgetRow from '../components/BudgetRow'

export default function Presupuestos() {
  const data = useStore((s) => s.data)
  const anchorMs = useStore((s) => s.anchor)
  const pmTab = useStore((s) => s.pmTab)
  const setPmTab = useStore((s) => s.setPmTab)
  const openSheet = useStore((s) => s.openSheet)

  const spentM = spentByCatMonth(data, new Date(anchorMs))
  const budgetCats = Object.keys(data.budgets).filter((c) => data.budgets[c] > 0)
  const rows = budgetCats
    .map((c) => ({ c, limit: data.budgets[c], spent: spentM[c] || 0 }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
  const totL = rows.reduce((s, r) => s + r.limit, 0)
  const totS = rows.reduce((s, r) => s + r.spent, 0)
  const rate = avgMonthlySavings(data)

  return (
    <>
      <div className="seg" style={{ marginBottom: 6 }}>
        <button className={pmTab === 'budgets' ? 'on' : ''} onClick={() => setPmTab('budgets')}>Presupuestos</button>
        <button className={pmTab === 'goals' ? 'on' : ''} onClick={() => setPmTab('goals')}>Metas</button>
      </div>

      {pmTab === 'budgets' ? (
        <>
          <div className="section-title">Presupuestos del mes <button className="act" onClick={() => openSheet({ kind: 'budget' })}>+ Añadir</button></div>
          {rows.length === 0 ? (
            <div className="card"><div className="empty">
              <div className="e-ic"><Icon name="target" /></div><div className="e-t">Sin presupuestos</div>
              <div className="e-s">Define un límite mensual por categoría y te avisamos cuando te acerques.</div>
              <button className="btn-fill" onClick={() => openSheet({ kind: 'budget' })}>Crear presupuesto</button>
            </div></div>
          ) : (
            <div className="card">
              <div className="card-h"><h3>Total presupuestado</h3><span className="sub">{money(totS)} de {money(totL)}</span></div>
              {rows.map((r) => <BudgetRow key={r.c} cat={r.c} limit={r.limit} spent={r.spent} cats={data.cats} onClick={() => openSheet({ kind: 'budget', cat: r.c })} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="section-title">Metas de ahorro <button className="act" onClick={() => openSheet({ kind: 'goal' })}>+ Nueva meta</button></div>
          {data.goals.length > 0 && (
            <div className="hint" style={{ padding: '0 4px 12px', marginTop: -2 }}>
              Una meta es solo un objetivo. Cada aporte se guarda como un movimiento de ahorro, así que también suma a tu ahorro del mes — no se cuenta dos veces.
            </div>
          )}
          {data.goals.length === 0 ? (
            <div className="card"><div className="empty">
              <div className="e-ic"><Icon name="target" /></div><div className="e-t">Sin metas todavía</div>
              <div className="e-s">Crea una meta de ahorro y sigue tu progreso mes a mes.</div>
              <button className="btn-fill" onClick={() => openSheet({ kind: 'goal' })}>Nueva meta</button>
            </div></div>
          ) : data.goals.map((g) => {
            const sv = goalSaved(data, g)
            const pct = g.target > 0 ? Math.min(100, (sv / g.target) * 100) : 0
            const col = g.color || cssVar('--s7')
            const rest = Math.max(0, g.target - sv)
            const done = sv >= g.target
            const months = rate > 0 ? Math.ceil(rest / rate) : 0
            return (
              <div className="card" style={{ marginBottom: 12 }} key={g.id}>
                <div className="card-pad">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600 }}>{g.name}</div>
                      <div className="r-sub" style={{ marginTop: 2 }}>{money(sv)} de {money(g.target)} {done ? ' · ¡completada!' : ''}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{Math.round(pct)}%</div>
                  </div>
                  <div className="track big" style={{ margin: '12px 0 10px' }}><span style={{ width: pct + '%', background: col }} /></div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-soft" style={{ flex: 1 }} onClick={() => openSheet({ kind: 'aporte', goalId: g.id })}>＋ Aporte</button>
                    <button className="btn-soft" onClick={() => openSheet({ kind: 'goal', id: g.id })}>Editar</button>
                  </div>
                  {!done && rest > 0 && (
                    <div className="r-sub" style={{ marginTop: 10 }}>
                      Te faltan {money(rest)}{months > 0 && isFinite(months) ? ` · ~${months} ${months === 1 ? 'mes' : 'meses'} a tu ritmo actual` : ''}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </>
      )}
    </>
  )
}
