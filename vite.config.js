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
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
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
    port: 5173,
    host: true,
    fs: {
      strict: false
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})