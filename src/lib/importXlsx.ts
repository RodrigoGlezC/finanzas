import { useStore } from '../store'
import { uid } from './storage'
import { startOfToday, ymd } from './format'
import { buildPlan, type Grid, type ImportPlan } from './importXlsxParse'
import type { AccountType, AppState } from '../types'

/**
 * Importa la hoja "GASTOS SEMANALES" (control semanal + calendario de pagos) al modelo de
 * la app: categorías (grupo canónico) + recurrentes. Es ADITIVO (no borra nada) y arranca
 * los recurrentes desde HOY (no backfillea). El parseo puro vive en importXlsxParse.ts.
 * XLSX (SheetJS) se carga de forma diferida para no engordar el bundle inicial.
 */

/** Aplica el plan al store (aditivo). Crea cuenta destino si no hay ninguna; evita duplicar recurrentes. */
function applyPlan(plan: ImportPlan) {
  const since = ymd(startOfToday())
  useStore.getState().commit((st: AppState) => {
    let accId = st.accounts[0]?.id
    if (!accId) {
      const a = { id: uid('a_'), name: 'Efectivo', type: 'efectivo' as AccountType, opening: 0 }
      st.accounts.push(a); accId = a.id
    }
    plan.cats.forEach((c) => {
      if (st.cats.some((x) => x.name === c.name)) return
      if (!st.groups.includes(c.group)) st.groups.splice(Math.max(0, st.groups.length - 1), 0, c.group)
      st.cats.push({ name: c.name, group: c.group, icon: c.icon })
    })
    plan.recs.forEach((r) => {
      if (st.recurring.some((x) => x.category === r.category && x.freq === r.freq && x.type === r.type)) return
      st.recurring.push({ id: uid('r_'), active: true, skip: [], type: r.type, amount: r.amount, category: r.category, accountId: accId!, freq: r.freq, day: r.day, since, note: 'Importado de Excel' })
    })
  })
  useStore.getState().materializeNow()
}

/** Punto de entrada desde la UI: lee el archivo, muestra un resumen y aplica si el usuario confirma. */
export async function importXlsx(file: File) {
  const store = useStore.getState()
  try {
    const XLSX = await import('xlsx')
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const grids: Grid[] = wb.SheetNames.map((n) =>
      XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, blankrows: false, defval: null }) as Grid)
    const plan = buildPlan(grids)
    if (!plan.recs.length) { store.showToast('No se reconocieron datos en el Excel'); return }

    const monthly = plan.recs.filter((r) => r.freq === 'mensual' && r.type === 'out').length
    const weekly = plan.recs.filter((r) => r.freq === 'semanal' && r.type === 'out').length
    const income = plan.recs.filter((r) => r.type === 'in').length
    const existing = new Set(store.data.cats.map((c) => c.name))
    const newCats = plan.cats.filter((c) => !existing.has(c.name)).length

    const lines = [
      `${newCats} categoría(s) nueva(s)`,
      `${monthly} recurrente(s) mensual(es)`,
      `${weekly} recurrente(s) semanal(es)`,
    ]
    if (income) lines.push(`1 ingreso (Sueldo${plan.incomeVaries ? ', revisa el monto: varía por semana' : ''})`)

    const ok = await store.askConfirm({
      title: 'Importar desde Excel',
      message: `Se agregarán a tus datos:\n\n• ${lines.join('\n• ')}\n\nArrancan desde hoy y NO se borra nada de lo que ya tienes.`,
      confirmLabel: 'Importar',
    })
    if (!ok) return
    applyPlan(plan)
    store.showToast('Importado desde Excel ✓')
  } catch (e) {
    console.warn('importXlsx', e)
    store.showToast('No se pudo leer el archivo')
  }
}
