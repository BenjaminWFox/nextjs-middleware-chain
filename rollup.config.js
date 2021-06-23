// rollup.config.js
// import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'

export default {
  input: 'src/index.js',
  output: [
    {
      file: './dist/main.js',
      format: 'cjs'
    },
    {
      file: './dist/main.esm.js',
      format: 'esm'
    }
  ],
  plugins: [
    // resolve(),
    babel({ babelHelpers: 'bundled' })
  ]
}
