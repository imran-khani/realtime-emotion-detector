import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase size limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'face-api': ['face-api.js']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'face-api': ['face-api.js']
    }
  },
  // Properly expose environment variables
  define: {
    'process.env': {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    }
  }
})
