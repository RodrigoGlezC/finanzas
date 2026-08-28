import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import { uid } from '../lib/storage'
import type { AccountType } from '../types'

export default function AccountSheet({ id }: { id?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const openSheet = useStore((s) => s.openSheet)
  const showToast = useStore((s) => s.showToast)
  const askConfirm = useStore((s) => s.askConfirm)

  const editing = id ? data.accounts.find((a) => a.id === id) : undefined
  const [name, setName] = useState(editing?.name || '')
  const [type, setType] = useState<AccountType>(editing?.type || 'efectivo')
  const [opening, setOpening] = useState(editing ? String(editing.opening) : '')

  function save() {
    if (!name.trim()) { showToast('Escribe un nombre'); return }
    const op = parseFloat(opening) || 0
    commit((st) => {
      if (editing) {
        const a = st.accounts.find((x) => x.id === id)
        if (a) { a.name = name.trim(); a.type = type; a.opening = op }
      } else {
        st.accounts.push({ id: uid('acc_'), name: name.trim(), type, opening: op })
      }
    })
    showToast('Cuenta guardada')
    closeSheet()
  }

  async function del() {
    if (!editing) return
    if (data.accounts.length <= 1) { showToast('Debe existir al menos una cuenta'); return }
    const count = data.movements.filter((m) => m.accountId === editing.id).length + data.recurring.filter((r) => r.accountId === editing.id).length
    if (count === 0) {
      const ok = await askConfirm({ title: 'Eliminar cuenta', message: `¿Eliminar "${editing.name}"?`, confirmLabel: 'Eliminar', danger: true })
      if (ok) {
        commit((st) => { st.accounts = st.accounts.filter((a) => a.id !== editing.id) })
        showToast('Cuenta eliminada'); closeSheet()
      }
      return
    }
    openSheet({ kind: 'reassignAccount', id: editing.id })
  }

  return (
    <Sheet title={editing ? 'Editar cuenta' : 'Nueva cuenta'} onClose={closeSheet} onSave={save}>
      <div className="group">
        <div className="frow"><label>Nombre</label><div className="fctrl"><input type="text" placeholder="Ej. BBVA" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
        <div className="frow"><label>Tipo</label><div className="fctrl">
          <select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="banco">Banco</option>
            <option value="otros">Otros</option>
          </select></div></div>
        <div className="frow"><label>Saldo inicial</label><div className="fctrl"><input type="number" inputMode="decimal" placeholder="0" value={opening} onChange={(e) => setOpening(e.target.value)} /></div></div>
      </div>
      {editing && <button className="btn-soft" style={{ width: '100%', color: 'var(--red)' }} onClick={del}>Eliminar cuenta</button>}
    </Sheet>
  )
}
