import { DEFAULT_CATS, DEFAULT_GROUPS, ICONS } from './constants'

/**
 * Parseo PURO de la hoja "GASTOS SEMANALES" a un plan de importación (sin store ni XLSX,
 * para poder testearlo con Vitest). El glue con el archivo y el store vive en importXlsx.ts.
 *
 * Tolerante a la posición de los bloques: se ancla en los encabezados, no en coordenadas.
 *  - Bloques "CATEGORIA | TIPO | $"  → gastos semanales + SUELDO.
 *  - Filas "CATEGORIA | DIA DE PAGO | … | TOTAL A PAGAR" → pagos mensuales (con día).
 */

export type Grid = (string | number | null)[][]

const norm = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
const CANON = new Map(DEFAULT_CATS.map((c) => [norm(c.name), c]))
const GROUP_CANON = new Map(DEFAULT_GROUPS.map((g) => [norm(g), g]))
const num = (v: unknown): number => (typeof v === 'number' && isFinite(v) ? v : NaN)

export interface PlanCat { name: string; group: string; icon?: string }
export interface PlanRec { type: 'in' | 'out'; category: string; amount: number; freq: 'mensual' | 'semanal'; day: number }
export interface ImportPlan { cats: PlanCat[]; recs: PlanRec[]; incomeVaries: boolean }

/** Lleva un nombre del Excel al nombre/grupo/ícono oficial de la app (normaliza acentos y capitalización). */
function resolveCat(rawName: string, rawTipo?: string): PlanCat {
  const def = CANON.get(norm(rawName))
  if (def) return { name: def.name, group: def.group, icon: ICONS[def.name] }
  const name = rawName.trim()
  const group = (rawTipo && GROUP_CANON.get(norm(rawTipo))) || 'Otros'
  return { name, group, icon: ICONS[name] }
}

/** Bloques "CATEGORIA | TIPO | $" (control semanal). Items únicos + los montos de SUELDO. */
function parseWeekly(grid: Grid) {
  const items = new Map<string, { name: string; tipo: string; amount: number }>()
  const sueldos: number[] = []
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r] || []
    for (let c = 0; c < row.length; c++) {
      // Ancla: encabezado CATEGORIA con TIPO a su derecha (distingue de la hoja de calendario).
      if (norm(row[c]) !== 'categoria' || norm(grid[r]?.[c + 1]) !== 'tipo') continue
      for (let r2 = r + 1; r2 < grid.length; r2++) {
        const label = grid[r2]?.[c]
        const n = norm(label)
        if (label == null || n === '') break
        if (n === 'total' || n === 'ingresos extra') continue
        const amt = num(grid[r2]?.[c + 2])
        if (n === 'sueldo') { if (amt > 0) sueldos.push(amt); continue }
        if (n === 'sobrante') break // fin del bloque
        if (amt > 0 && !items.has(n)) {
          items.set(n, { name: String(label).trim(), tipo: String(grid[r2]?.[c + 1] ?? '').trim(), amount: amt })
        }
      }
    }
  }
  return { items: [...items.values()], sueldos }
}

/**
 * Filas "CATEGORIA | DIA DE PAGO | … | TOTAL A PAGAR" (calendario de pagos mensuales).
 * Anclado a la columna del encabezado "DIA DE PAGO" (no a un índice fijo): SheetJS indexa
 * desde el origen real de la hoja, así que la columna varía según dónde empiece la tabla.
 * Nombre = columna a la izquierda del día; total a pagar = último número de la fila.
 */
function parseMonthly(grid: Grid) {
  const out = new Map<string, { name: string; day: number; amount: number }>()
  let dcol = -1
  for (const row of grid) {
    const hdr = (row || []).findIndex((cell) => norm(cell) === 'dia de pago')
    if (hdr >= 0) { dcol = hdr; continue } // fila de encabezado: fija la columna de "día de pago"
    if (dcol < 1) continue
    const name = row?.[dcol - 1]
    const day = num(row?.[dcol])
    if (typeof name !== 'string' || norm(name) === 'categoria' || norm(name) === '' || !(day >= 1)) continue
    let total = NaN // el total a pagar es el último número de la fila
    for (let c = row.length - 1; c > dcol; c--) { const v = num(row[c]); if (v > 0) { total = v; break } }
    if (!(total > 0)) continue
    const key = norm(name)
    if (!out.has(key)) out.set(key, { name: name.trim(), day: Math.min(31, Math.round(day)), amount: total })
  }
  return [...out.values()]
}

const mode = (xs: number[]) => {
  const count = new Map<number, number>()
  let best = xs[0], bestN = 0
  for (const x of xs) { const n = (count.get(x) || 0) + 1; count.set(x, n); if (n > bestN) { bestN = n; best = x } }
  return best
}

export function buildPlan(grids: Grid[]): ImportPlan {
  const weekly = grids.map(parseWeekly)
  const monthlyItems = grids.flatMap(parseMonthly)
  const weeklyItems = weekly.flatMap((w) => w.items)
  const sueldos = weekly.flatMap((w) => w.sueldos)

  const cats = new Map<string, PlanCat>()
  const addCat = (c: PlanCat) => { if (!cats.has(c.name)) cats.set(c.name, c) }
  const recs: PlanRec[] = []
  const monthlyNames = new Set<string>()

  for (const m of monthlyItems) {
    const cat = resolveCat(m.name)
    addCat(cat)
    monthlyNames.add(norm(cat.name))
    recs.push({ type: 'out', category: cat.name, amount: m.amount, freq: 'mensual', day: m.day })
  }
  for (const w of weeklyItems) {
    const cat = resolveCat(w.name, w.tipo)
    if (monthlyNames.has(norm(cat.name))) continue // ya cubierto como mensual (anti doble-conteo)
    addCat(cat)
    recs.push({ type: 'out', category: cat.name, amount: w.amount, freq: 'semanal', day: 1 })
  }
  let incomeVaries = false
  if (sueldos.length) {
    incomeVaries = new Set(sueldos).size > 1
    const cat = resolveCat('Sueldo')
    addCat(cat)
    recs.push({ type: 'in', category: cat.name, amount: mode(sueldos), freq: 'semanal', day: 1 })
  }

  return { cats: [...cats.values()], recs, incomeVaries }
}
