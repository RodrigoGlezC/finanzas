import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import { startOfToday, cap, ymd } from '../lib/format'
import { WEEKDAYS } from '../lib/constants'
import { uid } from '../lib/storage'
import type { Freq, MovType } from '../types'

export default function RecurringSheet({ id }: { id?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const materializeNow = useStore((s) => s.materializeNow)
  const showToast = useStore((s) => s.showToast)
  const askConfirm = useStore((s) => s.askConfirm)

  const editing = id ? data.recurring.find((r) => r.id === id) : undefined
  const [type, setType] = useState<MovType>(editing?.type || 'out')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [category, setCategory] = useState(editing?.category || '')
  const [accountId, setAccountId] = useState(editing?.accountId || data.accounts[0].id)
  const [freq, setFreq] = useState<Freq>(editing?.freq || 'mensual')
  const [day, setDay] = useState<number>(editing?.day || 1)
  const [since, setSince] = useState(editing?.since || ymd(startOfToday()))
  const [note, setNote] = useState(editing?.note || '')

  const cats = data.cats.filter((c) => (type === 'in' ? c.group === 'Ingresos' : c.group !== 'Ingresos'))
  const catValue = cats.some((c) => c.name === category) ? category : (cats[0]?.name || '')
  const maxDay = freq === 'mensual' ? 31 : 7

  function save() {
    const amt = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!(amt > 0)) { showToast('Monto inválido'); return }
    const d = Math.min(day, maxDay)
    commit((st) => {
      if (editing) {
        const r = st.recurring.find((x) => x.id === id)
        if (r) Object.assign(r, { type, amount: amt, category: catValue, accountId, freq, day: d, since, note: note.trim() })
      } else {
        st.recurring.push({ id: uid('r_'), active: true, skip: [], type, amount: amt, category: catValue, accountId, freq, day: d, since, note: note.trim() })
      }
    })
    materializeNow()
    showToast('Recurrente guardado'); closeSheet()
  }
  function toggle() {
    if (!editing) return
    commit((st) => { const r = st.recurring.find((x) => x.id === id); if (r) r.active = r.active === false })
    showToast(editing.active === false ? 'Reactivado' : 'Pausado'); closeSheet()
  }
  async function del() {
    if (!editing) return
    const ok = await askConfirm({ title: 'Eliminar recurrente', message: 'Los movimientos ya generados se conservan.', confirmLabel: 'Eliminar', danger: true })
    if (!ok) return
    commit((st) => { st.recurring = st.recurring.filter((r) => r.id !== id) })
    closeSheet()
  }

  return (
    <Sheet title={editing ? 'Editar recurrente' : 'Nuevo recurrente'} onClose={closeSheet} onSave={save}>
      <div className="amount-hero">
        <span className="cur">$</span>
        <input type="text" inputMode="decimal" placeholder="0" value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))} />
      </div>
      <div className="seg" style={{ marginBottom: 16 }}>
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
        <div className="frow"><label>Frecuencia</label><div className="fctrl">
          <select value={freq} onChange={(e) => { setFreq(e.target.value as Freq); setDay(1) }}>
            <option value="mensual">Mensual</option>
            <option value="semanal">Semanal</option>
          </select></div></div>
        <div className="frow"><label>{freq === 'mensual' ? 'Día del mes' : 'Día de semana'}</label><div className="fctrl">
          <select value={day} onChange={(e) => setDay(+e.target.value)}>
            {freq === 'mensual'
              ? Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)
              : WEEKDAYS.map((d, i) => <option key={i + 1} value={i + 1}>{cap(d)}</option>)}
          </select></div></div>
        <div className="frow"><label>Desde</label><div className="fctrl"><input type="date" value={since} onChange={(e) => setSince(e.target.value)} /></div></div>
        <div className="frow"><label>Nota</label><div className="fctrl"><input type="text" placeholder="Opcional" value={note} onChange={(e) => setNote(e.target.value)} /></div></div>
      </div>
      {editing && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-soft" style={{ flex: 1 }} onClick={toggle}>{editing.active === false ? 'Reactivar' : 'Pausar'}</button>
          <button className="btn-soft" style={{ color: 'var(--red)' }} onClick={del}>Eliminar</button>
        </div>
      )}
    </Sheet>
  )
}
