import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import Keypad, { applyKey } from '../components/Keypad'
import { iconFor } from '../lib/constants'
import { lastAccountId, lastCategoryFor } from '../lib/calc'
import { parseD, startOfToday, ymd } from '../lib/format'
import { uid } from '../lib/storage'
import type { MovType } from '../types'

export default function MovementSheet({ id }: { id?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const openSheet = useStore((s) => s.openSheet)
  const setAnchorFromDate = useStore((s) => s.setAnchorFromDate)
  const showToast = useStore((s) => s.showToast)

  const editing = id ? data.movements.find((m) => m.id === id) : undefined
  const [type, setType] = useState<MovType>(editing?.type || 'out')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [category, setCategory] = useState(editing?.category || lastCategoryFor(data, editing?.type || 'out'))
  const [accountId, setAccountId] = useState(editing?.accountId || lastAccountId(data))
  const [date, setDate] = useState(editing?.date || ymd(startOfToday()))
  const [note, setNote] = useState(editing?.note || '')

  const cats = data.cats.filter((c) => (type === 'in' ? c.group === 'Ingresos' : c.group !== 'Ingresos'))
  const catValue = cats.some((c) => c.name === category) ? category : (cats[0]?.name || '')

  function switchType(t: MovType) {
    setType(t)
    const nc = data.cats.filter((c) => (t === 'in' ? c.group === 'Ingresos' : c.group !== 'Ingresos'))
    if (!nc.some((c) => c.name === category)) setCategory(lastCategoryFor(data, t) || nc[0]?.name || '')
  }

  function save() {
    const amt = parseFloat(amount || '0')
    if (!(amt > 0)) { showToast('Ingresa un monto'); return }
    if (!catValue) { showToast('Selecciona una categoría'); return }
    commit((st) => {
      if (editing) {
        const m = st.movements.find((x) => x.id === id)
        if (m) { m.amount = amt; m.category = catValue; m.date = date; m.note = note.trim(); m.type = type; m.accountId = accountId }
      } else {
        st.movements.push({ id: uid('m_'), type, amount: amt, category: catValue, date, note: note.trim(), accountId, _c: Date.now() })
      }
    })
    showToast(editing ? 'Actualizado' : 'Agregado ✓')
    setAnchorFromDate(parseD(date))
    closeSheet()
  }

  const isToday = date === ymd(startOfToday())

  return (
    <Sheet title={editing ? 'Editar' : 'Nuevo'} onClose={closeSheet} onSave={save}>
      <div className="amount-hero">
        <span className="cur">$</span>
        <span style={{ fontSize: 50, fontWeight: 700, letterSpacing: '-.03em', color: amount ? 'var(--label)' : 'var(--label-3)' }}>
          {amount || '0'}
        </span>
      </div>
      <div className="seg" style={{ marginBottom: 16 }}>
        <button className={type === 'out' ? 'on' : ''} onClick={() => switchType('out')}>Gasto</button>
        <button className={type === 'in' ? 'on' : ''} onClick={() => switchType('in')}>Ingreso</button>
      </div>

      {cats.length === 0 ? (
        <div className="empty" style={{ padding: '18px 12px', marginBottom: 12 }}>
          <div className="e-s" style={{ marginBottom: 12 }}>Aún no tienes categorías. Crea la primera para empezar a registrar.</div>
          <button className="btn-fill" onClick={() => openSheet({ kind: 'category' })}>+ Nueva categoría</button>
        </div>
      ) : (
        <div className="catchips">
          {cats.map((c) => (
            <button key={c.name} className={`catchip ${catValue === c.name ? 'on' : ''}`} onClick={() => setCategory(c.name)}>
              <span className="ci">{iconFor(c.name, type, data.cats)}</span>{c.name}
            </button>
          ))}
        </div>
      )}

      <div className="accchips">
        {data.accounts.map((a) => (
          <button key={a.id} className={`catchip ${accountId === a.id ? 'on' : ''}`} onClick={() => setAccountId(a.id)}>{a.name}</button>
        ))}
      </div>

      <div className="group">
        <div className="frow"><label>Fecha</label><div className="fctrl">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {!isToday && <button className="pill-btn soft" style={{ marginLeft: 8 }} onClick={() => setDate(ymd(startOfToday()))}>Hoy</button>}
        </div></div>
        <div className="frow"><label>Nota</label><div className="fctrl"><input type="text" placeholder="Opcional" value={note} onChange={(e) => setNote(e.target.value)} /></div></div>
      </div>

      <Keypad onKey={(k) => setAmount((a) => applyKey(a, k))} />
    </Sheet>
  )
}
