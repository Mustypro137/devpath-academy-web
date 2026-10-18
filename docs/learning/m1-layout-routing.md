# M1 — Responsive layout & routing: learning notes

## Components and props

- A **component** is a function that returns JSX (HTML-like markup). `Header`, `Sidebar`, and
  `AppShell` are components.
- **Props** are a component's inputs, like function arguments. `Sidebar` receives `open` and
  `onNavigate` from `AppShell`. The `interface SidebarProps` describes their types.
- **State** (`useState`) is data a component remembers between renders. `AppShell` owns
  `menuOpen`, and passes it down to `Header` and `Sidebar` as props. This is "lifting state up":
  the closest shared parent owns data that several children need.

## JSX

- `className` instead of `class`; `{expression}` inserts JavaScript; `{/* ... */}` is a comment.
- `<>...</>` is a **fragment**: groups elements without adding an extra `<div>`.
- Lists use `.map()` and each item needs a unique `key` so React can track it (see `Sidebar`).

## React Router

- `BrowserRouter` (in `App.tsx`) connects React to the address bar.
- `<Routes>` / `<Route path="..." element={...}>` (in `AppRoutes.tsx`) map URLs to pages.
- A **layout route** (a `<Route>` with no `path`) wraps its children. `AppShell` renders
  `<Outlet />` where the matching child page appears.
- `:lessonId` in a path is a **URL parameter**; `useParams()` reads it.
- `path="*"` catches every unknown URL, which gives us the 404 page.
- `<Link>` changes the page without a full reload. `<NavLink>` also sets `aria-current="page"`
  on the active link; we style that. `end` stops `/` from matching every URL.
- Tests use `MemoryRouter`, which keeps the URL in memory, so any test can start on any page.

## CSS Grid vs Flexbox

- **Grid** = two dimensions (rows _and_ columns). Used for the page skeleton in
  `AppShell.module.css`. `grid-template-areas` lets you "draw" the layout with names.
- **Flexbox** = one dimension (a row _or_ a column). Used for the header (logo left, button
  right) and the nav list.
- Bug we hit and fixed: without `grid-template-rows`, the grid stretched every row to fill the
  screen height. `auto auto 1fr` means "header and nav take only what they need; main gets the
  rest".
- `minmax(0, 1fr)` instead of `1fr` stops long content (like code later) from making the page
  wider than the screen.

## Media queries and mobile-first

- **Mobile-first**: the default CSS is for phones. `@media (min-width: 768px) { ... }` adds
  changes for wider screens. Small screens download and apply the simplest styles.
- At 768px the menu button hides and the sidebar becomes permanent.

## CSS custom properties (variables)

- Defined once in `src/styles/tokens.css` (`--color-bg: #fff;`), used everywhere as
  `var(--color-bg)`.
- **Dark mode** just redefines the same variables. Two triggers:
  - `@media (prefers-color-scheme: dark)` follows the operating system;
  - `<html data-theme="dark">` is set when the learner picks a theme in Settings.

## CSS Modules

- A file named `X.module.css` is scoped: `.link` becomes something like `.Sidebar_link_a1b2`,
  so class names never clash between components. Import it as `styles` and use
  `className={styles.link}`.

## Accessibility: landmarks and keyboard

- **Landmarks** (`<header>`, `<nav aria-label="Main">`, `<main>`) let screen-reader users jump
  between page regions.
- **Skip link**: the first Tab stop, hidden until focused, jumps past the navigation.
- The menu button uses `aria-expanded` (open or closed?) and `aria-controls` (which element).
- Escape closes the menu and puts focus back on the button, so keyboard users don't get lost.
- `:focus-visible` shows a strong focus ring for keyboard users only.
- The current page is shown by bold text and a side bar, not by colour alone.

## Testing note

- jsdom doesn't apply CSS, so tests check behaviour and ARIA attributes, not visibility. The
  real layout was checked with headless Chrome screenshots at 360, 768, and 1280px.
