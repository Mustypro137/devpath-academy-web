# DevPath Academy — Approved Implementation Plan

Phase 1 (Planning) was completed and approved on 2026-10-18.
This file is the source of truth for scope, stack, and milestones. Update it when a decision changes.

---

## How to use this file (for Claude Code sessions)

- Read this file before starting any milestone.
- This is a **learning project**: explain each decision and command in simple English before doing it.
- Work **one milestone at a time**. Stop at the end of each milestone for review and approval before merging.
- Do not implement features from the "Later releases" list unless the owner explicitly approves.
- Note: the original master prompt was not supplied. This plan is the specification.

---

## 1. Product summary

DevPath Academy is a personal web-development learning platform. The learner reads real lessons,
writes and runs code in the browser, checks their skill level, builds a guided project, and practises
career/written communication — with all progress shown on a dashboard.

**Primary users**

1. The owner as a learner — self-taught, studying HTML/CSS/JavaScript, preparing for a developer job.
2. The owner as developer/content author — adds lessons and exercises, so content must be easy to add.
3. (Later) other learners — which is why accounts/sync are deferred, not designed out.

---

## 2. MVP definition

> A front-end-only web app. No server, no database, no login. Content lives in code as typed data;
> progress is saved in the browser (localStorage) with export/import as a backup.

MVP includes:

- Responsive layout (sidebar on desktop, collapsible menu on mobile) and a dashboard
- ~3 modules (HTML, CSS, JavaScript), 3–5 lessons each
- JavaScript skill assessment (~15 questions) with a recommended starting point
- Coding exercises: editor, Run, automatic tests, step-by-step hints, saved submissions, revealable solution
- Basic progress tracking: lessons completed, exercises passed, assessment score, project milestones
- One practical project (Personal Task Tracker, vanilla JS) with 5–6 milestones and checklists
- Career & writing area: prompts, writing editor with word count, self-review checklist, saved drafts
- Export/import progress as a JSON file

---

## 3. MVP vs. later releases

| MVP                                               | Later releases                                            |
| ------------------------------------------------- | --------------------------------------------------------- |
| Static lessons for HTML, CSS, JS                  | More tracks (React, TypeScript, Git, Node, SQL)           |
| JS exercises with automatic tests                 | Exercises in other languages (needs a server-side runner) |
| HTML/CSS exercises with live preview + DOM checks | Visual pixel-diff grading                                 |
| One fixed-question assessment                     | Adaptive assessment, question banks, timed mode           |
| localStorage progress + export/import             | Accounts, cloud sync, multiple devices                    |
| One project with milestone checklists             | Multiple projects, GitHub linking, portfolio page         |
| Writing prompts + self-review checklist           | AI feedback on writing/code (needs API key + backend)     |
| Simple dashboard stats                            | Streaks, charts, spaced repetition, badges                |
| Light/dark theme (CSS only)                       | Notifications, reminders, email                           |
| —                                                 | Admin/content editor UI, community, payments              |

---

## 4. Approved decisions

| #   | Decision          | Approved choice                                                                                                                   |
| --- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Backend           | **None for MVP** — browser storage + export/import                                                                                |
| 2   | Stack             | **Vite + React + TypeScript + React Router + plain CSS (CSS Modules) + Vitest + React Testing Library** (Playwright added in M10) |
| 3   | Content format    | **Typed TypeScript data files** (no Markdown parser)                                                                              |
| 4   | Code editor       | **CodeMirror 6** (from M4)                                                                                                        |
| 5   | Hosting           | **Netlify** (with SPA redirect rule)                                                                                              |
| 6   | Version control   | **Git + a GitHub repository** created in M0                                                                                       |
| 7   | Practical project | **Personal Task Tracker (vanilla JS)**                                                                                            |
| 8   | Folder            | **`C:\Users\hp\Desktop\projects\devpath-academy-web`** (the separate Python project `devpath-academy` must not be touched)        |
| 9   | Spec              | No master prompt supplied — **this plan is the spec**                                                                             |
| 10  | Workflow          | Explain first → small changes → stop after each milestone → owner approves before merge                                           |

### Stack rationale (simple English)

