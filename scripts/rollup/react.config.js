import generatePackageJson from 'rollup-plugin-generate-package-json';
import {
	getBaseRollupPlugins,
	resolvePackageJson,
	resolvePackagePath
} from './utils';

const { name, module } = resolvePackageJson('react');
const packagePath = resolvePackagePath(name);
const packageDistPth = resolvePackagePath(name, true);

export default [
	{
		// react 包
		input: `${packagePath}/${module}`,
		output: {
			file: `${packageDistPth}/index.js`,
			name: 'index.js',
			format: 'umd'
		},
		plugins: [
			...getBaseRollupPlugins(),
			generatePackageJson({
				inputFolder: packagePath,
				outputFolder: packageDistPth,
				baseContents: ({ name, version, description }) => ({
					name,
					version,
					description,
					main: 'index.js'
				})
			})
		]
	},
	{
		input: `${packagePath}/src/jsx.ts`,
		output: [
			{
				// jsx-runtime 包
				file: `${packageDistPth}/jsx-runtime.js`,
				name: 'jsx-runtime.js',
				format: 'umd'
			},
			{
				// jsx-dev-runtime 包
				file: `${packageDistPth}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime.js',
				format: 'umd'
			}
		],
		plugins: getBaseRollupPlugins()
	}
];
