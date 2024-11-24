import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import svgr from 'vite-plugin-svgr'
import compression from 'vite-plugin-compression'
import reactRefresh from '@vitejs/plugin-react-refresh'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

interface Params {
  mode: 'production' | 'development'
}
// https://vitejs.dev/config/
export default ({ mode }: Params) =>
  defineConfig({
    base: mode === 'production' ? '/surfe-notes-app/' : '/',
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      svgr(),
      mode === 'production' && compression(), //gzip by default, only in production
      reactRefresh(),
    ].filter(Boolean), // filter out any falsey values from the plugins array
    resolve: {
      alias: {
        '@src': resolve(__dirname, './src'),
        '@api': resolve(__dirname, './src/api'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@components': resolve(__dirname, './src/components'),
        '@utils': resolve(__dirname, './src/utils'),
        '@assets': resolve(__dirname, './src/assets'),
        '@pages': resolve(__dirname, './src/pages'),
        '@types': resolve(__dirname, './src/types'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      sourcemap: true,
      dynamicImportVarsOptions: {
        exclude: [],
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
      modules: {
        localsConvention: 'camelCase',
      },
    },
  })
