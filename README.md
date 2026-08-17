# Finanzas

App de control de ingresos y gastos. **Vite + React + TypeScript**, con sincronización opcional en la nube vía **Supabase** y soporte **PWA** (instalable en el celular, funciona offline).

## Stack

- **Vite** (bundler + dev server)
- **React 18 + TypeScript**
- **Zustand** para el estado global
- **Supabase** (Auth + Postgres) para login y sincronización entre dispositivos
- **vite-plugin-pwa** para instalación e íconos

## Requisitos

- Node.js 18+ (recomendado 20)

## Desarrollo

```bash
npm install      # instala dependencias
npm run dev      # servidor local en http://localhost:5173
```

Otros comandos:

```bash
npm run build     # compila a dist/ (typecheck + bundle)
npm run preview   # sirve el build de producción
npm run typecheck # solo verifica tipos
```

## Configuración de Supabase (opcional)

La app funciona **100% local** si no hay credenciales. Para activar login + sincronización,
pon tus valores en `.env` (ya incluidos en este proyecto; la *publishable key* es pública por diseño):

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

Y crea la tabla con seguridad por usuario en Supabase → **SQL Editor**:

```sql
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb       not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
create policy "own_select" on public.user_data for select using (auth.uid() = user_id);
create policy "own_insert" on public.user_data for insert with check (auth.uid() = user_id);
create policy "own_update" on public.user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.user_data for delete using (auth.uid() = user_id);
```

En **Authentication → Providers → Email**: desactiva *Confirm email* (login instantáneo) y,
cuando ya tengan sus cuentas, desactiva *Allow new users to sign up*.

## Despliegue a GitHub Pages (automático)

1. Sube este proyecto a un repositorio de GitHub.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `git push` a `main` compila y publica solo (workflow en `.github/workflows/deploy.yml`).

El `base` de Vite es `./` (rutas relativas), así que funciona en `usuario.github.io/repo/` sin configuración extra.

## Estructura

```
src/
  main.tsx            # entrada, registra el service worker (PWA)
  App.tsx             # orquesta tema, sesión y vistas
  store.ts            # estado global (zustand) + persistencia + sync
  types.ts            # tipos del dominio
  index.css           # estilos (design system iOS)
  lib/                # lógica pura y servicios
    constants, format, storage, migrate, calc, recurring,
    period, supabase, sync, dataOps
  components/         # Nav, TabBar, Login, Sheet, Toast, BackupBanner, ...
  views/              # Inicio, Movimientos, Presupuestos, Reportes, Ajustes
  sheets/             # formularios (bottom sheets)
  charts/             # Donut, TrendChart (SVG)
```

## Datos

Todo el estado se guarda como un JSON por usuario. Los datos locales viven en `localStorage`
y, en modo nube, se sincronizan con Supabase (última escritura gana). Puedes exportar/importar
un respaldo JSON desde **Ajustes → Datos** en cualquier momento.
