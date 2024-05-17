import path from 'path';
import fs from 'fs';
import cjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-typescript2';

const packagePath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

const resolvePackagePath = (packageName, isDist) => {
	if (isDist) {
		return `${distPath}/${packageName}`;
	}
	return `${packagePath}/${packageName}`;
};

const resolvePackageJson = (packageName) => {
	const resolvedPackagePath = `${resolvePackagePath(packageName)}/package.json`;
	const packageString = fs.readFileSync(resolvedPackagePath, {
		encoding: 'utf-8'
	});
	return JSON.parse(packageString);
};

const getBaseRollupPlugins = ({ typescript = {} } = {}) => {
	return [cjs(), ts(typescript)];
};

export { resolvePackageJson, resolvePackagePath, getBaseRollupPlugins };
