import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'

type Target = { kind: 'reassignAccount'; id: string } | { kind: 'reassignCategory'; name: string }

export default function ReassignSheet({ target }: { target: Target }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const showToast = useStore((s) => s.showToast)

  const isAccount = target.kind === 'reassignAccount'

  const options = isAccount
    ? data.accounts.filter((a) => a.id !== target.id).map((a) => ({ value: a.id, label: a.name }))
    : (() => {
      const cat = data.cats.find((c) => c.name === target.name)
      const isIn = cat?.group === 'Ingresos'
      return data.cats
        .filter((c) => c.name !== target.name && (c.group === 'Ingresos') === isIn)
        .map((c) => ({ value: c.name, label: c.name }))
    })()

  const count = isAccount
    ? data.movements.filter((m) => m.accountId === target.id).length + data.recurring.filter((r) => r.accountId === target.id).length
    : data.movements.filter((m) => m.category === target.name).length + data.recurring.filter((r) => r.category === target.name).length

  const [dest, setDest] = useState(options[0]?.value || '')

  function save() {
    if (!dest) { showToast('No hay destino disponible'); return }
    commit((st) => {
      if (isAccount) {
        st.movements.forEach((m) => { if (m.accountId === target.id) m.accountId = dest })
        st.recurring.forEach((r) => { if (r.accountId === target.id) r.accountId = dest })
        st.accounts = st.accounts.filter((a) => a.id !== target.id)
      } else {
        const name = target.name
        st.movements.forEach((m) => { if (m.category === name) m.category = dest })
        st.recurring.forEach((r) => { if (r.category === name) r.category = dest })
        if (st.budgets[name]) { if (!st.budgets[dest]) st.budgets[dest] = st.budgets[name]; delete st.budgets[name] }
        st.cats = st.cats.filter((c) => c.name !== name)
      }
    })
    showToast(isAccount ? 'Cuenta eliminada · movimientos reasignados' : 'Categoría eliminada · movimientos reasignados')
    closeSheet()
  }

  const title = isAccount ? 'Eliminar cuenta' : 'Eliminar categoría'
  const label = isAccount ? '' : `"${target.name}" `

  return (
    <Sheet title={title} onClose={closeSheet} onSave={options.length ? save : undefined} saveLabel="Eliminar">
      {options.length === 0 ? (
        <div className="hint" style={{ padding: '8px 4px 14px' }}>
          No hay otra {isAccount ? 'cuenta' : 'categoría del mismo tipo'} para reasignar. Crea una primero.
        </div>
      ) : (
        <>
          <div className="hint" style={{ padding: '8px 4px 14px' }}>
            {label}tiene {count} elemento(s) asociados. Muévelos a otr{isAccount ? 'a cuenta' : 'a categoría'} antes de eliminarl{isAccount ? 'a' : 'a'}.
          </div>
          <div className="group"><div className="frow"><label>Mover a</label><div className="fctrl">
            <select value={dest} onChange={(e) => setDest(e.target.value)}>
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select></div></div></div>
        </>
      )}
    </Sheet>
  )
}
