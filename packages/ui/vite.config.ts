/* eslint-disable tree-shaking/no-side-effects-in-initialization */
import vue from '@vitejs/plugin-vue'
import ExecSh from 'exec-sh'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, Plugin } from 'vite'
// @ts-ignore
import pkg from './package.json' assert { type: 'json' }
const { promise: ExecShPromise } = ExecSh

function execSh(command: string) {
  return ExecShPromise(command, { cwd: path.resolve('./') })
}

const DIR = typeof __dirname === 'undefined' ? dirname(fileURLToPath(import.meta.url)) : __dirname

const nameCamel = pkg.name
const namePascal = nameCamel.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase())
const dependencies = Object.keys(pkg.dependencies || [])

export function pluginDts(): Plugin {
  return {
    name: 'vue-tsc',
    writeBundle: {
      sequential: true,
      order: 'post',
      async handler({ format }) {
        if (format === 'cjs') {
          await execSh('vue-tsc --declarationDir ./dist/cjs --declaration --emitDeclarationOnly')
          fs.rename(
            path.resolve(DIR, 'dist/cjs/index.d.ts'),
            path.resolve(DIR, 'dist/cjs/index.d.cts'),
            console.error
          )
        } else {
          await execSh('vue-tsc --declarationDir ./dist/es --declaration --emitDeclarationOnly')
        }
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
      name: namePascal,
      formats: ['es', 'cjs'],
      fileName: (format, name) => {
        if (format === 'cjs') {
          return `cjs/${name.replace(/\.vue$/, '')}.js`
        } else {
          return `es/${name.replace(/\.vue$/, '')}.js`
        }
      },
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
