import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['8c57-122-170-97-62.ngrok-free.app'], // Allow Ngrok host
  },
})
