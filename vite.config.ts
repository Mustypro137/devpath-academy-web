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
    // Limit memory use: run test files in threads (lighter than separate processes), and at most
    // half as many at once as there are CPU cores. The defaults ran out of memory on an
    // 8-core / 16 GB machine ("Fatal process out of memory"); see docs/DECISIONS.md.
    pool: 'threads',
    maxWorkers: '50%',
  },
})
