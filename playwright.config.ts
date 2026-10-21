import { defineConfig } from '@playwright/test';

const basePath = process.env.BASE_PATH ?? '';
const baseURL = `http://127.0.0.1:4173${basePath}/`;

export default defineConfig({
	use: {
		baseURL,
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
		url: baseURL,
		timeout: 120_000,
		reuseExistingServer: false,
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	workers: process.env.CI ? 2 : undefined,
});
