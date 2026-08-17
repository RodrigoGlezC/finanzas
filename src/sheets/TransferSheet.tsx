import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import Keypad, { applyKey } from '../components/Keypad'
import { startOfToday, ymd } from '../lib/format'
import { uid } from '../lib/storage'

export default function TransferSheet() {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const showToast = useStore((s) => s.showToast)

  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState(data.accounts[0]?.id || '')
  const [to, setTo] = useState(data.accounts[1]?.id || data.accounts[0]?.id || '')
  const [date, setDate] = useState(ymd(startOfToday()))

  if (data.accounts.length < 2) {
    return (
      <Sheet title="Transferencia" onClose={closeSheet}>
        <div className="hint" style={{ padding: '12px 4px' }}>Necesitas al menos dos cuentas para transferir. Crea otra cuenta primero.</div>
      </Sheet>
    )
  }

  function save() {
    const amt = parseFloat(amount || '0')
    if (!(amt > 0)) { showToast('Ingresa un monto'); return }
    if (from === to) { showToast('Elige cuentas distintas'); return }
    const tid = uid('t_')
    const note = 'Transferencia'
    commit((st) => {
      st.movements.push(
        { id: uid('m_'), type: 'out', amount: amt, category: 'Transferencia', date, note, accountId: from, transfer: true, transferId: tid, _c: Date.now() },
        { id: uid('m_'), type: 'in', amount: amt, category: 'Transferencia', date, note, accountId: to, transfer: true, transferId: tid, _c: Date.now() + 1 },
      )
    })
    showToast('Transferencia registrada ✓')
    closeSheet()
  }

  return (
    <Sheet title="Transferencia" onClose={closeSheet} onSave={save}>
      <div className="amount-hero">
        <span className="cur">$</span>
        <span style={{ fontSize: 50, fontWeight: 700, letterSpacing: '-.03em', color: amount ? 'var(--label)' : 'var(--label-3)' }}>{amount || '0'}</span>
      </div>
      <div className="group">
        <div className="frow"><label>De</label><div className="fctrl">
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></div></div>
        <div className="frow"><label>A</label><div className="fctrl">
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></div></div>
        <div className="frow"><label>Fecha</label><div className="fctrl"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
      </div>
      <Keypad onKey={(k) => setAmount((a) => applyKey(a, k))} />
    </Sheet>
  )
}
