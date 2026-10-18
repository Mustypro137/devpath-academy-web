# Decision log

Decisions made during implementation that refine or deviate from [`PLAN.md`](PLAN.md).
Newest first.

## 2026-10-18 — M2: Vitest runs in threads, at most half the CPU cores

- **Context:** With the defaults, `npm test` crashed with "Fatal process out of memory" on this
  8-core / 16 GB machine once the lesson tests were added (one jsdom environment per test file,
  all started at once).
- **Decision:** In `vite.config.ts`, set `pool: 'threads'` and `maxWorkers: '50%'`.
- **Consequence:** Tests run a little slower but reliably. Revisit if the suite grows a lot.

## 2026-10-18 — M2: Lesson content format details

- **Context:** The plan lists the block types as `text | code | callout | heading`.
- **Decision:**
  - Added a fifth block type, `list` (bullet points), because almost every lesson needed one.
  - Inline code inside text is written with `backticks`, rendered by `InlineText` as `<code>`.
    This is the only formatting inside text: no Markdown parser, as decided in the plan.
  - Lessons have Previous / Next links that follow course order across modules.
- **Safety:** All text is rendered by React as text (never as HTML), so a `<script>` in lesson
  data shows on screen and never runs. A content test fails on an unclosed backtick.

## 2026-10-18 — M1: React Router 8 needs Node 22.22+

- **Context:** `react-router@8` declares `"node": ">=22.22.0"`. This machine has Node 22.17.1.
  Everything works today (tests, build, dev server), but it's officially unsupported.
- **Decision:** Keep React Router 8 and raise the README requirement to Node 22.22+.
- **Action for the owner:** update Node to the latest 22.x (or 24 LTS) from nodejs.org.

## 2026-10-18 — M1: Theme preference stored outside `features/progress`

- **Context:** The plan says `features/progress/` is the only place that reads/writes saved
  progress. The light/dark choice is a display preference, not learning progress.
- **Decision:** `features/theme/` stores it under its own localStorage key, `devpath-theme`.
- **Consequence:** Export/import (M3) will not include the theme. That is intended.

## 2026-10-18 — M1: One `Sidebar` instead of separate `Sidebar` + `MobileNav`

- **Context:** The plan lists both components.
- **Decision:** A single `Sidebar` renders the nav links once. CSS shows it as a dropdown under the
  header on phones and as a fixed sidebar from 768px up.
- **Why:** One list of links means no duplicate markup to keep in sync, and screen readers
  never see two "Main" navigation landmarks.

## 2026-10-18 — M0: ESLint 10 without `eslint-plugin-jsx-a11y`

- **Context:** The current Vite template ships with oxlint, but the plan specifies ESLint. We kept
  ESLint (larger plugin ecosystem, matches the plan). `eslint-plugin-jsx-a11y` only supports ESLint
  ≤ 9, and ESLint 9 is end-of-life (no more fixes).
- **Decision:** Use ESLint 10 and leave out `jsx-a11y` for now.
- **Consequence:** Accessibility is not linted automatically yet. It is still covered by manual
  review and the axe audit in M10.
- **Revisit:** Add `jsx-a11y` back when it releases ESLint 10 support
  (check with `npm view eslint-plugin-jsx-a11y peerDependencies`).

## 2026-10-18 — M0: Tool versions

Starting versions: Vite 8, React 19, TypeScript 6, Vitest 5, ESLint 10, Prettier 3, Node 22.
