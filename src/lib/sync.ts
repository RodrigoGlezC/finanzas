import type { AppState } from '../types'
import { migrate } from './storage'
import { supabase } from './supabase'

const TABLE = 'user_data'

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