- **Vite** — dev server + production build; fast, minimal config.
- **React** — build the UI from reusable components; most in-demand front-end skill.
- **TypeScript** — content has a fixed shape; TS catches mistakes (like a misspelled field) before the browser does.
- **React Router** — real URLs per page so Back, refresh, and bookmarks work.
- **Plain CSS + CSS Modules** — learn real CSS (Flexbox, Grid, variables, media queries); styles scoped per component.
- **Web Worker** (built-in) — runs exercise JS off the main page so infinite loops can be killed.
- **Sandboxed iframe** (built-in) — isolates HTML/CSS previews from the app.
- **localStorage** (built-in) — free, no setup, offline.
- **Vitest + React Testing Library** — tests that work natively with Vite and test like a user.
- **Playwright** (M10) — end-to-end tests in a real browser.
- **ESLint + Prettier** — catch common bugs, consistent formatting.

**Deliberately avoided:** Redux, Tailwind/UI kits, Next.js, any database. Target ~4 runtime dependencies
(react, react-dom, react-router, CodeMirror).

---

## 5. Folder structure

```
devpath-academy-web/
├─ public/                  # Static files served as-is
├─ src/
│  ├─ main.tsx              # Entry point
│  ├─ App.tsx               # Routes + layout
│  ├─ routes/               # One component per page
│  ├─ components/           # Reusable UI (Button, Card, ProgressBar, CodeEditor)
│  │  └─ layout/            # AppShell, Sidebar, Header, MobileNav
│  ├─ features/
│  │  ├─ lessons/
│  │  ├─ exercises/         # Includes the code runner (worker + iframe)
│  │  ├─ assessment/
│  │  ├─ project/
│  │  ├─ career/
│  │  └─ progress/          # The ONLY place that reads/writes saved progress
│  ├─ content/              # Course material as typed data
│  │  ├─ lessons/
│  │  ├─ exercises/
│  │  ├─ assessment.ts
│  │  ├─ project.ts
│  │  └─ writingPrompts.ts
│  ├─ types/                # Shared TS types
│  ├─ styles/               # Reset, design tokens, themes
│  └─ test/                 # Test setup and helpers
├─ e2e/                     # Playwright tests (M10)
├─ docs/                    # This plan, decision log, learning notes
└─ package.json, tsconfig.json, vite.config.ts, README.md
```

Key principles: content is separated from code; `features/progress/` is the single storage adapter,
so a real backend later only changes that folder.

---

## 6. Pages, components, data models, journeys

### Routes

| URL                            | Page                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| `/`                            | Dashboard — overview, continue where you left off, next suggestion |
| `/learn`                       | Course map with completion checkmarks                              |
| `/learn/:lessonId`             | Lesson reader + Mark complete + related exercises                  |
| `/exercises/:exerciseId`       | Instructions, editor, Run, results, hints, solution                |
| `/assessment`                  | Intro → questions → results + recommendation                       |
| `/project`                     | Project overview + milestone checklists                            |
| `/career`, `/career/:promptId` | Writing prompts list and editor                                    |
| `/settings`                    | Theme, export/import/reset progress                                |
| `*`                            | 404                                                                |

### Components

`AppShell`, `Sidebar`, `MobileNav`, `ProgressBar`, `Card`, `LessonContent`, `CodeEditor`,
`TestResults`, `HintPanel`, `SolutionReveal`, `QuestionCard`, `MilestoneChecklist`,
`WritingEditor`, `ConfirmDialog`.

### Data models

```ts
Lesson           { id, moduleId, title, summary, estimatedMinutes, blocks: LessonBlock[], exerciseIds[] }
LessonBlock      = { type: "text" | "code" | "callout" | "heading", ... }   // union type
Exercise         { id, title, language: "js" | "html-css", instructions, starterCode,
                   tests: TestCase[], hints: string[], solution, explanation }
TestCase         { description, check }   // JS: input → expected output; HTML/CSS: DOM query check
AssessmentQuestion { id, topic, prompt, code?, options[], correctIndex, explanation, level }
Project          { id, title, brief, milestones: ProjectMilestone[] }
ProjectMilestone { id, title, goal, tasks: string[], hints[] }
WritingPrompt    { id, category, title, scenario, tips[], checklist[], example? }

Progress {
  version: 1,
  lessons:    { [lessonId]: { completedAt } },
  exercises:  { [exerciseId]: { status, attempts, hintsUsed, lastCode, solvedAt?, solutionViewed } },
  assessment: { attempts: [{ date, score, byTopic }] },
  project:    { [taskId]: boolean },
  writing:    { [promptId]: { draft, checklist: boolean[], updatedAt } },
  lastVisited: string
}
```

