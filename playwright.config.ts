import type { PlaywrightTestConfig } from '@playwright/test';

const siteUrl = `http://127.0.0.1:4173${process.env.BASE_PATH ?? ''}/`;

const config: PlaywrightTestConfig = {
	use: { baseURL: siteUrl },
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
		url: siteUrl,
		timeout: 120_000,
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
