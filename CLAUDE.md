# CLAUDE.md — Contexto del proyecto Finanzas

App de control de ingresos y gastos. PWA instalable, con login y sincronización en la nube por usuario.
- **Producción:** https://rodrigoglezc.github.io/finanzas/
- **Repo:** https://github.com/RodrigoGlezC/finanzas (rama `main`)

## Stack
- Vite + React 18 + TypeScript (estricto)
- Zustand para el estado global (un solo store: `src/store.ts`)
- Supabase (Auth email+contraseña + Postgres) para login y sync
- vite-plugin-pwa (instalable, offline)
- Deploy automático a GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`) en cada push a `main`. En `vite.config.ts`, `base: './'`.

## Estructura
```
src/
  main.tsx, App.tsx        (tema, sesión, ruteo de vistas)
  store.ts                 (estado + persistencia + sync + control de sheets + toast)
  types.ts, index.css      (design system estilo iOS)
  lib/    constants, format, storage(+migrate), calc, recurring, period, supabase, sync, dataOps
  components/  Nav, TabBar, Login, Sheet, Sheets, Toast, BackupBanner, BudgetRow, Keypad, ui
  views/  Inicio, Movimientos, Presupuestos, Reportes, Ajustes
  sheets/ Movement, Account, Budget, Goal, Aporte, Recurring, Category, Transfer, Reassign
  charts/ Donut, TrendChart
```

## Modelo de datos (AppState = un JSON por usuario)
`{ movements, cats, groups, budgets(map categoria->limite), accounts, goals, recurring, version, updatedAt }`
- Se guarda en `localStorage` y, en modo nube, en Supabase tabla `user_data` (fila por usuario: `user_id`, `data jsonb`, `updated_at`) con RLS por `auth.uid()`.
- **Sync (A1, tier pragmática):** antes de cada push se hace *pull-y-merge* (`mergeStates` en `lib/sync.ts`) para no sobrescribir cambios de otro dispositivo; el merge resultante **se adopta siempre** en local y se sube (no solo si cambia el conteo de movimientos, para no pisar un movimiento nuevo del otro PC cuando el conteo coincide pero el contenido difiere). Movimientos: el doc con `updatedAt` más nuevo es autoritativo y del más viejo se añaden los ids que no conoce (unión aditiva), con **tombstones** (`deleted: {id->ms}`) para que un borrado real no resucite; la presencia en el doc nuevo manda sobre el tombstone (deshacer gana). Resto de colecciones (cuentas, categorías, presupuestos, metas, recurrentes, grupos): última-escritura-gana por documento, decidida por `updatedAt`, que es un **reloj lógico monótono** (`nextClock` = `max(now, prev+1)`): como el merge deja `prev` en `max(remote, local)`, un commit posterior supera el timestamp del otro PC aunque su reloj vaya atrasado → mitiga el sesgo de reloj en el last-write-wins. (NO resuelve editar desde un estado rancio la MISMA colección que otro PC ya cambió; eso pide merge por-colección, aún pendiente.) Realtime opcional refresca al recibir cambios de otro dispositivo (requiere activar Realtime en `user_data`). Al recuperar conexión o foco, `flushPush` (listeners `online`/`visibilitychange` en `App.tsx`) reintenta el pull-merge-push: rescata lo guardado sin red y trae cambios del otro dispositivo. Los borrados de movimiento registran tombstone en `delMov`/`delTransfer`/`clearAll` (y el deshacer lo quita).
- `Movement`: `{id,type:'in'|'out',amount,category,date,note,accountId,recurringId?,period?,goalId?,transfer?,transferId?,_c}`
- `Category`: `{name, group, icon?}`. Cada usuario tiene SUS categorías (parten de `DEFAULT_CATS`, totalmente editables). `icon` es una **clave** del set SVG en `lib/icons.tsx` (p. ej. `'cart'`, `'home'`), NO un emoji. `migrate()` convierte emoji históricos a claves con `normalizeIconKey`.

## Decisiones y gotchas (respétalas)
- **Transferencias** entre cuentas = 2 movimientos enlazados por `transferId` con `transfer:true` y categoría `'Transferencia'`. Se EXCLUYEN de ingresos/gastos/presupuestos/reportes (filtro `!m.transfer`) pero SÍ afectan el saldo de las cuentas.
- **Recurrentes**: `materializeRecurring()` genera los vencidos de forma idempotente por `recurringId+period`. Al borrar una ocurrencia se agrega su `period` a `r.skip` para que no reaparezca.
- **Proyección de cierre (Inicio)**: `upcomingUntil(state, end)` (`lib/recurring.ts`) lista las ocurrencias de recurrentes que aún vencen en `(hoy, end]`, **excluyendo las ya registradas** (mismo `recurringId+period` en `movements`) para no contarlas dos veces. Inicio la usa **solo en el periodo en curso** (`P.inRange(hoy)`) para mostrar "cerrarías en ~$X" = saldo del periodo + neto de esos recurrentes (ingresos suman, gastos restan). En periodos pasados/futuros no se muestra.
- **Metas**: `goalSaved = goal.initial + suma de movimientos con goalId` (fuente única de verdad; borrar un aporte ajusta la meta sola).
- `iconFor(cat, type, cats)` devuelve la **clave** de ícono (custom de la categoría → `ICONS[nombre]` → default). Se renderiza con `<Icon name={clave}/>` de `lib/icons.tsx` (SVG monocromo `currentColor`, estilo SF Symbols). NO se usan emoji en la UI.
- `migrate()` en `lib/storage.ts` hace migración idempotente sin perder datos: **cualquier campo nuevo del modelo se inicializa AHÍ**.
- `commit(fn)` en el store clona el estado, aplica cambios, hace bump **monótono** de `updatedAt` (`nextClock`, ver Sync), guarda en local y hace push con debounce a la nube.
- Presupuestos y reportes son **mensuales**.
- **"Disponible para gastar" (`budgetSummary` en `lib/calc.ts`)**: el `remaining` del encabezado suma TODAS las categorías presupuestadas, pero el **`perDay` se calcula solo sobre categorías variables** — excluye las cubiertas por un recurrente `out` activo (fijas, ya comprometidas: no son dinero repartible entre los días). Si no hay categorías fijas presupuestadas, `perDay` equivale al total/días (sin regresión) y la UI omite la coletilla "para el día a día" (bandera `hasFixed`).

## Backend (Supabase)
- Las llaves van en `.env` (committed): `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (publishable key, **pública por diseño**; la seguridad la dan RLS + login). No la trates como secreto.
- Auth email+contraseña, con "Confirm email" desactivado. Cada usuario solo ve sus datos.

