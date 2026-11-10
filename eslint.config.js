import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
	{ ignores: ['node_modules/**', 'build/**', '.svelte-kit/**', 'test-results/**'] },
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	{
		files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: { parser: ts.parser },
		},
	},
	{
		files: ['**/*.svelte'],
		rules: { '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^\\$\\$' }] },
	},
];
