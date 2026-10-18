import type { WritingCategory, WritingPrompt } from '../types/content'

export const WRITING_CATEGORIES: Record<WritingCategory, { title: string; summary: string }> = {
  'job-search': {
    title: 'Job search',
    summary: 'Introduce yourself and your work to people who are hiring.',
  },
  teamwork: {
    title: 'Teamwork',
    summary: 'The everyday messages that keep a team moving.',
  },
  technical: {
    title: 'Technical writing',
    summary: 'Explain code and problems so others can act on them.',
  },
}

// The order here is the order on the /career page (grouped by category).
// Checklist ticks are saved by position, so add new checklist items at the end.
export const WRITING_PROMPTS: WritingPrompt[] = [
  // --- Job search ---
  {
    id: 'cover-letter',
    category: 'job-search',
    title: 'A short cover letter',
    scenario: [
      'A small company is hiring a junior front-end developer. The job post asks for HTML, CSS, JavaScript, and “someone who explains their thinking clearly”.',
      'Write the main part of a cover letter for this job. Skip the address and greeting: focus on the body.',
    ],
    tips: [
      'Open with the job you’re applying for and one sentence on why you want it.',
      'Give one or two specific examples of things you built, not a list of every skill.',
      'Link your examples to what the job post asks for.',
      'End by saying what you would like to happen next, like a conversation.',
    ],
    checklist: [
      'The first sentence names the job I’m applying for.',
      'I mention at least one specific project I built.',
      'I connect my experience to something in the job post.',
      'Every paragraph is short: three or four sentences at most.',
      'I ended with a clear next step.',
      'I read it out loud and fixed anything that sounded awkward.',
    ],
    targetWords: { min: 120, max: 250 },
    example:
      'I’m applying for the junior front-end developer role. I’ve spent the past months learning to build accessible websites, and your focus on clear explanations is exactly how I like to work.\n\nMy most recent project is a task tracker built with plain HTML, CSS, and JavaScript. It saves tasks in the browser, works with the keyboard alone, and is published on GitHub Pages. While building it, I wrote a short README for each feature, explaining what I tried and why I chose the final approach.\n\nYour post mentions turning designs into working pages. In my course projects I built layouts with semantic HTML and CSS Grid, and checked them at phone and desktop sizes.\n\nI’d love to talk about how I could help your team. My portfolio and code are linked below.',
  },
  {
    id: 'about-me',
    category: 'job-search',
    title: 'An “About me” for your profile',
    scenario: [
      'Write a short “About me” for your GitHub or LinkedIn profile. A recruiter or another developer should understand in ten seconds who you are, what you build, and what you’re looking for.',
    ],
    tips: [
      'Write in the first person (“I build…”), in a friendly but professional tone.',
      'Lead with what you do now, not your whole life story.',
      'Name the tools you actually use.',
      'Say what you’re looking for or learning next.',
    ],
    checklist: [
      'The first sentence says what I do.',
      'I name the main tools or languages I use.',
      'I mention something I’ve built or am building.',
      'I say what I’m looking for or learning next.',
      'There are no buzzwords I couldn’t explain in an interview.',
    ],
    targetWords: { min: 50, max: 120 },
    example:
      'I’m a front-end developer in training, building accessible websites with HTML, CSS, JavaScript, and React. My latest project is a task tracker that saves your tasks in the browser and works with the keyboard alone. I care about pages that load fast and work for everyone. I’m looking for my first junior role, and learning TypeScript along the way.',
  },

  // --- Teamwork ---
  {
    id: 'pull-request',
    category: 'teamwork',
    title: 'A pull request description',
    scenario: [
      'You added a “Delete all completed tasks” button to your team’s task tracker. It asks for confirmation first. You tested it in Chrome and Firefox.',
      'Write the pull request description your reviewers will read before looking at the code.',
    ],
    tips: [
      'Start with a one-line summary of what changed.',
      'Explain why the change is needed, not only what it does.',
      'Say how you tested it, so reviewers know what is already covered.',
      'Point out anything you’re unsure about or want feedback on.',
    ],
    checklist: [
      'The first line sums up the change.',
      'I explain why the change is needed.',
      'I describe how I tested it.',
      'I mention anything reviewers should look at closely.',
      'Someone who didn’t write the code could follow it.',
    ],
    targetWords: { min: 60, max: 150 },
    example:
      'Add a “Delete all completed tasks” button\n\nPeople with long lists asked for a quick way to clear finished tasks instead of deleting them one at a time.\n\nThe button sits under the list and only appears when at least one task is completed. It asks for confirmation before deleting, because the action can’t be undone.\n\nTested in Chrome and Firefox: deleting, cancelling the confirmation, and refreshing afterwards. I’d like a second opinion on the button text: is “Clear completed” clearer?',
  },
  {
    id: 'asking-for-help',
    category: 'teamwork',
    title: 'Asking for help',
    scenario: [
      'You’ve been stuck for an hour: your task tracker’s tasks disappear after refreshing the page. You save them with `localStorage.setItem`, and there are no errors in the console.',
      'Write a message to a more experienced teammate asking for help.',
    ],
    tips: [
      'Say what you’re trying to do, and what happens instead.',
      'List what you have already tried, so they don’t suggest the same things.',
      'Include the smallest piece of code that shows the problem.',
      'Ask a specific question, and say how urgent it is.',
    ],
    checklist: [
      'I say what I expected and what actually happens.',
      'I list what I’ve already tried.',
      'I include the relevant code, or say where to find it.',
      'I ask a clear question.',
      'It is polite and respects their time.',
    ],
    targetWords: { min: 60, max: 150 },
    example:
      'Hi Sam, could you help me with a localStorage problem when you have 15 minutes? It isn’t urgent.\n\nI’m saving the task list with localStorage.setItem("tasks", JSON.stringify(tasks)) every time it changes. After a refresh, the list is empty. There are no console errors.\n\nSo far I’ve checked that the save runs (a console.log shows it), and in DevTools → Application I can see the “tasks” key with the right data. So I think the problem is in loading, not saving.\n\nThe loading code is at the top of app.js, lines 1–10. Could you take a look at whether I’m reading it back correctly?',
  },

  // --- Technical writing ---
  {
    id: 'readme',
    category: 'technical',
    title: 'A README for your project',
    scenario: [
      'Write the `README.md` for your Personal Task Tracker. It is the first thing people see on GitHub, so it should explain the project quickly.',
    ],
    tips: [
      'Start with the project name and one sentence on what it does.',
      'List the main features as short bullet points.',
      'Explain how to run it, step by step.',
      'Finish with what you learned or would add next. Reviewers love this part.',
    ],
    checklist: [
      'The first line says what the project is.',
      'I list the main features.',
      'Someone new could run it by following my steps.',
      'I link to the live version.',
      'I say what I learned or would improve.',
    ],
    targetWords: { min: 80, max: 250 },
    example:
      '# Personal Task Tracker\n\nA small to-do app built with plain HTML, CSS, and JavaScript.\n\nFeatures:\n- Add, complete, and delete tasks\n- Tasks are saved in your browser, so they survive a refresh\n- Filter by all, active, or completed\n- Works with the keyboard alone\n\nTry it: https://your-name.github.io/task-tracker/\n\nRun it yourself: download the code, then open index.html in a browser. No installation needed.\n\nWhat I learned: keeping the tasks in one array and rebuilding the list from it made every feature simpler. Next, I’d like to add due dates.',
  },
  {
    id: 'bug-report',
    category: 'technical',
    title: 'A bug report',
    scenario: [
      'Testing your team’s app, you notice: if you add a task with only spaces in it, an empty row appears in the list and can’t be ticked off.',
      'Write the bug report so a teammate can fix it without asking you questions.',
    ],
    tips: [
      'Give it a title that says what goes wrong, not just “Bug”.',
      'Write numbered steps to reproduce it.',
      'Say what you expected and what happened instead.',
      'Add details: the browser, and a screenshot if you have one.',
    ],
    checklist: [
      'The title describes the problem.',
      'There are numbered steps to reproduce it.',
      'I say what I expected to happen.',
      'I say what actually happened.',
      'I include the browser or device.',
    ],
    targetWords: { min: 50, max: 150 },
    example:
      'Title: A task of only spaces adds an empty row that can’t be ticked\n\nSteps to reproduce:\n1. Open the app.\n2. Type three spaces in the “New task” box.\n3. Press Enter.\n\nExpected: nothing is added, because the task is empty.\n\nActual: an empty row appears in the list. Its checkbox can’t be ticked, and it stays after a refresh.\n\nBrowser: Chrome 130 on Windows 11. Also happens in Firefox.\n\nPossible cause: the input value is checked for being empty before trimming spaces.',
  },
]
