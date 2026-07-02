import { fileURLToPath } from 'url'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    }),
    tailwindcss()
  ],

  server: {
    host: '0.0.0.0',
    allowedHosts: ['frontend']
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, './src/data'),
      '@common': path.resolve(__dirname, './src/common/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@admin': path.resolve(__dirname, './src/features/admin'),
    },
  },
})
