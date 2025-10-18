import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets', // Use lowercase assets folder
    copyPublicDir: true,
  },
  base: './', // Important for Electron
  publicDir: 'public', // Explicitly set public directory
  define: {
    // Define process for compatibility with Next.js dependencies
    'process.env': {},
    'process.platform': JSON.stringify('win32'),
    'process.version': JSON.stringify('v18.0.0'),
  },
})
