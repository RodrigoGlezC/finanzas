import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'
import { CATEGORY_ICONS } from '../lib/constants'

export default function CategorySheet({ name }: { name?: string }) {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const openSheet = useStore((s) => s.openSheet)
  const showToast = useStore((s) => s.showToast)
  const askConfirm = useStore((s) => s.askConfirm)

  const editing = name ? data.cats.find((c) => c.name === name) : undefined
  const [catName, setCatName] = useState(editing?.name || '')
  const [group, setGroup] = useState(editing?.group || data.groups.find((g) => g !== 'Ingresos') || data.groups[0] || '')
  const [icon, setIcon] = useState(editing?.icon || '')

  function save() {
    const n = catName.trim()
    const g = group.trim() || 'Otros'
    if (!n) { showToast('Escribe un nombre'); return }
    const dup = data.cats.find((c) => c.name.toLowerCase() === n.toLowerCase())
    if (dup && (!editing || dup.name !== editing.name)) { showToast('Ya existe una categoría con ese nombre'); return }

    commit((st) => {
      if (!st.groups.includes(g)) st.groups.splice(Math.max(0, st.groups.length - 1), 0, g) // antes de "Otros"
      if (editing) {
        const c = st.cats.find((x) => x.name === editing.name)
        if (c) {
          const old = c.name
          c.name = n; c.group = g; c.icon = icon || undefined
          if (old !== n) {
            st.movements.forEach((m) => { if (m.category === old) m.category = n })
            st.recurring.forEach((r) => { if (r.category === old) r.category = n })
            if (st.budgets[old] !== undefined) { st.budgets[n] = st.budgets[old]; delete st.budgets[old] }
          }
        }
      } else {
        st.cats.push({ name: n, group: g, icon: icon || undefined })
      }
    })
    showToast(editing ? 'Categoría actualizada' : 'Categoría añadida')
    closeSheet()
  }

  async function del() {
    if (!editing) return
    const count = data.movements.filter((m) => m.category === editing.name).length + data.recurring.filter((r) => r.category === editing.name).length
    if (count === 0) {
      const ok = await askConfirm({ title: 'Eliminar categoría', message: `¿Eliminar "${editing.name}"?`, confirmLabel: 'Eliminar', danger: true })
      if (ok) {
        commit((st) => { if (st.budgets[editing.name]) delete st.budgets[editing.name]; st.cats = st.cats.filter((c) => c.name !== editing.name) })
        showToast('Categoría eliminada'); closeSheet()
      }
      return
    }
    openSheet({ kind: 'reassignCategory', name: editing.name })
  }

  return (
    <Sheet title={editing ? 'Editar categoría' : 'Nueva categoría'} onClose={closeSheet} onSave={save}>
      <div className="group">
        <div className="frow"><label>Nombre</label><div className="fctrl"><input type="text" placeholder="Ej. Mascotas" value={catName} onChange={(e) => setCatName(e.target.value)} autoFocus /></div></div>
        <div className="frow"><label>Grupo</label><div className="fctrl">
          <input type="text" list="groups-list" placeholder="Elige o crea uno" value={group} onChange={(e) => setGroup(e.target.value)} />
          <datalist id="groups-list">
            {data.groups.map((g) => <option key={g} value={g} />)}
          </datalist>
        </div></div>
      </div>
      <div className="glabel" style={{ margin: '0 6px 8px' }}>Ícono</div>
      <div className="iconpick">
        <button type="button" className={`iconopt ${!icon ? 'on' : ''}`} onClick={() => setIcon('')} title="Sin ícono">∅</button>
        {CATEGORY_ICONS.map((ic) => (
          <button key={ic} type="button" className={`iconopt ${icon === ic ? 'on' : ''}`} onClick={() => setIcon(ic)}>{ic}</button>
        ))}
      </div>
      {editing && <button className="btn-soft" style={{ width: '100%', color: 'var(--red)', marginTop: 14 }} onClick={del}>Eliminar categoría</button>}
    </Sheet>
  )
}
