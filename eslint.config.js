import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'coverage/**', 'dist/**', 'build/**', 'next-env.d.ts']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      '@next/next': nextPlugin
    },
    rules: {
      ...tsEslintPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@next/next/no-img-element': 'warn'
    }
  },
  {
    files: ['tests/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@next/next/no-assign-module-variable': 'off'
    }
  }
]
