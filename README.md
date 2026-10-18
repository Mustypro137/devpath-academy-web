# DevPath Academy

A personal web-development learning platform: read lessons, write and run code in the browser,
check your skill level, build a guided project, and practise career writing — with progress on a
dashboard.

Front-end only (no server, no login). Progress is saved in your browser, with export/import as a
backup. See [`docs/PLAN.md`](docs/PLAN.md) for the full plan and milestones.

## Tech stack

Vite · React · TypeScript · React Router · CSS Modules · Vitest · React Testing Library ·
ESLint · Prettier

## Getting started

Requires [Node.js](https://nodejs.org/) 22.22 or newer.

```bash
npm install      # download dependencies (first time only)
npm run dev      # start the dev server at http://localhost:5173
```

## Scripts

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Dev server with instant reload                          |
| `npm run build`        | Type-check, then build a production bundle into `dist/` |
| `npm run preview`      | Serve the production build locally                      |
| `npm test`             | Run all tests once                                      |
| `npm run test:watch`   | Re-run tests as you edit                                |
| `npm run lint`         | Check code for common mistakes (ESLint)                 |
| `npm run format`       | Auto-format all files (Prettier)                        |
| `npm run format:check` | Check formatting without changing files                 |
| `npm run typecheck`    | Type-check only                                         |

## Project docs

- [`docs/PLAN.md`](docs/PLAN.md) — scope, stack, milestones (source of truth)
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decision log
- [`docs/learning/`](docs/learning/) — a short learning note per milestone
