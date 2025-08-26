import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    allowedHosts: ['dm.ah2023.com'],
    hmr: {
      host: 'dm.ah2023.com',
      clientPort: 443,
      protocol: 'wss',
    },
  },
})