### User journeys

1. First visit: dashboard → assessment → results → recommended first lesson.
2. Learning loop: lesson → complete → exercise → fail → hint → pass → dashboard updates.
3. Stuck: exhaust hints → confirm reveal solution → recorded as "solved with solution".
4. Project: open milestone → tick tasks → progress bar updates.
5. Career: pick a prompt → write → self-review checklist → autosaved draft.
6. Safety: Settings → export JSON → import on another browser.

---

## 7. External services

**Works with no APIs/credentials:** the entire MVP, export/import, static deployment.

**Needs extra services (all deferred):**

- Accounts/sync → auth provider + database (e.g. Supabase/Firebase)
- AI feedback → LLM API key + backend (key must never be in front-end code)
- Non-JS code execution → sandboxed execution server
- GitHub integration → OAuth app
- Email reminders → email service + scheduled jobs

---

## 8. Risks and mitigations

**Security**

- Never `eval` learner code on the main thread. JS runs in a Web Worker with a ~3s timeout, then terminated.
- HTML/CSS runs in `<iframe sandbox="allow-scripts">` (no `allow-same-origin`).
- Lessons render from typed blocks — no `dangerouslySetInnerHTML`.
- Imported progress JSON is validated before use.

**Accessibility**

- Keyboard-only usable, including an escape from Tab-capturing in the editor.
- Semantic headings, labels, real buttons, visible focus.
- Test results announced via `aria-live`.
- Contrast ≥ 4.5:1; pass/fail never by colour alone.
- Respect `prefers-reduced-motion`.

**Testing**

- Keep checking logic in pure functions so it's unit-testable apart from the worker.
- An automated test runs every exercise solution against its own tests.

**Deployment**

- SPA deep-link refresh → Netlify redirect rule (`/* /index.html 200`).
- localStorage is per-domain; localhost progress won't appear on the live site → use export/import.

**Maintenance**

- `version` field + migration function for saved-data changes.
- Scope creep — the Later list protects against it.

---

## 9. Milestones

Each milestone: its own branch, commit small and often, all checks green, review, short learning note in `docs/`.

### M0 — Project setup

- **Deliverables:** `git init`, Vite + React + TS, ESLint/Prettier, Vitest, README, `.gitignore`, placeholder page, GitHub repo.
- **Tests:** one trivial passing test.
- **Acceptance:** `npm run dev`, `build`, `test`, `lint` all succeed; first commit pushed.
- **Learn:** npm & `package.json`, build steps, TS vs JS, `tsconfig`, Git basics.

### M1 — Responsive layout & routing

- **Deliverables:** AppShell, sidebar, mobile menu, all routes with placeholders, 404, CSS variables, light/dark theme.
- **Tests:** navigation renders correct page; mobile menu toggles; keyboard nav works.
- **Acceptance:** works at 360 / 768 / 1280px with no horizontal scroll; all links work.
- **Learn:** components & props, JSX, React Router, Grid vs Flexbox, media queries, mobile-first, custom properties, landmarks.

### M2 — Content model & lesson reader

- **Deliverables:** content types, 3 modules (≥2 lessons each to start), `/learn` map, `LessonContent` renderer.
- **Tests:** each block type renders; lesson IDs unique; unknown lesson → not found.
- **Acceptance:** all lessons readable; code blocks display correctly.
- **Learn:** interfaces, union types, `.map()` with keys, URL params, data vs presentation.

### M3 — Progress tracking

- **Deliverables:** `features/progress` storage module, Context + `useProgress()`, Mark complete, checkmarks, export/import/reset.
- **Tests:** save/load/validate/migrate unit tests; completion survives reload.
- **Acceptance:** survives refresh; corrupted data doesn't crash; export → reset → import restores.
- **Learn:** `useState`, `useEffect`, Context, custom hooks, JSON, localStorage, type guards, try/catch.

### M4 — JavaScript exercises (core)

