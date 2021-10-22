// rollup.config.js
// import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
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
  // external: [/@babel\/runtime/],
  plugins: [
    // resolve(),
    // commonjs(),
    babel(
      {
        babelHelpers: 'runtime',
        plugins: [
          '@babel/transform-runtime',
        ]
      }
    )
  ]
}
