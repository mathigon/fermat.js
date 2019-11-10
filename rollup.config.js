const typescript = require('rollup-plugin-typescript');

module.exports = {
  input: './index.ts',
  plugins: [typescript(require('./tsconfig.json').compilerOptions)],
  output: {
    file: 'dist/fermat.js',
    format: 'cjs',
    name: 'app'
  }
};
