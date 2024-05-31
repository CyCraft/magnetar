import vue from '@vitejs/plugin-vue'
import { execa } from 'execa'
import path from 'node:path'
import { defineConfig, Plugin } from 'vite'
import pkg from './package.json' assert { type: 'json' }

const dependencies = Object.keys(pkg.dependencies || [])

export function pluginDts(): Plugin {
  return {
    name: 'vue-tsc',
    writeBundle: {
      sequential: true,
      order: 'post',
      async handler() {
        await execa({
          cwd: path.resolve('./'),
          stdout: 'inherit',
        })`vue-tsc --declarationDir ./dist --emitDeclarationOnly --declaration`
      },
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pluginDts()],
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MagnetarUi',
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', ...dependencies],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
