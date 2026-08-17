import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import { uid } from '../lib/storage'
import { seriesColor } from '../lib/format'

export default function GoalSheet({ id }: { id?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const showToast = useStore((s) => s.showToast)

  const editing = id ? data.goals.find((g) => g.id === id) : undefined
  const [name, setName] = useState(editing?.name || '')
  const [target, setTarget] = useState(editing ? String(editing.target) : '')
  const [initial, setInitial] = useState(editing ? String(editing.initial || 0) : '')

  function save() {
    if (!name.trim()) { showToast('Escribe un nombre'); return }
    const t = parseFloat(target) || 0
    const ini = parseFloat(initial) || 0
    if (t <= 0) { showToast('Ingresa una meta válida'); return }
    commit((st) => {
      if (editing) {
        const g = st.goals.find((x) => x.id === id)
        if (g) { g.name = name.trim(); g.target = t; g.initial = ini }
      } else {
        st.goals.push({ id: uid('g_'), name: name.trim(), target: t, initial: ini, color: seriesColor(st.goals.length), _c: Date.now() })
      }
    })
    showToast('Meta guardada'); closeSheet()
  }
  function del() {
    if (!editing) return
    if (confirm('¿Eliminar esta meta? Los aportes ya registrados se conservan como movimientos de ahorro.')) {
      commit((st) => {
        st.movements.forEach((m) => { if (m.goalId === editing.id) delete m.goalId })
        st.goals = st.goals.filter((g) => g.id !== editing.id)
      })
      closeSheet()
    }
  }

  return (
    <Sheet title={editing ? 'Editar meta' : 'Nueva meta'} onClose={closeSheet} onSave={save}>
      <div className="group">
        <div className="frow"><label>Nombre</label><div className="fctrl"><input type="text" placeholder="Fondo de emergencia" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
        <div className="frow"><label>Meta ($)</label><div className="fctrl"><input type="number" inputMode="decimal" placeholder="20000" value={target} onChange={(e) => setTarget(e.target.value)} /></div></div>
        <div className="frow"><label>Ya ahorrado</label><div className="fctrl"><input type="number" inputMode="decimal" placeholder="0" value={initial} onChange={(e) => setInitial(e.target.value)} /></div></div>
      </div>
      <div className="hint" style={{ padding: '0 4px 12px' }}>"Ya ahorrado" es lo que tenías antes de registrar aportes. Cada aporte se suma sobre esto automáticamente.</div>
      {editing && <button className="btn-soft" style={{ width: '100%', color: 'var(--red)' }} onClick={del}>Eliminar meta</button>}
    </Sheet>
  )
}
