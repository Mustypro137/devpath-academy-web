# M0 — Project setup: learning notes

## npm and `package.json`

- **npm** is Node's package manager. It downloads libraries ("packages") into `node_modules/`.
- **`package.json`** describes the project: its name, its **scripts** (shortcuts like `npm run dev`),
  and its dependencies.
  - `dependencies` ship to users' browsers (React).
  - `devDependencies` are only used while developing (Vite, TypeScript, ESLint, Vitest).
- **`package-lock.json`** records the _exact_ version of every package installed, so everyone gets
  the same install. Commit it; never edit it by hand.
- **Version ranges:** `^19.2.8` means "19.2.8 or any newer 19.x". `~6.0.2` means "6.0.x only".
- **Peer dependencies:** a plugin says which versions of its host tool it works with. We hit this:
  `jsx-a11y` didn't support ESLint 10. Don't silence these with `--force`; resolve them deliberately
  (see `docs/DECISIONS.md`).
- `node_modules/` is never committed. `npm install` rebuilds it from the lock file.

## Build steps

Browsers can't run TypeScript or JSX directly. So:

1. `npm run dev` — Vite serves your files and translates them on the fly. Edits show up instantly
   (hot module replacement).
2. `npm run build` — first `tsc -b` **type-checks** (finds errors; outputs nothing), then
   `vite build` **bundles** everything into small, optimised files in `dist/`. `dist/` is what gets
   deployed.
3. `npm run preview` — serves `dist/` locally so you can test the real production build.

## TypeScript vs JavaScript

- TypeScript = JavaScript + **types**. Types describe the shape of data
  (`{ id: string; title: string }`).
- Types are checked **before** the code runs, then removed. The browser only ever sees JavaScript.
- Example win: misspell `lesson.titel` and TypeScript reports it in the editor, instead of you
  seeing `undefined` on the page later.

## `tsconfig` files

- `tsconfig.json` — just points at the two configs below ("project references").
- `tsconfig.app.json` — settings for our app code in `src/` (browser + DOM types, JSX).
- `tsconfig.node.json` — settings for `vite.config.ts`, which runs in Node, not the browser.
- Key options: `"strict": true` (strongest checking), `"noEmit": true` (TS only checks; Vite does
  the building), `"noUnusedLocals"` (flags dead variables).

## Lint, format, test

- **ESLint** (`npm run lint`) finds likely bugs, such as breaking the Rules of Hooks.
- **Prettier** (`npm run format`) handles formatting only (quotes, spacing, line length), so code
  style is never debated.
- **Vitest** (`npm test`) runs tests. **jsdom** fakes a browser inside Node. **React Testing
  Library** finds elements the way a user does: by role and visible text.

## Git basics

- A **repository** tracks the history of your files. A **commit** is a saved snapshot with a message.
- `git status` (what changed?) → `git add <files>` (stage) → `git commit -m "msg"` (snapshot).
- A **branch** is a separate line of work. `main` always works. Each milestone gets its own branch
  (`m0-project-setup`), and it is merged into `main` after review.
- `.gitignore` lists files Git must ignore (`node_modules`, `dist`).
- `.gitattributes` makes Git store LF line endings, so Windows/Mac differences don't show up as
  fake changes.
- A **remote** (GitHub) is a copy of the repo online: `git push` uploads, `git pull` downloads.
