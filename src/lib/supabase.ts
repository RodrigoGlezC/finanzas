import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true cuando hay credenciales válidas => la app corre en modo nube (con login). */
export const CLOUD: boolean = !!(url && url.startsWith('http') && key)

export const supabase: SupabaseClient | null = CLOUD ? createClient(url!, key!) : null
