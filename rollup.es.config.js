import sourcemaps from 'rollup-plugin-sourcemaps';
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const path = require('path');
const utilDir = path.resolve(__dirname, 'util');
export default {
    output: {
        format: 'es',
        sourcemap: true
    },
    plugins: [
        replace({
            values: {
                'PACKAGE_NAME': JSON.stringify(pkg.name),
                'PACKAGE_VERSION': JSON.stringify(pkg.version),
                'AUTH_JS': JSON.stringify({
                    minSupportedVersion: '5.3.1'
                }),
            },
            preventAssignment: true
        }),
        sourcemaps(),
        license({
            sourcemap: true,
            banner: {
                content: {
                    file: path.join(utilDir, 'license-template.txt'),
                    encoding: 'utf-8',
                }
            }
        })
    ],
    onwarn: () => { return; }
};
