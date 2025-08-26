import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // allow the Cloudflare hostname:
    allowedHosts: ['app.ah2023.com'],
    // make HMR use your public host over 443 (works behind the tunnel)
    hmr: {
      host: 'app.ah2023.com',
      clientPort: 443,
      protocol: 'wss',
    },
  },
})
