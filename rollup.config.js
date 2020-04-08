import typescript from 'rollup-plugin-typescript2';

const baseBundle = {
  input: './index.ts',
  plugins: [typescript()],
};

export default [
  {
    ...baseBundle,
    output: {
      file: 'dist/fermat.cjs.js',
      format: 'cjs'
    }
  },
  {
    ...baseBundle,
    output: {
      file: 'dist/fermat.esm.js',
      format: 'esm'
    }
  }
];
