/**
 * Skeleton de la pantalla de Inicio para el primer sync en un dispositivo nuevo
 * (logueado, cargando la nube, aún sin datos locales). Placeholders con shimmer que
 * imitan el hero + una lista, para que la carga no aparezca como pantalla vacía.
 * Decorativo: aria-hidden + aria-busy en el contenedor.
 */
export default function HomeSkeleton() {
  return (
    <div aria-hidden="true" aria-busy="true">
      <div className="hero" style={{ marginTop: 6 }}>
        <div className="sk" style={{ width: 90, height: 12, marginBottom: 14 }} />
        <div className="sk" style={{ width: 70, height: 13, marginBottom: 8 }} />
        <div className="sk" style={{ width: 180, height: 40, marginBottom: 16 }} />
        <div className="sk" style={{ height: 8, borderRadius: 999, margin: '6px 0 16px' }} />
        <div className="hstats">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="sk" style={{ width: 56, height: 12, marginBottom: 8 }} />
              <div className="sk" style={{ width: 70, height: 18 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="sk" style={{ width: 120, height: 13, margin: '24px 6px 10px' }} />
      <div className="card">
        {[0, 1, 2].map((i) => (
          <div className="row" key={i}>
            <div className="sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <div className="r-main">
              <div className="sk" style={{ width: '55%', height: 15, marginBottom: 6 }} />
              <div className="sk" style={{ width: '35%', height: 12 }} />
            </div>
            <div className="sk" style={{ width: 64, height: 15 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
