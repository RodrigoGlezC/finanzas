import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { AppState, PeriodMode, Theme, ViewName } from './types'
import { loadLocal, saveLocal } from './lib/storage'
import { materializeRecurring } from './lib/recurring'
import { CLOUD } from './lib/supabase'
import { pushCloud } from './lib/sync'
import { THEME_KEY } from './lib/constants'

export type SheetState =
  | null
  | { kind: 'movement'; id?: string }
  | { kind: 'account'; id?: string }
  | { kind: 'budget'; cat?: string }
  | { kind: 'goal'; id?: string }
  | { kind: 'aporte'; goalId: string }
  | { kind: 'recurring'; id?: string }
  | { kind: 'transfer' }
  | { kind: 'category'; name?: string }
  | { kind: 'reassignAccount'; id: string }
  | { kind: 'reassignCategory'; name: string }

export interface ToastState { msg: string; undo?: () => void; key: number }

interface Store {
  data: AppState
  session: Session | null
  cloudStatus: '' | 'ok' | 'off'
  view: ViewName
  periodMode: PeriodMode
  anchor: number
  theme: Theme
  filterMode: 'all' | 'in' | 'out'
  accFilter: string
  search: string
  pmTab: 'budgets' | 'goals'
  sheet: SheetState
  toast: ToastState | null
  bannerDismissed: boolean
  backupSignal: number

  commit: (fn: (d: AppState) => void, opts?: { toast?: string; undo?: () => void }) => void
  signalBackup: () => void
  replaceData: (d: AppState, persist?: boolean) => void
  materializeNow: () => void

  setView: (v: ViewName) => void
  setPeriodMode: (m: PeriodMode) => void
  step: (dir: -1 | 1) => void
  setAnchorFromDate: (d: Date) => void
  setFilter: (f: 'all' | 'in' | 'out') => void
  setAccFilter: (id: string) => void
  setSearch: (s: string) => void
  setPmTab: (t: 'budgets' | 'goals') => void
  toggleTheme: () => void
  openSheet: (s: SheetState) => void
  closeSheet: () => void
  showToast: (msg: string, undo?: () => void) => void
  clearToast: () => void
  setSession: (s: Session | null) => void
  setCloudStatus: (s: '' | 'ok' | 'off') => void
  dismissBanner: () => void
}

let pushTimer: ReturnType<typeof setTimeout> | undefined
function schedulePush(getState: () => Store) {
  if (!CLOUD) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(async () => {
    const { session, data } = getState()
    if (!session) return
    try {
      await pushCloud(session.user.id, data)
      getState().setCloudStatus('ok')
    } catch (e) {
      console.warn('push', e)
      getState().setCloudStatus('off')
    }
  }, 1200)
}

function initialTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'dark' || t === 'light') return t
  } catch { /* ignore */ }
  return 'light'
}

const initialData = loadLocal()
materializeRecurring(initialData) // agrega recurrentes vencidos al arrancar
saveLocal(initialData)

let toastSeq = 0

export const useStore = create<Store>((set, get) => ({
  data: initialData,
  session: null,
  cloudStatus: '',
  view: 'inicio',
  periodMode: 'month',
  anchor: (() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() })(),
  theme: initialTheme(),
  filterMode: 'all',
  accFilter: 'all',
  search: '',
  pmTab: 'budgets',
  sheet: null,
  toast: null,
  bannerDismissed: false,
  backupSignal: 0,

  signalBackup: () => set((s) => ({ backupSignal: s.backupSignal + 1 })),

  commit: (fn, opts) => {
    const d: AppState = structuredClone(get().data)
    fn(d)
    d.updatedAt = Date.now()
    set({ data: d })
    saveLocal(d)
    schedulePush(get)
    if (opts?.toast) get().showToast(opts.toast, opts.undo)
  },

  replaceData: (d, persist = true) => {
    set({ data: d })
    if (persist) saveLocal(d)
  },

  materializeNow: () => {
    const d: AppState = structuredClone(get().data)
    const added = materializeRecurring(d)
    if (added) {
      d.updatedAt = Date.now()
      set({ data: d })
      saveLocal(d)
      schedulePush(get)
    }
  },

  setView: (v) => set({ view: v }),
  setPeriodMode: (m) => set({
    periodMode: m,
    anchor: (() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), m === 'week' ? t.getDate() : 1).getTime() })(),
  }),
  step: (dir) => {
    const { anchor, periodMode } = get()
    const a = new Date(anchor)
    const next = periodMode === 'week'
      ? new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7 * dir)
      : new Date(a.getFullYear(), a.getMonth() + dir, 1)
    set({ anchor: next.getTime() })
  },
  setAnchorFromDate: (d) => {
    const { periodMode } = get()
    const a = periodMode === 'week' ? d : new Date(d.getFullYear(), d.getMonth(), 1)
    set({ anchor: a.getTime() })
  },
  setFilter: (f) => set({ filterMode: f }),
  setAccFilter: (id) => set({ accFilter: id }),
  setSearch: (s) => set({ search: s }),
  setPmTab: (t) => set({ pmTab: t }),
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
    set({ theme })
  },
  openSheet: (s) => set({ sheet: s }),
  closeSheet: () => set({ sheet: null }),
  showToast: (msg, undo) => set({ toast: { msg, undo, key: ++toastSeq } }),
  clearToast: () => set({ toast: null }),
  setSession: (s) => set({ session: s }),
  setCloudStatus: (s) => set({ cloudStatus: s }),
  dismissBanner: () => set({ bannerDismissed: true }),
}))
