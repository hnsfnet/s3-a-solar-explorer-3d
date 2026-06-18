import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      port: Number(env.VITE_PORT) || 26641,
      strictPort: false,
      open: false,
    },
    preview: {
      port: Number(env.VITE_PORT) || 26641,
      strictPort: false,
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'SolarExplorer3D',
        formats: ['es'],
        fileName: (format) => `solar-explorer-3d.${format}.js`,
      },
      rollupOptions: {
        external: ['three', 'chart.js'],
        output: {
          globals: {
            three: 'THREE',
            'chart.js': 'Chart',
          },
        },
      },
    },
  }
})