- **Deliverables:** CodeMirror editor, Worker runner with timeout, test results, one-at-a-time hints, solution reveal with confirm, submission history, 6–9 exercises.
- **Tests:** checker unit tests; every solution passes its tests; infinite loop times out; hint/solution component tests.
- **Acceptance:** correct passes, wrong shows which test failed, `while(true){}` doesn't freeze, code persists after refresh.
- **Learn:** Web Workers, `postMessage`, Promises, timeouts, why `eval` is dangerous, test design, controlled inputs.

### M5 — HTML/CSS exercises

- **Deliverables:** split editor + sandboxed iframe preview, DOM-based checks, 4–6 exercises.
- **Tests:** check functions against sample HTML; sandbox can't reach parent.
- **Acceptance:** debounced live preview; checks report correctly.
- **Learn:** iframe `sandbox`/`srcdoc`, DOM API, `getComputedStyle`, debouncing, same-origin policy.

### M6 — JavaScript skill assessment

- **Deliverables:** ~15 questions, one per screen, results with per-topic scores, recommendation, saved attempts.
- **Tests:** scoring unit tests; full flow; can't submit unanswered.
- **Acceptance:** correct scoring; explanations shown; dashboard shows latest score.
- **Learn:** state machines, `useReducer`, derived state, accessible radio groups/fieldsets.

### M7 — Practical project (Personal Task Tracker)

- **Deliverables:** `/project`, 5–6 milestones with task checklists and hints, progress bar, link to own repo.
- **Tests:** ticking tasks persists; progress math correct.
- **Acceptance:** the whole project is trackable start to finish.
- **Learn:** nested data, computed percentages, component reuse, accessible checkboxes.

### M8 — Career & writing practice

- **Deliverables:** ~6 categorised prompts, `WritingEditor` with word count + autosave, self-review checklist, optional example reveal.
- **Tests:** debounced autosave persists; word count edge cases.
- **Acceptance:** drafts and checklist survive refresh.
- **Learn:** debounced autosave, textarea a11y, string processing, technical writing.

### M9 — Real dashboard

- **Deliverables:** overall/per-module progress, continue where you left off, next recommendation, assessment/project/writing summaries.
- **Tests:** recommendation logic for new / partial / complete users.
- **Acceptance:** accurate for all three user states.
- **Learn:** `useMemo`, pure derived state, testable pure functions.

### M10 — Quality pass & deployment

- **Deliverables:** a11y audit (axe + keyboard), 3–4 Playwright journeys, error boundary, page titles, GitHub Actions CI, Netlify deploy with SPA redirect, README with screenshots.
- **Tests:** E2E — assessment; lesson → exercise → pass → dashboard; export/import.
- **Acceptance:** Lighthouse a11y ≥ 95; all tests green; deep-link refresh works live. Tag `v1.0.0`.
- **Learn:** E2E vs unit, CI basics, environments, semantic versioning.

---

## 10. Architecture

```
 Content (TS data)  ──►  React pages/components  ──►  useProgress() hook
                               │                              │
                 Code runner (Worker / iframe)     progress/storage.ts ──► localStorage
                                                       (later ──► Supabase API)
```

One front-end app, no server/db/login, content versioned in Git, a single storage adapter for a future backend.

---

## 11. Git workflow

- Commit small and often with clear messages.
- One branch per milestone (e.g. `m4-js-exercises`); `main` always works and deploys.
- Before merge: owner reads the full diff, then a code review; every line should be understood.
- Tag milestones (`v0.4.0`) and release (`v1.0.0`).
- Green rule: never commit with failing tests or lint errors (enforced by CI from M10).
- Push to GitHub for backup and portfolio.

---

## 12. Ordered implementation plan

1. M0 — Git + Vite/React/TS project with lint, format, test tooling, GitHub repo
2. M1 — Responsive shell, routing, tokens, theme
3. M2 — Content types, course map, lesson reader with real lessons
4. M3 — Progress module + lesson completion + export/import/reset
5. M4 — JS exercises (CodeMirror, Worker runner, tests, hints, submissions, solutions)
6. M5 — HTML/CSS exercises with sandboxed preview
7. M6 — JavaScript skill assessment
8. M7 — Personal Task Tracker project milestones
9. M8 — Career & writing area
10. M9 — Real dashboard
11. M10 — A11y audit, E2E, CI, Netlify deploy, `v1.0.0`
12. After v1 — choose next release from the Later list

**Status:** Phase 1 approved. Next step: **Milestone 0**.
