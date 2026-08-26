import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import { startOfToday, ymd } from '../lib/format'
import { uid } from '../lib/storage'

export default function AporteSheet({ goalId }: { goalId: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const showToast = useStore((s) => s.showToast)

  const goal = data.goals.find((g) => g.id === goalId)
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState(data.accounts[0].id)
  const [date, setDate] = useState(ymd(startOfToday()))

  if (!goal) { closeSheet(); return null }

  function save() {
    const amt = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!(amt > 0)) { showToast('Monto inválido'); return }
    // Categoría donde se registra el aporte: reutiliza "Ahorro" o la primera del grupo Ahorros.
    // Si el usuario no tiene ninguna (arranca sin categorías), se crea una para no dejar el movimiento huérfano.
    const existing = data.cats.find((c) => c.name === 'Ahorro') || data.cats.find((c) => c.group === 'Ahorros')
    const cat = existing?.name || 'Ahorro'
    commit((st) => {
      if (!st.cats.some((c) => c.name === cat)) {
        if (!st.groups.includes('Ahorros')) st.groups.splice(Math.max(0, st.groups.length - 1), 0, 'Ahorros')
        st.cats.push({ name: cat, group: 'Ahorros', icon: '🐷' })
      }
      st.movements.push({ id: uid('m_'), type: 'out', amount: amt, category: cat, date, note: 'Meta: ' + goal!.name, accountId, goalId: goal!.id, _c: Date.now() })
    })
    showToast('Aporte registrado ✓'); closeSheet()
  }

  return (
    <Sheet title={'Aporte a ' + goal.name} onClose={closeSheet} onSave={save}>
      <div className="amount-hero">
        <span className="cur">$</span>
        <input type="text" inputMode="decimal" placeholder="0" autoFocus
          value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))} />
      </div>
      <div className="group">
        <div className="frow"><label>Desde cuenta</label><div className="fctrl">
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select></div></div>
        <div className="frow"><label>Fecha</label><div className="fctrl"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
      </div>
      <div className="hint" style={{ padding: '0 4px 10px' }}>Se registra como gasto de ahorro y suma a tu meta. Si borras el movimiento, tu meta se ajusta sola.</div>
    </Sheet>
  )
}
