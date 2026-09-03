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
import HomeSkeleton from './components/Skeleton'
import Sheets from './components/Sheets'
import ConfirmDialog from './components/ConfirmDialog'
import QuickAdd from './components/QuickAdd'
import Inicio from './views/Inicio'
import Movimientos from './views/Movimientos'
import Presupuestos from './views/Presupuestos'
import Reportes from './views/Reportes'
import Ajustes from './views/Ajustes'

export default function App() {
  const theme = useStore((s) => s.theme)
  const view = useStore((s) => s.view)
  const data = useStore((s) => s.data)
  const cloudStatus = useStore((s) => s.cloudStatus)
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

  // Reintento de sync al recuperar conexión o al volver a la app: si algo quedó sin
  // subir (guardaste sin red) se empuja, y de paso se traen los cambios del otro
  // dispositivo. flushPush no hace nada sin sesión, así que no depende de `session`.
  useEffect(() => {
    if (!CLOUD) return
    const flush = () => useStore.getState().flushPush()
    const onVisible = () => { if (document.visibilityState === 'visible') flush() }
    window.addEventListener('online', flush)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('online', flush)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

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

  // Primer sync en un dispositivo nuevo: logueado, la nube aún no respondió (cloudStatus '')
  // y no hay datos locales. Mostramos skeletons en vez de estados vacíos que se llenarán solos.
  const loadingCloud = CLOUD && !!session && cloudStatus === '' && !data.movements?.length && !data.accounts?.length

  return (
    <>
      <Nav />
      <div className="wrap">
        {loadingCloud ? <HomeSkeleton /> : (
          <>
            <BackupBanner />
            <div className="view-fade" key={view}>
              {view === 'inicio' && <Inicio />}
              {view === 'movimientos' && <Movimientos />}
              {view === 'presupuestos' && <Presupuestos />}
              {view === 'reportes' && <Reportes />}
              {view === 'ajustes' && <Ajustes />}
            </div>
          </>
        )}
      </div>
      <TabBar />
      <QuickAdd />
      <Sheets />
      <Toast />
      <ConfirmDialog />
    </>
  )
}
