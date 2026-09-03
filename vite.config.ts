import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base './' => funciona en GitHub Pages sin importar el nombre del repo
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png'],
      // xlsx (SheetJS) es un chunk pesado de carga diferida, solo se usa al importar Excel.
      // Se excluye del precache para no engordar la instalación de TODOS los usuarios; se
      // descarga por red la primera vez que alguien importa (acción puntual, online).
      workbox: { globIgnores: ['**/xlsx-*.js'] },
      manifest: {
        name: 'Finanzas',
        short_name: 'Finanzas',
        description: 'Control de ingresos y gastos',
        theme_color: '#f2f2f7',
        background_color: '#f2f2f7',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
