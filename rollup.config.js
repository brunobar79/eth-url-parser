import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import resolve from 'rollup-plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';

import package_ from './package.json';

const bundle = (config) => ({
    ...config,
    input: './src/index.ts',
    external: (id) => !/^[./]/.test(id),
});

export default [
    bundle({
        output: [
            {
                file: package_.main,
                format: 'cjs',
            },
            {
                file: package_.module,
                format: 'es',
            },
        ],
        plugins: [
            external(),
            esbuild(),
            babel({
                exclude: 'node_modules/**',
            }),
            resolve(),
            commonjs(),
        ],
    }),
    bundle({
        plugins: [dts()],
        output: {
            file: 'dist/index.d.ts',
            format: 'es',
        },
    }),
];
