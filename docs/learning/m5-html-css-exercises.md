# M5 — HTML/CSS exercises: learning notes

## Two kinds of exercise, one union type

- `Exercise = JsExercise | HtmlCssExercise`. Both share `ExerciseBase` (title, instructions,
  starter code, hints, solution...). The `language` field tells them apart.
- Adding the second kind made TypeScript list every place that assumed "exercises are
  JavaScript" (`exercise.functionName` doesn't exist on every exercise any more). Checking
  `exercise.language === 'js'` **narrows** the type, so those places now handle both kinds.
- An HTML/CSS exercise is **one HTML document**; CSS goes in a `<style>` element. That keeps
  saved progress the same shape as for JavaScript (`lastCode` is one string).

## The DOM API and `getComputedStyle`

- Checks are plain data, e.g. `{ type: 'text', selector: 'h1', text: 'My first page' }`.
  `checkDocument()` uses the DOM API to evaluate them:
  - `querySelectorAll(selector)` finds elements with a CSS selector
  - `textContent` reads their text
  - `getAttribute(name)` reads an attribute
- `getComputedStyle(element)` gives the **final** style after every CSS rule has been applied.
  The browser stores it in a standard form: `color: rebeccapurple` reads back as
  `rgb(102, 51, 153)`. To compare fairly, the checker applies the expected value to a hidden
  probe element and reads that back too. So `rebeccapurple`, `#663399` and
  `rgb(102, 51, 153)` all count as the same colour.
- `padding: 16px` is a **shorthand**: the computed style has `padding-top`, `padding-left`, and
  so on. Checks use the long names.

## iframes: `srcdoc` and `sandbox`

- `<iframe srcdoc="...">` shows an HTML string as a separate page inside this one.
- `sandbox` turns the iframe's powers off. An empty `sandbox=""` blocks everything: scripts,
  forms, pop-ups, and navigating the app away. Each `allow-...` token switches one power back on.
- The **preview** uses `sandbox=""`: it is only for looking at.
- The **checker** iframe uses `sandbox="allow-scripts"`, so our checking script can run.
  It never gets `allow-same-origin`.

## The same-origin policy

- An **origin** is scheme + host + port, e.g. `http://localhost:5173`. Pages can only read
  each other's DOM, cookies, and storage if their origins match.
- A sandboxed iframe without `allow-same-origin` gets a unique, "opaque" origin (`null`).
  So even the learner's own page can't reach `parent.document` or our `localStorage`. In Chrome
  this throws a `SecurityError`; that was checked by hand.
- Different origins can still talk with `postMessage`, which copies plain data. The receiver
  must check who sent it: `event.source === frame.window`. Any window (an ad, an extension)
  can post messages to the page.

## Content-Security-Policy and nonces

- `allow-scripts` would also let a `<script>` written by the learner run. To prevent that, the
  checker page starts with a `<meta http-equiv="Content-Security-Policy">`. It only allows
  scripts carrying this run's random **nonce** (a number used once, from
  `crypto.randomUUID()`).
- The learner's code can't know the nonce, so their `<script>` and `onclick="..."` are blocked.
  Checked in Chrome: `<script>while (true) {}</script>` was blocked and the checks finished in
  78 ms.
- Our script comes **first** in the iframe's document. Unfinished learner HTML (like an unclosed
  `<!--`) can only affect what comes after it.

## Copying a function into an iframe

- The iframe can't `import` our code, so `checkDocument.toString()` copies its source text in.
  That only works if the function is **self-contained**: no imports, no outside variables.
- A unit test rebuilds it from its own text with `new Function(...)` to prove that. The Chrome
  check proves it still works after the production build minifies it.

## Debouncing

- `useDebouncedValue(value, 400)` returns `value` only once it has stopped changing for 400 ms.
  Each change starts a new timer, and the effect's cleanup cancels the old one.
- The preview uses it, so the iframe is rebuilt once per pause instead of on every keystroke.
- Tested with `renderHook` and fake timers: typing again before the delay restarts the wait.

## Testing gotchas from this milestone

- jsdom's `getComputedStyle` applies `<style>` rules, but reports the default font size as
  `medium` where Chrome says `16px`.
- jsdom has no `iframe.sandbox` token list, so `sandbox.add(...)` crashed in tests. Using
  `setAttribute('sandbox', 'allow-scripts')` works everywhere.
- A flaky test: after a lazily loaded page appears, its `useEffect`s (which create CodeMirror)
  can run a moment later. Tests now wait for the **editor**, not just the heading.
