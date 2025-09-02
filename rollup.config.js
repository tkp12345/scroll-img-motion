import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ],
  plugins: [
    nodeResolve({
      browser: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react-jsx'
    }),
    terser()
  ],
  external: ['react', 'react-dom', 'framer-motion']
};