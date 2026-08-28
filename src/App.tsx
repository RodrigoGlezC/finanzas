import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { CLOUD, supabase } from './lib/supabase'
import { loadCloud, pushCloud, mergeStates } from './lib/sync'
import { migrate } from './lib/storage'
import type { AppState } from './types'
import Nav from './components/Nav'
import TabBar from './components/TabBar'
import Toast from './components/Toast'
import BackupBanner from './components/BackupBanner'
import Login from './components/Login'
import Sheets from './components/Sheets'
import Inicio from './views/Inicio'
import Movimientos from './views/Movimientos'
import Presupuestos from './views/Presupuestos'
import Reportes from './views/Reportes'
import Ajustes from './views/Ajustes'

export default function App() {
  const theme = useStore((s) => s.theme)
  const view = useStore((s) => s.view)
  const session = useStore((s) => s.session)
  const setSession = useStore((s) => s.setSession)
  const setCloudStatus = useStore((s) => s.setCloudStatus)
  const replaceData = useStore((s) => s.replaceData)
  const showToast = useStore((s) => s.showToast)

  const [ready, setReady] = useState(!CLOUD)
  const syncedFor = useRef<string | null>(null)

  // aplica el tema al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // arranque de sesión (modo nube)
  useEffect(() => {
    if (!CLOUD || !supabase) return
    let unsub: (() => void) | undefined
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setReady(true)
    }).catch(() => setReady(true))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    unsub = () => data.subscription.unsubscribe()
    return unsub
  }, [setSession])

  // al iniciar sesión: sincroniza (una vez por usuario)
  useEffect(() => {
    if (!CLOUD || !session) return
    const uid = session.user.id
    if (syncedFor.current === uid) return
    syncedFor.current = uid
    ;(async () => {
      try {
        const remote = await loadCloud(uid)
        const local = useStore.getState().data
        if (remote) {
          // Fusiona en vez de "el más nuevo gana": une los movimientos de ambos
          // dispositivos y respeta tombstones, luego sube la unión.
          const merged = mergeStates(remote, local)
          replaceData(merged)
          await pushCloud(uid, merged)
        } else {
          await pushCloud(uid, local)
        }
        setCloudStatus('ok')
      } catch (e) {
        console.warn('sync', e)
        setCloudStatus('off')
        showToast('Sin conexión: usando datos locales')
      }
    })()
  }, [session, replaceData, setCloudStatus, showToast])

  // Realtime: refresca cuando OTRO dispositivo empuja cambios. Requiere Realtime activo
  // en Supabase (Database → Replication → tabla user_data). Si no lo está, no dispara nada.
  useEffect(() => {
    if (!CLOUD || !supabase || !session) return
    const uid = session.user.id
    const ch = supabase
      .channel('userdata:' + uid)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${uid}` },
        (payload) => {
          const row = payload.new as { data?: AppState } | null
          if (!row?.data?.movements) return
          const incoming = migrate(row.data)
          const local = useStore.getState().data
          if ((incoming.updatedAt || 0) <= (local.updatedAt || 0)) return // ignora el eco de nuestro propio push
          replaceData(mergeStates(incoming, local))
        },
      )
      .subscribe()
    return () => { supabase!.removeChannel(ch) }
  }, [session, replaceData])

  if (!ready) return null
  if (CLOUD && !session) return <Login />

  return (
    <>
      <Nav />
      <div className="wrap">
        <BackupBanner />
        {view === 'inicio' && <Inicio />}
        {view === 'movimientos' && <Movimientos />}
        {view === 'presupuestos' && <Presupuestos />}
        {view === 'reportes' && <Reportes />}
        {view === 'ajustes' && <Ajustes />}
      </div>
      <TabBar />
      <Sheets />
      <Toast />
    </>
  )
}
