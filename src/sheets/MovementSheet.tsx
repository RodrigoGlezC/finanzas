import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import { parseD, startOfToday, ymd } from '../lib/format'
import { uid } from '../lib/storage'
import type { MovType } from '../types'

export default function MovementSheet({ id }: { id?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const setAnchorFromDate = useStore((s) => s.setAnchorFromDate)
  const showToast = useStore((s) => s.showToast)

  const editing = id ? data.movements.find((m) => m.id === id) : undefined
  const [type, setType] = useState<MovType>(editing?.type || 'out')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [category, setCategory] = useState(editing?.category || '')
  const [accountId, setAccountId] = useState(editing?.accountId || data.accounts[0].id)
  const [date, setDate] = useState(editing?.date || ymd(startOfToday()))
  const [note, setNote] = useState(editing?.note || '')

  const cats = data.cats.filter((c) => (type === 'in' ? c.group === 'Ingresos' : c.group !== 'Ingresos'))
  const catValue = cats.some((c) => c.name === category) ? category : (cats[0]?.name || '')

  function save() {
    const amt = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!(amt > 0)) { showToast('Ingresa un monto válido'); return }
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

  return (
    <Sheet title={editing ? 'Editar' : 'Nuevo'} onClose={closeSheet} onSave={save}>
      <div className="amount-hero">
        <span className="cur">$</span>
        <input type="text" inputMode="decimal" placeholder="0" autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
          onKeyDown={(e) => { if (e.key === 'Enter') save() }} />
      </div>
      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={type === 'out' ? 'on' : ''} onClick={() => setType('out')}>Gasto</button>
        <button className={type === 'in' ? 'on' : ''} onClick={() => setType('in')}>Ingreso</button>
      </div>
      <div className="group">
        <div className="frow"><label>Categoría</label><div className="fctrl">
          <select value={catValue} onChange={(e) => setCategory(e.target.value)}>
            {cats.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select></div></div>
        <div className="frow"><label>Cuenta</label><div className="fctrl">
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></div></div>
        <div className="frow"><label>Fecha</label><div className="fctrl"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
        <div className="frow"><label>Nota</label><div className="fctrl"><input type="text" placeholder="Opcional" value={note} onChange={(e) => setNote(e.target.value)} /></div></div>
      </div>
    </Sheet>
  )
}
