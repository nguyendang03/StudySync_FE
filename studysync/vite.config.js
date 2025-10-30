import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://studysync-be.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // keep /api prefix
      },
      '/socket.io': {
        target: 'https://studysync-be.onrender.com',
        changeOrigin: true,
        ws: true,
        secure: true,
      },
    },
  },
})
