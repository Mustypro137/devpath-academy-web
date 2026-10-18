import react from '@vitejs/plugin-react'
// Importing defineConfig from 'vitest/config' (instead of 'vite') lets this one file
// configure both the Vite dev server/build AND the Vitest test runner.
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // a simulated browser (document, window) inside Node
    setupFiles: ['./src/test/setup.ts'],
  },
})
