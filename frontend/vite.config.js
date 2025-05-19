import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    },
    allowedHosts: [
    'weather-app.local',
    'localhost',
    '.local' // Allow all .local domains
  ]
  },
  optimizeDeps: {
    exclude: ['react-icons', 'date-fns', 'react-query'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  }
})
