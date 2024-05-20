import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';
import {
	getBaseRollupPlugins,
	resolvePackageJson,
	resolvePackagePath
} from './utils';

const { name, module, peerDependencies } = resolvePackageJson('react-dom');
// 包地址
const packagePath = resolvePackagePath(name);
// 包产物地址
const packageDistPth = resolvePackagePath(name, true);

export default [
	{
		// react-dom 包
		input: `${packagePath}/${module}`,
		output: [
			{
				file: `${packageDistPth}/index.js`,
				name: 'ReactDOM',
				format: 'umd'
			},
			{
				file: `${packageDistPth}/client.js`,
				name: 'client',
				format: 'umd'
			}
		],
		external: [...Object.keys(peerDependencies)],
		plugins: [
			...getBaseRollupPlugins(),

			// 需要一个类似 webpack resolve alias 的功能来解决 hostconfig 配置功能
			alias({
				entries: {
					hostConfig: `${packagePath}/src/hostConfig.ts`
				}
			}),

			generatePackageJson({
				inputFolder: packagePath,
				outputFolder: packageDistPth,
				baseContents: ({ name, version, description }) => ({
					main: 'index.js',
					name,
					version,
					description,
					peerDependencies: {
						react: version
					}
				})
			})
		]
	},
	{
		// test-utils 包
		input: `${packagePath}/test-utils.ts`,
		output: [
			{
				file: `${packageDistPth}/test-utils.js`,
				name: 'testUtils',
				format: 'umd'
			}
		],
		external: ['react-dom', 'react'],
		plugins: [
			...getBaseRollupPlugins(),

			// 需要一个类似 webpack resolve alias 的功能来解决 hostconfig 配置功能
			alias({
				entries: {
					hostConfig: `${packagePath}/src/hostConfig.ts`
				}
			}),

			generatePackageJson({
				inputFolder: packagePath,
				outputFolder: packageDistPth,
				baseContents: ({ name, version, description }) => ({
					main: 'index.js',
					name,
					version,
					description,
					peerDependencies: {
						react: version
					}
				})
			})
		]
	}
];
