// rollup.config.js

export default {
  input: 'src/index.js',
  output: [
    {
      file: './build/main.js',
      format: 'cjs'
    },
    {
      file: './build/main.esm.js',
      format: 'esm'
    }
  ]
}
