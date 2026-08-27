import { useAuth } from '../lib/useAuth'
import BalanceSpark from './auth/BalanceSpark'
import { AuthField, AuthPasswordField } from './auth/AuthField'

const LockIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

export default function Login() {
  const a = useAuth()
  const signup = a.mode === 'up'

  return (
    <div id="loginScreen">
      <main className="auth-panel">
        <div className="auth-brand">
          <span className="auth-mark" aria-hidden="true">$</span>
          <span className="auth-word">Finanzas</span>
        </div>

        <BalanceSpark />

        <h1 className="auth-title">Tu dinero, en orden.</h1>
        <p className="auth-sub">
          {signup
            ? 'Crea tu cuenta y empieza a llevar el control de tu dinero.'
            : 'Sincroniza tus finanzas entre tus dispositivos. Cifrado y solo tuyo.'}
        </p>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); a.submit() }} noValidate>
          <AuthField
            ref={a.emailRef} id="auth-email" label="Correo"
            type="email" inputMode="email" name="email" autoComplete="username" autoFocus
            placeholder="tucorreo@ejemplo.com" value={a.email} invalid={a.errField === 'email'}
            onChange={(e) => { a.setEmail(e.target.value); a.clearFieldError('email') }}
          />

          <AuthPasswordField
            ref={a.passRef} id="auth-pass" label="Contraseña"
            name="password" autoComplete={signup ? 'new-password' : 'current-password'}
            placeholder={signup ? 'Crea una contraseña' : 'Tu contraseña'}
            value={a.pass} invalid={a.errField === 'pass'}
            help={signup && !a.err ? 'Mínimo 6 caracteres.' : undefined}
            onChange={(e) => { a.setPass(e.target.value); a.clearFieldError('pass') }}
          />

          <div className="auth-msg" role="alert" aria-live="assertive">
            {a.err && <span className="err">{a.err}</span>}
            {a.info && <span className="info">{a.info}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={a.busy}>
            {a.busy ? (
              <><span className="auth-spinner" aria-hidden="true" />{signup ? 'Creando tu cuenta…' : 'Entrando…'}</>
            ) : (
              <>{signup ? 'Crear mi cuenta' : 'Entrar'}<span className="arrow" aria-hidden="true">→</span></>
            )}
          </button>

          <button type="button" className="auth-switch" onClick={a.switchMode}>
            {signup ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Crear cuenta'}
          </button>
        </form>

        <div className="auth-trust">{LockIcon} Tus datos viven solo en tu cuenta.</div>
      </main>
    </div>
  )
}
