import tailwindcss from '@tailwindcss/vite';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	fmt: {
		bracketSameLine: true,
		htmlWhitespaceSensitivity: 'ignore',
		printWidth: 100,
		quoteProps: 'preserve',
		singleAttributePerLine: true,
		singleQuote: true,
		useTabs: true,
		sortPackageJson: false,
		sortTailwindcss: { stylesheet: './src/routes/layout.css' },
		svelte: true,
		ignorePatterns: [
			'.vscode/',
			'bun.lock',
			'package-lock.json',
			'yarn.lock',
			'*.md',
			'static/',
			'*.yml',
			'scraper/',
			'src/nesCarts.json',
			'docs/',
		],
	},
	plugins: lazyPlugins(() => [
		tailwindcss(),
		sveltekit({
			preprocess: [vitePreprocess({})],
			prerender: {
				handleHttpError: ({ path, message, status }) => {
					if (status === 404 && path.endsWith('.webp')) return;
					throw new Error(message);
				},
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				precompress: true,
				strict: true,
			}),
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` },
		}),
	]),
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
				},
			},

			{
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
});
