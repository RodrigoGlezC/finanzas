import { useStore } from '../store'
import { getLastBackup } from '../lib/storage'
import { exportJson } from '../lib/dataOps'
import { Icon } from '../lib/icons'

export default function BackupBanner() {
  const data = useStore((s) => s.data)
  const dismissed = useStore((s) => s.bannerDismissed)
  const dismiss = useStore((s) => s.dismissBanner)
  useStore((s) => s.backupSignal) // re-render cuando cambia el respaldo
  const last = getLastBackup()
  const overdue = data.movements.length > 0 && !dismissed && (!last || Date.now() - last > 7 * 86400000)
  if (!overdue) return null
  const days = last ? Math.floor((Date.now() - last) / 86400000) : null
  const txt = last ? `Hace ${days} ${days === 1 ? 'día' : 'días'} que no respaldas.` : 'Aún no has respaldado tus datos.'
  return (
    <div className="banner">
      <span className="bk-ic"><Icon name="shield" /></span>
      <div style={{ flex: 1 }}>{txt} Descarga una copia por seguridad.</div>
      <button className="btn-soft bk-btn" onClick={exportJson}>Respaldar</button>
      <button className="bk-x" onClick={dismiss}>✕</button>
    </div>
  )
}
