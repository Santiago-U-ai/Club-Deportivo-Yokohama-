import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Orígenes permitidos en `connect-src`. Si la API se sirve en el mismo
 * dominio (ruta relativa como `/api`) basta con 'self'.
 */
const connectSources = (env) => {
  const raw = String(env.VITE_API_URL || '').trim()

  if (!raw || raw.startsWith('/')) return "'self'"

  try {
    return `'self' ${new URL(raw).origin}`
  } catch {
    return "'self'"
  }
}

const cspPlugin = (connect) => ({
  name: 'yokohama-csp',
  apply: 'build',
  transformIndexHtml(html) {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      // Barlow / Barlow Condensed se cargan desde Google Fonts (App.css).
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src ${connect}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // `frame-ancestors` se ignora en un <meta>; el anti-clickjacking se
      // aplica con la cabecera X-Frame-Options: DENY de vercel.json.
      "upgrade-insecure-requests",
    ].join('; ')

    return html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
    )
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), cspPlugin(connectSources(env))],
    build: {
      sourcemap: false,
    },
  }
})
