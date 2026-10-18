import type { Project } from '../types/content'

// The guided project. Learners build it in their own folder and repository, outside this app;
// here they follow the milestones and tick off tasks. content.test.ts checks the task ids.

export const PROJECT: Project = {
  id: 'task-tracker',
  title: 'Personal Task Tracker',
  brief: [
    'Build a small to-do app with plain HTML, CSS, and JavaScript: no frameworks. You’ll add tasks, tick them off, delete them, and keep them after a page refresh.',
    'Work in your own folder and Git repository, one milestone at a time. Tick each task here as you finish it. The hints are there if you get stuck.',
  ],
  milestones: [
    {
      id: 'setup',
      title: 'Set up the project',
      goal: 'An empty page that loads its CSS and JavaScript, saved in a Git repository on GitHub.',
      tasks: [
        {
          id: 'setup-folder',
          text: 'Create a folder called `task-tracker` and open it in your editor.',
        },
        {
          id: 'setup-files',
          text: 'Create `index.html`, `style.css`, and `app.js`, and link the CSS and JavaScript from the HTML.',
        },
        {
          id: 'setup-check',
          text: 'Open the page in a browser and check that `console.log` from `app.js` appears in the console.',
        },
        { id: 'setup-git', text: 'Run `git init` and make your first commit.' },
        {
          id: 'setup-github',
          text: 'Create a repository on GitHub, push to it, and add its link at the bottom of this page.',
        },
      ],
      hints: [
        'Link the stylesheet in `<head>` with `<link rel="stylesheet" href="style.css">`.',
        'Put `<script src="app.js" defer></script>` in `<head>`. `defer` runs the script after the HTML has loaded.',
        'Press F12 (or Cmd+Option+I on a Mac) to open the browser’s developer tools and find the Console tab.',
      ],
    },
    {
      id: 'layout',
      title: 'Build the layout',
      goal: 'A page with a heading, a form to type a new task, and an empty list for tasks.',
      tasks: [
        { id: 'layout-heading', text: 'Add a `<main>` with an `<h1>` for the app’s name.' },
        {
          id: 'layout-form',
          text: 'Add a `<form>` with a text `<input>`, a `<label>` for it, and an “Add” `<button>`.',
        },
        { id: 'layout-list', text: 'Add an empty `<ul>` with an id, where tasks will go.' },
        {
          id: 'layout-style',
          text: 'Style it in `style.css`: a readable width, spacing, and a clear focus outline.',
        },
        { id: 'layout-commit', text: 'Commit your work.' },
      ],
      hints: [
        'Connect the label and input with matching `for` and `id` attributes, so clicking the label focuses the input.',
        'A form’s button submits the form by default. That is what you want: it also works when someone presses Enter.',
        '`max-width` and `margin: 0 auto` keep the page a readable width and centred.',
      ],
    },
    {
      id: 'add',
      title: 'Add tasks',
      goal: 'Typing a task and pressing Enter (or clicking Add) puts it in the list.',
      tasks: [
        {
          id: 'add-select',
          text: 'In `app.js`, select the form, the input, and the list with `document.querySelector`.',
        },
        {
          id: 'add-submit',
          text: 'Listen for the form’s `submit` event and call `event.preventDefault()`, so the page doesn’t reload.',
        },
        {
          id: 'add-item',
          text: 'Read the input’s value, create an `<li>` with that text, and add it to the list.',
        },
        { id: 'add-reset', text: 'Clear the input afterwards, and ignore empty or blank tasks.' },
        { id: 'add-commit', text: 'Commit your work.' },
      ],
      hints: [
        '`form.addEventListener("submit", (event) => { ... })` runs your code every time the form is submitted.',
        '`document.createElement("li")` makes an element; set its `textContent`, then `list.append(item)`.',
        '`input.value.trim()` removes spaces from both ends, so a task of only spaces becomes an empty string.',
      ],
    },
    {
      id: 'complete',
      title: 'Complete and delete tasks',
      goal: 'Each task can be ticked off (and unticked) and deleted.',
      tasks: [
        {
          id: 'complete-checkbox',
          text: 'Give each task a checkbox, inside a `<label>` with the task’s text.',
        },
        {
          id: 'complete-style',
          text: 'When the checkbox is ticked, add a class that shows the task as done (for example, crossed out).',
        },
        {
          id: 'complete-delete',
          text: 'Add a “Delete” button to each task that removes it from the list.',
        },
        {
          id: 'complete-names',
          text: 'Make each Delete button’s name unique for screen readers, like “Delete Buy milk”.',
        },
        { id: 'complete-commit', text: 'Commit your work.' },
      ],
      hints: [
        '`item.classList.toggle("done", checkbox.checked)` adds the class when ticked and removes it when not.',
        'One listener on the `<ul>` can handle every Delete button, even ones added later. Check `event.target` to see what was clicked. This is called event delegation.',
        'Add a visually hidden part to the button text, or use `aria-label`, so it says which task it deletes.',
      ],
    },
    {
      id: 'save',
      title: 'Save tasks',
      goal: 'Tasks, and whether they are done, are still there after refreshing the page.',
      tasks: [
        {
          id: 'save-array',
          text: 'Keep tasks in an array of objects, like `{ id, text, done }`, and build the list from it in a `render()` function.',
        },
        {
          id: 'save-store',
          text: 'Save the array to `localStorage` with `JSON.stringify` every time it changes.',
        },
        {
          id: 'save-load',
          text: 'When the page loads, read the array back with `JSON.parse`, then call `render()`.',
        },
        {
          id: 'save-broken',
          text: 'Make it start with an empty list, instead of crashing, if the saved data is missing or broken.',
        },
        { id: 'save-commit', text: 'Commit your work.' },
      ],
      hints: [
        'With an array as the “source of truth”, every change follows the same steps: change the array, save it, call `render()`.',
        '`crypto.randomUUID()` gives each task a unique id, which you can put in a `data-id` attribute on its `<li>`.',
        '`JSON.parse` throws on invalid text, so wrap it in `try { ... } catch { ... }`. This app’s own progress storage works the same way.',
      ],
    },
    {
      id: 'publish',
      title: 'Polish and publish',
      goal: 'A finished app, online, that you can show people.',
      tasks: [
        { id: 'publish-count', text: 'Show how many tasks are left, like “3 tasks left”.' },
        {
          id: 'publish-filter',
          text: 'Add filter buttons to show all, active, or completed tasks.',
        },
        {
          id: 'publish-keyboard',
          text: 'Check that everything works with the keyboard alone, with a visible focus outline.',
        },
        {
          id: 'publish-readme',
          text: 'Write a `README.md`: what the app does, how to run it, and what you learned.',
        },
        {
          id: 'publish-deploy',
          text: 'Publish it with GitHub Pages (or Netlify), and add the live link to your README.',
        },
      ],
      hints: [
        'Calculate the count from the array (`tasks.filter((task) => !task.done).length`) instead of storing it separately.',
        'Keep the current filter in a variable, and let `render()` decide which tasks to show.',
        'On GitHub: Settings → Pages → deploy from the `main` branch. Your site appears at `https://<username>.github.io/task-tracker/`.',
      ],
    },
  ],
}
