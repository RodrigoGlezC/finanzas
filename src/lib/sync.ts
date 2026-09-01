import type { AppState, Movement } from '../types'
import { migrate } from './storage'
import { supabase } from './supabase'

const TABLE = 'user_data'
const TOMB_TTL = 1000 * 60 * 60 * 24 * 150 // 150 días: vida de un tombstone antes de podarse

/**
 * Reloj lógico monótono (estilo Lamport) para `updatedAt`. Nunca retrocede respecto
 * al último valor conocido: `max(ahora, prev + 1)`. Como `mergeStates` deja `prev` en
 * `max(remote, local)` tras cada pull-merge, un commit posterior supera el timestamp del
 * otro dispositivo aunque el reloj local vaya atrasado → su edición gana el last-write-wins.
 */
export function nextClock(prev: number): number {
  return Math.max(Date.now(), (prev || 0) + 1)
}

function mergeTombstones(a?: Record<string, number>, b?: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...(a || {}) }
  for (const [id, ts] of Object.entries(b || {})) if (!out[id] || ts > out[id]) out[id] = ts
  const cut = Date.now() - TOMB_TTL
  for (const [id, ts] of Object.entries(out)) if (ts < cut) delete out[id]
  return out
}

/**
 * Fusiona dos estados sin perder movimientos (tier "pragmática" de la auditoría, A1):
 * - Movimientos: el documento con `updatedAt` más nuevo es autoritativo (su presencia manda
 *   sobre un tombstone, para que deshacer un borrado gane); del más viejo se añaden solo los
 *   ids que el nuevo no conoce y no estén borrados. Así no se pierde nada añadido en paralelo.
 * - Resto de colecciones (cuentas, categorías, presupuestos, metas, recurrentes, grupos):
 *   última-escritura-gana por documento (cambian poco y su borrado se nota al instante).
 */
export function mergeStates(remote: AppState, local: AppState): AppState {
  const newer = (remote.updatedAt || 0) >= (local.updatedAt || 0) ? remote : local
  const older = newer === remote ? local : remote
  const deleted = mergeTombstones(remote.deleted, local.deleted)

  const newerIds = new Set((newer.movements || []).map((m) => m.id))
  const movements: Movement[] = [...(newer.movements || [])]
  for (const m of older.movements || []) {
    if (!newerIds.has(m.id) && !deleted[m.id]) movements.push(m)
  }
  // Un movimiento vivo no debe conservar tombstone (p. ej. tras deshacer un borrado).
  for (const m of movements) if (deleted[m.id]) delete deleted[m.id]

  return {
    ...newer,
    movements,
    deleted,
    updatedAt: Math.max(remote.updatedAt || 0, local.updatedAt || 0),
  }
}

export async function pushCloud(userId: string, data: AppState): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from(TABLE).upsert({
    user_id: userId,
    data,
    updated_at: new Date(data.updatedAt || Date.now()).toISOString(),
  })
  if (error) throw error
}

export async function loadCloud(userId: string): Promise<AppState | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from(TABLE).select('data').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (data && data.data && data.data.movements) return migrate(data.data)
  return null
}
