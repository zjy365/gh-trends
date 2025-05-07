import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: process.env.NODE_ENV === 'production',
    outExtension({ format }) {
      return { js: format === 'esm' ? '.mjs' : '.cjs' }
    }
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    treeshake: true,
    minify: process.env.NODE_ENV === 'production',
    noExternal: ['commander', 'chalk', 'ora', 'table'],
    outExtension() {
      return { js: '.cjs' }
    }
  }
])