## Flujo de trabajo
- Node 18+. `npm install`, `npm run dev` (localhost:5173), `npm run build` (valida tipos + empaqueta), `npm test` (Vitest, tests de `lib/`).
- Se trabaja desde 2 PCs (casa y trabajo): **SIEMPRE `git pull` antes de empezar y `git push` al terminar**. Push a `main` dispara el deploy solo.

## Features implementadas
Captura rápida (teclado propio + chips de categoría con icono + recordar última cuenta/categoría + repetir último), cuentas con saldo, transferencias, presupuestos con alertas + "disponible para gastar" (con gasto-por-día que separa fijo de variable), metas con aportes, pagos recurrentes (mensual/semanal) con "pagar" y próximos pagos, proyección de cierre de periodo (saldo + recurrentes por venir), vista mes/semana, reportes (tendencia 6 meses, comparativa, resumen anual), búsqueda global, categorías personalizables (icono/edición/grupos propios), respaldo JSON export/import + recordatorio, tema claro/oscuro, PWA, deshacer en borrados.

## Backlog conocido
- Notificaciones push de recordatorios (frágil en iOS PWA) — pendiente.
- **Sync: merge por-colección/por-campo** (vector clocks) para conflictos de estado rancio en la misma colección. Hoy es last-write-wins por documento con reloj monótono (mitiga sesgo de reloj, no resuelve edición divergente concurrente) — pendiente.
- Presupuestos solo mensuales.
- localStorage ~5MB a muy largo plazo.
- Tests: `lib/` cubierto con Vitest (`mergeStates`, `nextClock`, `migrate`, `goalSaved`, `accBalance`, `budgetSummary`, `materializeRecurring`). La UI (componentes/vistas) aún sin tests.

## Reglas para el asistente
Antes de cambiar algo: lee los archivos relevantes, corre `npm run build` para validar, y no metas librerías nuevas salvo que sea necesario. Mantén el estilo iOS del design system y TypeScript estricto.
