import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
export default {
  input: 'src/vue-data-proxy.js', // Path relative to package.json
  output: {
    name: 'vueDataProxy',
    exports: 'named',
  },
  plugins: [
    buble(), // Transpile to ES5
  ],
};
