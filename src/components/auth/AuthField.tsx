import { forwardRef, useState, type InputHTMLAttributes } from 'react'

type BaseProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  invalid?: boolean
  help?: string
}

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

/** Campo con label visible, estado inválido y texto de ayuda opcional. */
export const AuthField = forwardRef<HTMLInputElement, BaseProps>(
  function AuthField({ label, invalid, help, id, ...rest }, ref) {
    return (
      <div className="auth-field">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} className="auth-input" aria-invalid={invalid || undefined} {...rest} />
        {help && <span className="auth-help">{help}</span>}
      </div>
    )
  },
)

/** Campo de contraseña con botón mostrar/ocultar (44×44, aria-label + aria-pressed). */
export const AuthPasswordField = forwardRef<HTMLInputElement, Omit<BaseProps, 'type'>>(
  function AuthPasswordField({ label, invalid, help, id, ...rest }, ref) {
    const [show, setShow] = useState(false)
    return (
      <div className="auth-field">
        <label htmlFor={id}>{label}</label>
        <div className="auth-pw">
          <input
            ref={ref} id={id} className="auth-input" type={show ? 'text' : 'password'}
            aria-invalid={invalid || undefined} {...rest}
          />
          <button
            type="button" className="auth-eye" onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={show}
          >
            {show ? EyeOffIcon : EyeIcon}
          </button>
        </div>
        {help && <span className="auth-help">{help}</span>}
      </div>
    )
  },
)
