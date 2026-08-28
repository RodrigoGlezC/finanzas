import { Component, type ReactNode } from 'react'
import { exportJson } from '../lib/dataOps'

interface Props { children: ReactNode }
interface State { hasError: boolean }

/** Evita la pantalla en blanco: captura errores de render y ofrece recargar
 *  y exportar un respaldo para no perder datos. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('ErrorBoundary', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="err-screen">
        <div className="err-box">
          <div className="err-ic" aria-hidden="true">⚠️</div>
          <h1>Algo salió mal</h1>
          <p>La app encontró un error inesperado. Tus datos siguen guardados en este dispositivo.</p>
          <div className="err-actions">
            <button className="btn-fill wide" onClick={() => location.reload()}>Recargar</button>
            <button className="btn-soft" onClick={() => { try { exportJson() } catch { /* noop */ } }}>Exportar respaldo</button>
          </div>
        </div>
      </div>
    )
  }
}
