import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    external: ['uuid'],
    input: 'src/index.ts',
    output: [
      ...(['esm', 'cjs'].map((format) => ({
        file: `dist/index.${format}.js`,
        format,
        sourcemap: true,
      }))),

    ],
    plugins: [esbuild()],
  },
  {
    external: ['uuid'],
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]
