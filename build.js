import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'index.js',
  dest: 'build/fermat.js',
  format: 'cjs',
  plugins: [
    resolve({
      module: true,
      preferBuiltins: false,
      modulesOnly: true
    })
  ]
};
