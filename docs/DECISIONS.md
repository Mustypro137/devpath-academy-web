# Decision log

Decisions made during implementation that refine or deviate from [`PLAN.md`](PLAN.md).
Newest first.

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
