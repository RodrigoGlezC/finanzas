import { useStore } from '../store'
import { getPeriod } from '../lib/period'
import { accName } from '../lib/calc'
import { ACC_ICON, iconFor } from '../lib/constants'
import { colorForName, cssVar, money, parseD } from '../lib/format'
import { IconSquare } from '../components/ui'

export default function Movimientos() {
  const data = useStore((s) => s.data)
  const anchorMs = useStore((s) => s.anchor)
  const periodMode = useStore((s) => s.periodMode)
  const filterMode = useStore((s) => s.filterMode)
  const accFilter = useStore((s) => s.accFilter)
  const search = useStore((s) => s.search)
  const setFilter = useStore((s) => s.setFilter)
  const setAccFilter = useStore((s) => s.setAccFilter)
  const setSearch = useStore((s) => s.setSearch)
  const openSheet = useStore((s) => s.openSheet)
  const commit = useStore((s) => s.commit)
  const showToast = useStore((s) => s.showToast)

  const P = getPeriod(new Date(anchorMs), periodMode)
  let rows = data.movements.filter((m) => P.inRange(m.date)).slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b._c - a._c)
  if (filterMode !== 'all') rows = rows.filter((m) => m.type === filterMode)
  if (accFilter !== 'all') rows = rows.filter((m) => m.accountId === accFilter)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter((m) => (m.category + ' ' + (m.note || '')).toLowerCase().includes(q))
  }

  function del(id: string) {
    const m = data.movements.find((x) => x.id === id)
    if (!m) return
    const isRec = !!m.recurringId
    const msg = isRec
      ? `Este movimiento lo generó un pago recurrente.\n¿Eliminar solo "${m.category}" de ${money(m.amount, true)} en este periodo?`
      : `¿Eliminar "${m.category}" de ${money(m.amount, true)}?`
    if (!confirm(msg)) return
    const removed = { ...m }
    commit((st) => {
      if (isRec) {
        const r = st.recurring.find((x) => x.id === m.recurringId)
        if (r) { r.skip = r.skip || []; if (m.period && !r.skip.includes(m.period)) r.skip.push(m.period) }
      }
      st.movements = st.movements.filter((x) => x.id !== id)
    })
    showToast('Movimiento eliminado', () => {
      commit((st) => {
        st.movements.push(removed)
        if (isRec) {
          const r = st.recurring.find((x) => x.id === removed.recurringId)
          if (r && r.skip) r.skip = r.skip.filter((p) => p !== removed.period)
        }
      })
    })
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
        <div className="seg">
          <button className={filterMode === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>Todos</button>
          <button className={filterMode === 'in' ? 'on' : ''} onClick={() => setFilter('in')}>Ingresos</button>
          <button className={filterMode === 'out' ? 'on' : ''} onClick={() => setFilter('out')}>Gastos</button>
        </div>
        <div className="searchbar">
          <span className="si">🔍</span>
          <input placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="chips">
          <button className={`chip ${accFilter === 'all' ? 'on' : ''}`} onClick={() => setAccFilter('all')}>Todas</button>
          {data.accounts.map((a) => (
            <button key={a.id} className={`chip ${accFilter === a.id ? 'on' : ''}`} onClick={() => setAccFilter(a.id)}>
              {ACC_ICON[a.type] || ''} {a.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 14 }}>{rows.length} {rows.length === 1 ? 'movimiento' : 'movimientos'}</div>
      <div className="card">
        {data.movements.length === 0 ? (
          <div className="empty">
            <div className="e-ic">💸</div>
            <div className="e-t">Empieza a registrar</div>
            <div className="e-s">Agrega tu primer movimiento o carga datos de ejemplo.</div>
            <button className="btn-fill" onClick={() => openSheet({ kind: 'movement' })}>Agregar movimiento</button>
          </div>
        ) : rows.length === 0 ? (
          <div className="empty"><div className="e-ic">🔍</div><div className="e-s" style={{ margin: 0 }}>No hay movimientos con este filtro.</div></div>
        ) : rows.map((m) => {
          const col = m.type === 'in' ? cssVar('--green') : colorForName(m.category)
          const dt = parseD(m.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
          const rec = m.recurringId ? ' · 🔁' : ''
          const sub = (m.note ? m.note + ' · ' : '') + dt + ' · ' + accName(data, m.accountId) + rec
          return (
            <div className="row tappable" key={m.id} onClick={() => openSheet({ kind: 'movement', id: m.id })}>
              <IconSquare emoji={iconFor(m.category, m.type)} color={col} />
              <div className="r-main"><div className="r-title">{m.category}</div><div className="r-sub">{sub}</div></div>
              <div className="r-trail">
                <span className={`r-amt ${m.type === 'in' ? 'in' : ''} tnum`}>{m.type === 'in' ? '+' : '−'}{money(m.amount, true)}</span>
                <button className="del" onClick={(e) => { e.stopPropagation(); del(m.id) }}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
