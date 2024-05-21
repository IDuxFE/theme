import { resolve } from 'path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import pkg from './package.json'

const externalDeps = ['echarts', 'lodash-es', 'vue', 'vue-demi', '@idux']

const globalsMap: Record<string, string> = {
  '@idux/theme': 'IduxTheme',
  'lodash-es': '_',
  vue: 'Vue',
  'vue-demi': 'VueDemi',
}
export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    plugins: [dts(), vue()],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'index.ts'),
        name: 'IduxTheme',
        fileName: 'index',
      },
      rollupOptions: {
        external: (id: string) => externalDeps.some(k => new RegExp('^' + k).test(id)),
        output: {
          globals: (id: string) => {
            return globalsMap[id] || id
          },
        },
      },
    },
    define: {
      __DEV__: !isBuild,
      __VERSION__: pkg.version,
    }
  }
})