import { useStore } from '../store'
import { getPeriod } from '../lib/period'
import { accName } from '../lib/calc'
import { ACC_ICON, iconFor } from '../lib/constants'
import { cssVar, money, parseD } from '../lib/format'
import { uid, addTombstones, removeTombstones } from '../lib/storage'
import { IconSquare } from '../components/ui'
import { Icon } from '../lib/icons'
import Money from '../components/Money'
import type { Movement } from '../types'

type Row = { kind: 'mov'; m: Movement } | { kind: 'transfer'; id: string; out: Movement; inMov: Movement }

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
  const q = search.toLowerCase()
  const globalSearch = search.trim().length > 0
  const source = globalSearch ? data.movements : data.movements.filter((m) => P.inRange(m.date))
  const matchSearch = (m: Movement) => !globalSearch || (m.category + ' ' + (m.note || '')).toLowerCase().includes(q)

  let rows: Row[] = []
  if (filterMode === 'in' || filterMode === 'out') {
    rows = source
      .filter((m) => !m.transfer && m.type === filterMode && (accFilter === 'all' || m.accountId === accFilter) && matchSearch(m))
      .map((m) => ({ kind: 'mov', m }))
  } else {
    const seen = new Set<string>()
    for (const m of source) {
      if (m.transfer) {
        if (m.transferId && !seen.has(m.transferId)) {
          seen.add(m.transferId)
          const out = data.movements.find((x) => x.transferId === m.transferId && x.type === 'out')
          const inMov = data.movements.find((x) => x.transferId === m.transferId && x.type === 'in')
          if (out && inMov && (accFilter === 'all' || out.accountId === accFilter || inMov.accountId === accFilter) && matchSearch(out)) {
            rows.push({ kind: 'transfer', id: m.transferId, out, inMov })
          }
        }
      } else if ((accFilter === 'all' || m.accountId === accFilter) && matchSearch(m)) {
        rows.push({ kind: 'mov', m })
      }
    }
  }
  const sortKey = (r: Row) => (r.kind === 'mov' ? r.m : r.out)
  rows.sort((a, b) => { const A = sortKey(a), B = sortKey(b); return B.date.localeCompare(A.date) || B._c - A._c })

  function delMov(id: string) {
    const m = data.movements.find((x) => x.id === id)
    if (!m) return
    const isRec = !!m.recurringId
    const removed = { ...m }
    commit((st) => {
      if (isRec) {
        const r = st.recurring.find((x) => x.id === m.recurringId)
        if (r) { r.skip = r.skip || []; if (m.period && !r.skip.includes(m.period)) r.skip.push(m.period) }
      }
      st.movements = st.movements.filter((x) => x.id !== id)
      addTombstones(st, [id])
    })
    showToast(isRec ? 'Pago recurrente quitado de este periodo' : 'Movimiento eliminado', () => commit((st) => {
      st.movements.push(removed)
      removeTombstones(st, [removed.id])
      if (isRec) { const r = st.recurring.find((x) => x.id === removed.recurringId); if (r && r.skip) r.skip = r.skip.filter((p) => p !== removed.period) }
    }))
  }

  function delTransfer(tid: string) {
    const pair = data.movements.filter((m) => m.transferId === tid)
    const ids = pair.map((m) => m.id)
    commit((st) => { st.movements = st.movements.filter((m) => m.transferId !== tid); addTombstones(st, ids) })
    showToast('Transferencia eliminada', () => commit((st) => { st.movements.push(...pair); removeTombstones(st, ids) }))
  }

  function repetirUltimo() {
    const last = data.movements.filter((m) => !m.transfer).sort((a, b) => b._c - a._c)[0]
    if (!last) { showToast('No hay movimiento que repetir'); return }
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    let newId = ''
    commit((st) => { newId = uid('m_'); st.movements.push({ ...last, id: newId, date, _c: Date.now(), recurringId: undefined, period: undefined }) })
    showToast(`Repetido: ${last.category} ${money(last.amount)}`, () => commit((st) => { st.movements = st.movements.filter((m) => m.id !== newId) }))
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
          <span className="si"><Icon name="search" /></span>
          <input placeholder="Buscar en todo tu historial" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="chips">
          <button className={`chip ${accFilter === 'all' ? 'on' : ''}`} onClick={() => setAccFilter('all')}>Todas</button>
          {data.accounts.map((a) => (
            <button key={a.id} className={`chip ${accFilter === a.id ? 'on' : ''}`} onClick={() => setAccFilter(a.id)}><Icon name={ACC_ICON[a.type] || 'wallet'} /> {a.name}</button>
          ))}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 14 }}>
        <span>{globalSearch ? `${rows.length} en tu historial` : `${rows.length} ${rows.length === 1 ? 'movimiento' : 'movimientos'}`}</span>
        {data.movements.some((m) => !m.transfer) && <button className="act" onClick={repetirUltimo}>Repetir último</button>}
      </div>

      <div className="card">
        {data.movements.length === 0 ? (
          <div className="empty">
            <div className="e-ic"><Icon name="receipt" /></div>
            <div className="e-t">Empieza a registrar</div>
            <div className="e-s">Agrega tu primer movimiento o carga datos de ejemplo.</div>
            <button className="btn-fill" onClick={() => openSheet({ kind: 'movement' })}>Agregar movimiento</button>
          </div>
        ) : rows.length === 0 ? (
          <div className="empty"><div className="e-ic"><Icon name="search" /></div><div className="e-s" style={{ margin: 0 }}>Sin resultados.</div></div>
        ) : rows.map((r) => {
          if (r.kind === 'transfer') {
            const dt = parseD(r.out.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
            return (
              <div className="row" key={r.id}>
                <IconSquare name="transfer" color={cssVar('--s1')} />
                <div className="r-main"><div className="r-title">Transferencia</div><div className="r-sub">{accName(data, r.out.accountId)} → {accName(data, r.inMov.accountId)} · {dt}</div></div>
                <div className="r-trail">
                  <span className="r-amt tnum" style={{ color: 'var(--label-2)' }}><Money value={r.out.amount} decimals /></span>
                  <button className="del" aria-label="Eliminar transferencia" onClick={() => delTransfer(r.id)}><Icon name="close" /></button>
                </div>
              </div>
            )
          }
          const m = r.m
          const col = m.type === 'in' ? cssVar('--green') : cssVar('--tint')
          const dt = parseD(m.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
          const rec = m.recurringId ? ' · ↻' : ''
          const sub = (m.note ? m.note + ' · ' : '') + dt + ' · ' + accName(data, m.accountId) + rec
          return (
            <div className="row tappable" key={m.id} onClick={() => openSheet({ kind: 'movement', id: m.id })}>
              <IconSquare name={iconFor(m.category, m.type, data.cats)} color={col} />
              <div className="r-main"><div className="r-title">{m.category}</div><div className="r-sub">{sub}</div></div>
              <div className="r-trail">
                <span className={`r-amt ${m.type === 'in' ? 'in' : ''} tnum`}>{m.type === 'in' ? '+' : '−'}<Money value={m.amount} decimals /></span>
                <button className="del" aria-label={`Eliminar ${m.category} de ${money(m.amount, true)}`} onClick={(e) => { e.stopPropagation(); delMov(m.id) }}><Icon name="close" /></button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
