import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';
import { resolvePackagePath } from '../rollup/utils';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		replace({
			__DEV__: true,
			preventAssignment: true
		})
	],
	resolve: {
		alias: [
			{
				find: 'react',
				replacement: resolvePackagePath('react')
			},
			{
				find: 'react-dom',
				replacement: resolvePackagePath('react-dom')
			},
			{
				find: 'hostConfig',
				replacement: path.resolve(
					resolvePackagePath('react-dom'),
					'./src/hostConfig.ts'
				)
			}
		]
	}
});
