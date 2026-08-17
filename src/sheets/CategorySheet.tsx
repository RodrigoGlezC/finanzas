import { useState } from 'react'
import { useStore } from '../store'
import Sheet from '../components/Sheet'

export default function CategorySheet() {
  const data = useStore((s) => s.data)
  const commit = useStore((s) => s.commit)
  const closeSheet = useStore((s) => s.closeSheet)
  const showToast = useStore((s) => s.showToast)

  const [name, setName] = useState('')
  const [group, setGroup] = useState(data.groups[0])

  function save() {
    const n = name.trim()
    if (!n) { showToast('Escribe un nombre'); return }
    if (data.cats.some((c) => c.name.toLowerCase() === n.toLowerCase())) { showToast('Ya existe'); return }
    commit((st) => { st.cats.push({ name: n, group }) })
    showToast('Categoría añadida'); closeSheet()
  }

  return (
    <Sheet title="Nueva categoría" onClose={closeSheet} onSave={save}>
      <div className="group">
        <div className="frow"><label>Nombre</label><div className="fctrl"><input type="text" placeholder="Ej. Mascotas" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div></div>
        <div className="frow"><label>Grupo</label><div className="fctrl">
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {data.groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select></div></div>
      </div>
    </Sheet>
  )
}
