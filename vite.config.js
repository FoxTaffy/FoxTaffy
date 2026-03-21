import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
// Убираем все настройки AWS SDK
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      'vue',
      'vue-router',
      'lodash-es'
    ]
  },
  // esbuild встроен в Vite — быстрее terser в 20×, без доп. зависимостей.
  // drop: ['console', 'debugger'] убирает все console.log из prod-бандла.
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: false, // не считать gzip при каждом билде (ускоряет ~1-2с)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          supabase: ['@supabase/supabase-js'],
          fontawesome: [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/vue-fontawesome',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-brands-svg-icons'
          ],
          utils: ['lodash-es', 'uuid']
        }
      }
    }
  },
  server: {
    port: 5000,
    host: true,
    fs: {
      strict: false
    },
    proxy: {
      // PostgREST (local dev)
      '/rest/v1': {
        target: 'http://localhost:3001',
        rewrite: path => path,
        changeOrigin: true
      },
      // Upload API (local dev)
      '/upload': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      // MinIO public files (local dev)
      '/s3': {
        target: 'http://localhost:9000',
        rewrite: path => path.replace(/^\/s3/, ''),
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})