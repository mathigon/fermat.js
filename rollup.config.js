import typescript from '@rollup/plugin-typescript';

const options = {
  input: './index.ts',
  plugins: [typescript()],
  external: ['@mathigon/core']
};

module.exports = [
  {...options, output: {file: 'dist/fermat.cjs.js', format: 'cjs'}},
  {...options, output: {file: 'dist/fermat.esm.js', format: 'esm'}}
];
