import type { AppState } from '../types'
import { DEFAULT_CATS, DEFAULT_GROUPS, STORE_KEY, LAST_BACKUP_KEY } from './constants'

export function uid(p = ''): string {
  return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** Marca movimientos como borrados (tombstone) para que la fusión no los resucite. */
export function addTombstones(st: AppState, ids: string[]) {
  if (!st.deleted) st.deleted = {}
  const now = Date.now()
  for (const id of ids) st.deleted[id] = now
}
/** Quita tombstones (p. ej. al deshacer un borrado). */
export function removeTombstones(st: AppState, ids: string[]) {
  if (!st.deleted) return
  for (const id of ids) delete st.deleted[id]
}

export function emptyState(): AppState {
  // Usuario nuevo: SIN categorías precargadas (totalmente personalizable).
  // Se conservan los grupos por defecto sólo como sugerencias del selector.
  return migrate({ movements: [], cats: [], groups: DEFAULT_GROUPS.slice() })
}

/** Migración idempotente desde cualquier versión previa, sin perder datos. */
export function migrate(d: any): AppState {
  d.movements = d.movements || []
  // Un array vacío es intencional (usuario nuevo o que borró todas sus categorías):
  // se respeta. Sólo se siembran los defaults cuando el campo NO existe (datos legacy).
  d.cats = Array.isArray(d.cats) ? d.cats : DEFAULT_CATS.slice()
  d.groups = Array.isArray(d.groups) ? d.groups : DEFAULT_GROUPS.slice()
  if (!d.accounts || !d.accounts.length) {
    d.accounts = [{ id: 'acc_efvo', name: 'Efectivo', type: 'efectivo', opening: 0 }]
  }
  const first = d.accounts[0].id
  d.movements.forEach((m: any) => { if (!m.accountId) m.accountId = first })
  d.budgets = d.budgets || {}
  d.recurring = d.recurring || []
  d.recurring.forEach((r: any) => { if (!Array.isArray(r.skip)) r.skip = [] })
  d.deleted = d.deleted && typeof d.deleted === 'object' ? d.deleted : {}
  d.goals = d.goals || []
  d.goals.forEach((g: any) => {
    if (g.initial === undefined) {
      const ap = (d.movements || [])
        .filter((m: any) => m.goalId === g.id && m.type === 'out')
        .reduce((s: number, m: any) => s + m.amount, 0)
      g.initial = Math.max(0, (g.saved || 0) - ap)
    }
  })
  d.version = 2
  if (typeof d.updatedAt !== 'number') d.updatedAt = 0
  return d as AppState
}

export function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      if (d && d.movements) return migrate(d)
    }
  } catch (e) {
    console.warn('loadLocal', e)
  }
  return emptyState()
}

export function saveLocal(state: AppState) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('saveLocal', e)
  }
}

export function getLastBackup(): number {
  try { return +(localStorage.getItem(LAST_BACKUP_KEY) || 0) } catch { return 0 }
}
export function setLastBackup() {
  try { localStorage.setItem(LAST_BACKUP_KEY, String(Date.now())) } catch { /* ignore */ }
}
