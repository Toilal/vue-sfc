import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import eslint from '@rollup/plugin-eslint'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-node-polyfills'

let name = require('./package.json').main.replace(/\.js$/, '')
const browser = !!process.env.BROWSER
if (browser) {
  name += '.browser'
}

const bundle = config => ({
    ...config,
    input: 'src/index.ts',
    //... browser ? {} : { external: id => !/^[./]/.test(id) }
  }
)

export default [
  bundle({
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.BROWSER': !!process.env.BROWSER,
        ...browser ? {
          ' from \'./node': ' from \'./browser',
          ' from "./node': ' from "./browser'
        } : {}
      }),
      eslint(),
      esbuild({
        tsconfig: '../../tsconfig.json'
      }),
      ...browser ? [
        nodePolyfills(),
        nodeResolve({
          browser: true
        })] : [
        nodeResolve()
      ],
    ],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
  }),
]
