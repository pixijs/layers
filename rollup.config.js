import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import pkg from './package.json';

const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
let banner = [
    `/*!`,
    ` * ${pkg.name} - v${pkg.version}`,
    ` * Compiled ${compiled}`,
    ` *`,
    ` * ${pkg.name} is licensed under the MIT License.`,
    ` * http://www.opensource.org/licenses/mit-license`,
    ` * `,
    ` * Copyright 2017-2021, ${pkg.author}, All Rights Reserved`,
    ` */`,
].join('\n');

// External dependencies, not bundled
const external = []
    .concat(Object.keys(pkg.peerDependencies || {}))
    .concat(Object.keys(pkg.dependencies || {}));

// Use for browser bundle
const globals = {
    '@pixi/core': 'PIXI',
    '@pixi/display': 'PIXI',
    '@pixi/canvas-renderer': 'PIXI',
};

export default [
    {
        plugins: [esbuild({ target: 'ES2020' })],
        external,
        input: pkg.source,
        output: [
            {
                banner,
                dir: path.dirname(pkg.main),
                entryFileNames: '[name].js',
                format: 'cjs',
                preserveModules: true,
                sourcemap: true
            },
            {
                banner,
                dir: path.dirname(pkg.module),
                entryFileNames: '[name].mjs',
                format: 'esm',
                preserveModules: true,
                sourcemap: true
            }
        ],
    },
    {
        plugins: [esbuild({
            target: 'ES2017',
            minify: true,
        })],
        external,
        input: pkg.source,
        treeshake: false,
        output: [
            {
                banner,
                file: pkg.bundle,
                format: 'iife',
                name: pkg.namespace,
                sourcemap: true,
                globals,
            }
        ],
    }
];
