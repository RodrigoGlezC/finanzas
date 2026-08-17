import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'

function traduceError(m: string): string {
  m = (m || '').toLowerCase()
  if (m.includes('invalid login')) return 'Correo o contraseña incorrectos.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya tiene cuenta. Inicia sesión.'
  if (m.includes('api key')) return 'Llave de Supabase inválida. Revisa tu configuración.'
  if (m.includes('email')) return 'Correo no válido.'
  return 'Error: ' + m
}

export default function Login() {
  const setSession = useStore((s) => s.setSession)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!supabase) return
    if (!email || !pass) { setErr('Escribe correo y contraseña.'); return }
    if (pass.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); return }
    setBusy(true); setErr('')
    try {
      const res = mode === 'in'
        ? await supabase.auth.signInWithPassword({ email, password: pass })
        : await supabase.auth.signUp({ email, password: pass })
      if (res.error) { setErr(traduceError(res.error.message)); return }
      if (!res.data.session) {
        setErr('Cuenta creada. Revisa tu correo para confirmarla, o desactiva la confirmación en Supabase (Auth → Providers → Email).')
        setMode('in')
        return
      }
      setSession(res.data.session)
    } catch {
      setErr('No se pudo conectar. Revisa tu internet.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div id="loginScreen" style={{ display: 'flex' }}>
      <div className="login-box">
        <div className="login-logo">$</div>
        <h1 className="login-title">Finanzas</h1>
        <p className="login-sub">Inicia sesión para sincronizar tus datos entre tus dispositivos.</p>
        <div className="login-form">
          <input
            type="email" inputMode="email" autoComplete="username" placeholder="Correo"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} placeholder="Contraseña"
            value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          />
          <div className="login-err">{err}</div>
          <button className="btn-fill wide" onClick={submit} disabled={busy}>
            {busy ? '…' : mode === 'in' ? 'Entrar' : 'Crear cuenta'}
          </button>
          <button className="btn-plain" style={{ width: '100%' }} onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr('') }}>
            {mode === 'in' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
