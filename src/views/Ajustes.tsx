import { useRef } from 'react'
import { useStore } from '../store'
import { CLOUD, supabase } from '../lib/supabase'
import { accBalance, accName } from '../lib/calc'
import { ACC_ICON, WEEKDAYS, iconFor } from '../lib/constants'
import { cap, colorForName, cssVar, money, tint } from '../lib/format'
import { STORE_KEY } from '../lib/constants'
import { IconSquare } from '../components/ui'
import { clearAll, exportCsv, exportJson, importJson, loadExample } from '../lib/dataOps'

export default function Ajustes() {
  const data = useStore((s) => s.data)
  const session = useStore((s) => s.session)
  const cloudStatus = useStore((s) => s.cloudStatus)
  const openSheet = useStore((s) => s.openSheet)
  const fileRef = useRef<HTMLInputElement>(null)

  async function logout() {
    try { await supabase?.auth.signOut() } catch { /* ignore */ }
    try { localStorage.removeItem(STORE_KEY) } catch { /* ignore */ }
    location.reload()
  }

  const catsByGroup: Record<string, typeof data.cats> = {}
  data.cats.forEach((c) => { (catsByGroup[c.group] = catsByGroup[c.group] || []).push(c) })
  const usedCats = new Set(data.movements.map((m) => m.category))

  return (
    <>
      <div className="section-title">Pagos recurrentes <button className="act" onClick={() => openSheet({ kind: 'recurring' })}>+ Añadir</button></div>
      <div className="card">
        {data.recurring.length === 0 ? (
          <div className="empty" style={{ padding: 26 }}>
            <div className="e-s" style={{ marginBottom: 12 }}>Registra Renta, Spotify, iCloud… y se agregan solos cada periodo.</div>
            <button className="btn-fill" onClick={() => openSheet({ kind: 'recurring' })}>Añadir recurrente</button>
          </div>
        ) : data.recurring.map((r) => {
          const col = r.type === 'in' ? cssVar('--green') : colorForName(r.category)
          const freq = r.freq === 'mensual' ? `Día ${r.day} de cada mes` : `Cada ${WEEKDAYS[(r.day || 1) - 1]}`
          return (
            <div className="row tappable" key={r.id} onClick={() => openSheet({ kind: 'recurring', id: r.id })}>
              <IconSquare emoji={iconFor(r.category, r.type, data.cats)} color={col} />
              <div className="r-main"><div className="r-title">{r.category} {r.active === false ? '· ⏸️' : ''}</div><div className="r-sub">{freq} · {accName(data, r.accountId)}</div></div>
              <div className="r-trail"><span className="r-amt tnum">{money(r.amount)}</span><span className="chev">›</span></div>
            </div>
          )
        })}
      </div>

      <div className="section-title">Cuentas <button className="act" onClick={() => openSheet({ kind: 'account' })}>+ Añadir</button></div>
      <div className="card">
        {data.accounts.map((a) => (
          <div className="row tappable" key={a.id} onClick={() => openSheet({ kind: 'account', id: a.id })}>
            <IconSquare emoji={ACC_ICON[a.type] || '👛'} color={cssVar('--tint')} />
            <div className="r-main"><div className="r-title">{a.name}</div><div className="r-sub">{cap(a.type)} · saldo {money(accBalance(data, a.id))}</div></div>
            <span className="chev">›</span>
          </div>
        ))}
      </div>

      <div className="section-title">Categorías <button className="act" onClick={() => openSheet({ kind: 'category' })}>+ Añadir</button></div>
      <div className="card">
        {data.groups.filter((g) => catsByGroup[g]).map((g) => (
          <div key={g}>
            <div className="glabel" style={{ padding: '12px 16px 4px' }}>{g}</div>
            {catsByGroup[g].map((c) => (
              <div className="row tappable" key={c.name} onClick={() => openSheet({ kind: 'category', name: c.name })}>
                <IconSquare emoji={iconFor(c.name, g === 'Ingresos' ? 'in' : 'out', data.cats)} color={g === 'Ingresos' ? cssVar('--green') : colorForName(c.name)} />
                <div className="r-main"><div className="r-title">{c.name}</div></div>
                <div className="r-trail">
                  {usedCats.has(c.name) && <span className="r-sub">en uso</span>}
                  <span className="chev">›</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {CLOUD && session && (
        <>
          <div className="section-title">Cuenta</div>
          <div className="card">
            <div className="row">
              <IconSquare emoji="👤" color={cssVar('--tint')} />
              <div className="r-main"><div className="r-title">{session.user.email || 'Mi cuenta'}</div><div className="r-sub">Datos en la nube</div></div>
              {cloudStatus === 'ok' ? <span className="badge ok">Sincronizado</span> : cloudStatus === 'off' ? <span className="badge warn">Sin conexión</span> : null}
            </div>
            <div className="row tappable" onClick={logout}>
              <span className="ic" style={{ background: tint(cssVar('--red'), 15) }}>🚪</span>
              <div className="r-main"><div className="r-title" style={{ color: 'var(--red)' }}>Cerrar sesión</div></div>
              <span className="chev">›</span>
            </div>
          </div>
        </>
      )}

      <div className="section-title">Datos</div>
      <div className="card">
        <div className="row tappable" onClick={exportJson}><span className="ic" style={{ background: 'var(--fill)' }}>⬇️</span><div className="r-main"><div className="r-title">Exportar respaldo (JSON)</div><div className="r-sub">Guarda una copia de todo</div></div><span className="chev">›</span></div>
        <div className="row tappable" onClick={() => fileRef.current?.click()}><span className="ic" style={{ background: 'var(--fill)' }}>⬆️</span><div className="r-main"><div className="r-title">Importar respaldo</div><div className="r-sub">Restaura desde un archivo</div></div><span className="chev">›</span></div>
        <div className="row tappable" onClick={exportCsv}><span className="ic" style={{ background: 'var(--fill)' }}>📄</span><div className="r-main"><div className="r-title">Exportar periodo a CSV</div></div><span className="chev">›</span></div>
        <div className="row tappable" onClick={loadExample}><span className="ic" style={{ background: 'var(--fill)' }}>✨</span><div className="r-main"><div className="r-title">Cargar datos de ejemplo</div></div><span className="chev">›</span></div>
        <div className="row tappable" onClick={clearAll}><span className="ic" style={{ background: tint(cssVar('--red'), 15) }}>🗑️</span><div className="r-main"><div className="r-title" style={{ color: 'var(--red)' }}>Borrar todos los datos</div></div><span className="chev">›</span></div>
      </div>
      <div style={{ textAlign: 'center', color: 'var(--label-3)', fontSize: 12, marginTop: 22 }}>Finanzas · {CLOUD ? 'sincronizado en la nube' : 'datos en este dispositivo'}</div>

      <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
    </>
  )
}
