import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({ pages: 'build', assets: 'build', precompress: true, strict: true }),
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` },
		}),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'scraper/**/*.{test,spec}.ts'],
	},
});
