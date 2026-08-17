import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'

export default function BudgetSheet({ cat }: { cat?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const showToast = useStore((s) => s.showToast)

  const outCats = data.cats.filter((c) => c.group !== 'Ingresos')
  const [category, setCategory] = useState(cat || outCats[0]?.name || '')
  const [limit, setLimit] = useState(cat ? String(data.budgets[cat] || '') : '')

  function save() {
    const lim = parseFloat(limit) || 0
    if (lim <= 0) { showToast('Ingresa un límite válido'); return }
    commit((st) => { st.budgets[category] = lim })
    showToast('Presupuesto guardado'); closeSheet()
  }
  function remove() {
    if (!cat) return
    commit((st) => { delete st.budgets[cat] })
    showToast('Presupuesto quitado'); closeSheet()
  }

  return (
    <Sheet title={cat ? 'Editar presupuesto' : 'Nuevo presupuesto'} onClose={closeSheet} onSave={save}>
      <div className="group">
        <div className="frow"><label>Categoría</label><div className="fctrl">
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!!cat}>
            {outCats.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select></div></div>
        <div className="frow"><label>Límite mensual</label><div className="fctrl"><input type="number" inputMode="decimal" placeholder="0" value={limit} onChange={(e) => setLimit(e.target.value)} autoFocus /></div></div>
      </div>
      <div className="hint" style={{ padding: '0 4px 12px' }}>Te avisaremos al llegar al 80% y al pasarte del límite.</div>
      {cat && <button className="btn-soft" style={{ width: '100%', color: 'var(--red)' }} onClick={remove}>Quitar presupuesto</button>}
    </Sheet>
  )
}
