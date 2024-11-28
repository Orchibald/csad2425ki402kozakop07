import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'electron/electron.js',
    }),
    
  ],
  base: './',
  build: {
    outDir: 'dist', // або 'build', залежно від вашої конфігурації
  },
})