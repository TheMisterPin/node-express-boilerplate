import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { noImportExtensions } from './eslint-rules/no-import-extensions.mjs'

export default tseslint.config(
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'*.config.js',
			'*.config.cjs',
		],
	},

	js.configs.recommended,

	...tseslint.configs.recommended,

	{
		files: ['src/**/*.ts'],

		plugins: {
			local: {
				rules: {
					'no-import-extensions': noImportExtensions,
				},
			},
			'simple-import-sort': simpleImportSort,
		},

		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.node,
			},
		},

		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			'@typescript-eslint/no-explicit-any': 'warn',

			'no-console': 'off',

			semi: ['error', 'never'],

			quotes: ['error', 'single', { avoidEscape: true }],

			'local/no-import-extensions': 'error',

			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			'padding-line-between-statements': [
				'error',
				{ blankLine: 'any', prev: 'import', next: 'import' },
				{ blankLine: 'always', prev: '*', next: 'return' },
				{
					blankLine: 'always',
					prev: '*',
					next: ['function', 'const', 'let', 'var', 'export'],
				},
			],

			'brace-style': ['error', 'allman', { allowSingleLine: false }],
		},
	},

	eslintConfigPrettier,

	{
		files: ['src/**/*.ts'],
		rules: {
			'padding-line-between-statements': [
				'error',
				{ blankLine: 'any', prev: 'import', next: 'import' },
				{ blankLine: 'always', prev: '*', next: 'return' },
				{
					blankLine: 'always',
					prev: '*',
					next: ['function', 'const', 'let', 'var', 'export'],
				},
			],
			'brace-style': ['error', 'allman', { allowSingleLine: false }],
		},
	},
)
