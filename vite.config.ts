import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { authCookieProxyPlugin } from './vite-plugins/auth-cookie-proxy'

// Vite dev/preview server proxies API traffic and stores auth tokens in HttpOnly cookies.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'https://3ed4-185-139-137-95.ngrok-free.app'

  return {
    plugins: [vue(), vueDevTools(), authCookieProxyPlugin(apiTarget)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
