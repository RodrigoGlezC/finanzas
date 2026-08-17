import { useStore } from '../store'
import { migrate, setLastBackup, uid } from './storage'
import { getPeriod } from './period'
import { catGroup, accName } from './calc'
import { monthKey } from './format'
import type { AppState } from '../types'

function download(blob: Blob, name: string) {
  const u = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = u; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(u), 500)
}

export function exportJson() {
  const data = useStore.getState().data
  download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'finanzas-respaldo.json')
  setLastBackup()
  useStore.getState().signalBackup() // fuerza re-render del banner
  useStore.getState().showToast('Respaldo descargado ✓')
}

export function exportCsv() {
  const { data, anchor, periodMode } = useStore.getState()
  const P = getPeriod(new Date(anchor), periodMode)
  const movs = data.movements.filter((m) => P.inRange(m.date)).sort((a, b) => a.date.localeCompare(b.date))
  if (!movs.length) { useStore.getState().showToast('No hay movimientos en este periodo'); return }
  let csv = 'Fecha,Tipo,Categoria,Grupo,Cuenta,Monto,Nota\n'
  movs.forEach((m) => {
    csv += [m.date, m.type === 'in' ? 'Ingreso' : 'Gasto', m.category, catGroup(data, m.category), accName(data, m.accountId), m.amount, m.note || '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n'
  })
  download(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), 'finanzas-' + monthKey(new Date(anchor)) + '.csv')
  useStore.getState().showToast('CSV descargado')
}

export function importJson(file: File) {
  const rd = new FileReader()
  rd.onload = (e) => {
    try {
      const d = JSON.parse(String(e.target?.result))
      if (!d.movements) throw new Error('bad')
      if (confirm('Esto reemplazará tus datos actuales. ¿Continuar?')) {
        const migrated = migrate(d)
        migrated.updatedAt = Date.now()
        useStore.getState().replaceData(migrated)
        // empuja a la nube
        useStore.getState().commit(() => { /* no-op, sólo dispara push */ })
        useStore.getState().showToast('Respaldo importado ✓')
      }
    } catch {
      useStore.getState().showToast('Archivo no válido')
    }
  }
  rd.readAsText(file)
}

export function loadExample() {
  const { data, anchor, commit } = useStore.getState()
  if (data.movements.length && !confirm('Se agregarán movimientos de ejemplo del mes actual. ¿Continuar?')) return
  const a = new Date(anchor)
  const y = a.getFullYear(), m = a.getMonth()
  const acc = data.accounts[0].id
  const d = (day: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const ex: [string, string, number, number, string][] = [
    ['in', 'Sueldo', 3021, 1, 'Quincena'], ['in', 'Sueldo', 3123, 15, 'Quincena'],
    ['out', 'Renta', 875, 1, ''], ['out', 'Despensa', 600, 3, 'Súper'], ['out', 'Despensa', 640, 10, 'Súper'],
    ['out', 'Transporte', 250, 5, ''], ['out', 'Lavandería', 75, 6, ''], ['out', 'Celular', 181, 8, ''],
    ['out', 'Recargas', 50, 8, ''], ['out', 'Spotify', 23, 1, ''], ['out', 'iCloud', 4, 25, ''],
    ['out', 'Claude', 87, 26, ''], ['out', 'Compras Personales', 200, 12, 'Ropa'],
    ['out', 'Ahorro', 150, 15, ''], ['out', 'Ahorro Personal', 200, 15, ''],
  ]
  commit((st: AppState) => {
    ex.forEach((r, i) => st.movements.push({
      id: uid('m_'), type: r[0] as 'in' | 'out', category: r[1], amount: r[2],
      date: d(r[3]), note: r[4], accountId: acc, _c: Date.now() + i,
    }))
  }, { toast: 'Ejemplo cargado ✨' })
}

export function clearAll() {
  if (!confirm('¿Borrar TODOS tus datos?\n\nTip: exporta un respaldo antes.')) return
  const { commit } = useStore.getState()
  commit((st: AppState) => {
    st.movements = []
    st.budgets = {}
    st.goals = []
    st.recurring = []
  }, { toast: 'Todo borrado' })
}
