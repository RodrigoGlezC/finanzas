import { useState, type FormEvent } from 'react'
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EyeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.3 3.9M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.9 9.9 0 0 0 4-.85" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

export default function Login() {
  const setSession = useStore((s) => s.setSession)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [errField, setErrField] = useState<'email' | 'pass' | ''>('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setInfo('')
    const mail = email.trim()
    if (!mail) { setErr('Escribe tu correo.'); setErrField('email'); return }
    if (!EMAIL_RE.test(mail)) { setErr('Ese correo no parece válido.'); setErrField('email'); return }
    if (!pass) { setErr('Escribe tu contraseña.'); setErrField('pass'); return }
    if (pass.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); setErrField('pass'); return }
    setBusy(true); setErr(''); setErrField('')
    try {
      const res = mode === 'in'
        ? await supabase.auth.signInWithPassword({ email: mail, password: pass })
        : await supabase.auth.signUp({ email: mail, password: pass })
      if (res.error) { setErr(traduceError(res.error.message)); setErrField(''); return }
      if (!res.data.session) {
        setInfo('Cuenta creada. Revisa tu correo para confirmarla e inicia sesión.')
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

  function switchMode() {
    setMode(mode === 'in' ? 'up' : 'in')
    setErr(''); setErrField(''); setInfo('')
  }

  return (
    <div id="loginScreen">
      <div className="login-box">
        <div className="login-logo" aria-hidden="true">$</div>
        <h1 className="login-title">Finanzas</h1>
        <p className="login-sub">
          {mode === 'in'
            ? 'Inicia sesión para sincronizar tus datos entre dispositivos.'
            : 'Crea tu cuenta para empezar a sincronizar tus datos.'}
        </p>
        <form className="login-form" onSubmit={submit} noValidate>
          <div className="login-field">
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email" type="email" inputMode="email" autoComplete="username" autoFocus
              placeholder="tucorreo@ejemplo.com" value={email}
              aria-invalid={errField === 'email'}
              onChange={(e) => { setEmail(e.target.value); if (errField === 'email') { setErr(''); setErrField('') } }}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-pass">Contraseña</label>
            <div className="pw-wrap">
              <input
                id="login-pass" type={showPass ? 'text' : 'password'}
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                placeholder={mode === 'in' ? 'Tu contraseña' : 'Crea una contraseña'} value={pass}
                aria-invalid={errField === 'pass'}
                onChange={(e) => { setPass(e.target.value); if (errField === 'pass') { setErr(''); setErrField('') } }}
              />
              <button
                type="button" className="pw-toggle" onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}
              >
                {showPass ? EyeOffIcon : EyeIcon}
              </button>
            </div>
            {mode === 'up' && !err && <div className="login-help">Mínimo 6 caracteres.</div>}
          </div>

          <div className="login-msg" role="alert" aria-live="polite">
            {err && <span className="err">{err}</span>}
            {info && <span className="info">{info}</span>}
          </div>

          <button type="submit" className="btn-fill wide" disabled={busy}>
            {busy
              ? <span className="btn-load"><span className="spinner" aria-hidden="true" />{mode === 'in' ? 'Entrando…' : 'Creando…'}</span>
              : mode === 'in' ? 'Entrar' : 'Crear cuenta'}
          </button>
          <button type="button" className="btn-plain" style={{ width: '100%' }} onClick={switchMode}>
            {mode === 'in' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
