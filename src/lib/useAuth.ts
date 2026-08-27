import { useRef, useState } from 'react'
import { supabase } from './supabase'
import { useStore } from '../store'

export type AuthMode = 'in' | 'up'
export type AuthFieldName = 'email' | 'pass'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Traduce el error de Supabase a la voz de la interfaz, sin revelar si falló el correo o la contraseña. */
function translateError(m: string): string {
  const s = (m || '').toLowerCase()
  if (s.includes('invalid login')) return 'Correo o contraseña incorrectos.'
  if (s.includes('already registered') || s.includes('already been registered')) return 'Ese correo ya tiene cuenta. Inicia sesión.'
  if (s.includes('rate') || s.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (s.includes('api key')) return 'Configuración de Supabase inválida. Revisa tus llaves.'
  if (s.includes('email')) return 'Ese correo no es válido.'
  return 'Algo salió mal. Inténtalo de nuevo.'
}

/**
 * Estado y flujo del login/registro. Aísla toda la lógica de Supabase de la UI:
 * validación local → llamada → traducción de errores → sesión / mensaje de confirmación.
 */
export function useAuth() {
  const setSession = useStore((s) => s.setSession)
  const [mode, setMode] = useState<AuthMode>('in')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [errField, setErrField] = useState<AuthFieldName | ''>('')
  const [info, setInfo] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  function fail(field: AuthFieldName, message: string) {
    setErr(message)
    setErrField(field)
    ;(field === 'email' ? emailRef : passRef).current?.focus()
  }

  async function submit() {
    if (!supabase) { setErr('No hay conexión con el servidor.'); return }
    setInfo('')
    const mail = email.trim()
    if (!mail) return fail('email', 'Escribe tu correo.')
    if (!EMAIL_RE.test(mail)) return fail('email', 'Ese correo no parece válido.')
    if (!pass) return fail('pass', 'Escribe tu contraseña.')
    if (pass.length < 6) return fail('pass', 'La contraseña necesita al menos 6 caracteres.')

    setBusy(true); setErr(''); setErrField('')
    try {
      const res = mode === 'in'
        ? await supabase.auth.signInWithPassword({ email: mail, password: pass })
        : await supabase.auth.signUp({ email: mail, password: pass })
      if (res.error) { setErr(translateError(res.error.message)); setErrField(''); return }
      if (!res.data.session) {
        // Supabase con "Confirm email" activo: cuenta creada pero sin sesión.
        setInfo('Cuenta creada. Revisa tu correo para confirmarla e inicia sesión.')
        setMode('in')
        return
      }
      setSession(res.data.session)
    } catch {
      setErr('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setMode((m) => (m === 'in' ? 'up' : 'in'))
    setErr(''); setErrField(''); setInfo('')
  }

  function clearFieldError(field: AuthFieldName) {
    if (errField === field) { setErr(''); setErrField('') }
  }

  return { mode, email, setEmail, pass, setPass, busy, err, errField, info, emailRef, passRef, submit, switchMode, clearFieldError }
}
