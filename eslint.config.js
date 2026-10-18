// ESLint "flat config": an array of config objects, applied in order.
// Later entries override earlier ones.
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // Never lint build output or installed packages.
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended, // core JavaScript mistakes
      tseslint.configs.recommended, // TypeScript-specific mistakes
      reactHooks.configs.flat['recommended-latest'], // the "Rules of Hooks"
      reactRefresh.configs.vite, // keeps hot-reload working in Vite
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // Must be last: turns off style rules that would fight with Prettier.
  prettier,
])
