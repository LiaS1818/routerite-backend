// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettierConfig,
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		rules: {
			// Configuración para tabulaciones
			indent: ['error', 'tab', { SwitchCase: 1 }],
			'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],

			// Reglas de TypeScript con severidad reducida para desarrollo
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',

			// Reglas de formateo consistentes con Prettier
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'comma-dangle': ['error', 'always-multiline'],
			'object-curly-spacing': ['error', 'always'],

			// Otras reglas útiles
			'no-console': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	}
);
