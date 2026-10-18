import type { Lesson } from '../../types/content'

export const jsLessons: Lesson[] = [
  {
    id: 'js-values-and-variables',
    moduleId: 'js',
    title: 'Values and variables',
    summary: 'Storing data with const and let, and the basic types of value.',
    estimatedMinutes: 12,
    exerciseIds: [],
    blocks: [
      {
        type: 'text',
        text: 'Programs work with values: numbers, pieces of text, true/false answers. A variable is a name you give to a value so you can use it later.',
      },
      { type: 'heading', text: 'const and let' },
      {
        type: 'code',
        language: 'js',
        code: "const siteName = 'DevPath Academy'\nlet score = 0\n\nscore = score + 10 // allowed: let can change\n// siteName = 'Other' // error: const cannot be reassigned",
      },
      {
        type: 'list',
        items: [
          'Use `const` by default. It means “this name always points at the same value”.',
          'Use `let` only when you need to reassign, like a counter.',
          'You will see `var` in old code. Avoid it in new code.',
        ],
      },
      { type: 'heading', text: 'Basic types' },
      {
        type: 'code',
        language: 'js',
        code: "const age = 27             // number\nconst name = 'Ada'         // string (text)\nconst isLoggedIn = true    // boolean (true or false)\nconst nothing = null       // deliberately empty\nlet notSetYet              // undefined: no value given",
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Use `typeof` to check a value’s type: `typeof 42` gives `"number"`.',
      },
      { type: 'heading', text: 'Strings' },
      {
        type: 'text',
        text: 'Strings can use single quotes, double quotes, or backticks. There are two common ways to build a string from other values:',
      },
      {
        type: 'code',
        language: 'js',
        code: "const name = 'Ada'\n\n// 1. Concatenation: join pieces with +\nconst a = 'Hello, ' + name + '!'\n\n// 2. Template literal: backticks with ${...} placeholders\nconst b = `Hello, ${name}!`\n\nconsole.log(a) // Hello, Ada!\nconsole.log(b) // Hello, Ada!",
        caption: 'Template literals are easier to read once a string has several values in it.',
      },
      {
        type: 'callout',
        variant: 'warning',
        text: 'Watch out: `\'5\' + 1` is the string `"51"`, not `6`. When one side of `+` is a string, JavaScript joins instead of adding.',
      },
    ],
  },
  {
    id: 'js-functions',
    moduleId: 'js',
    title: 'Functions',
    summary: 'Packaging code you can reuse: parameters, return values, and arrow functions.',
    estimatedMinutes: 15,
    exerciseIds: [],
    blocks: [
      {
        type: 'text',
        text: 'A function is a named, reusable piece of code. You give it inputs (parameters), it does some work, and it can give back a result (its return value).',
      },
      { type: 'heading', text: 'Declaring and calling' },
      {
        type: 'code',
        language: 'js',
        code: "function greet(name) {\n  return 'Hello, ' + name + '!'\n}\n\nconst message = greet('Ada') // calling the function\nconsole.log(message)         // Hello, Ada!",
      },
      {
        type: 'list',
        items: [
          '`name` is a parameter: a placeholder for the input.',
          "`'Ada'` is the argument: the actual value passed in.",
          '`return` sends a value back and ends the function.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        text: 'A function with no `return` gives back `undefined`. Printing with `console.log` inside a function is not the same as returning a value.',
      },
      { type: 'heading', text: 'Arrow functions' },
      {
        type: 'text',
        text: 'A shorter way to write functions, very common in modern code (and in React):',
      },
      {
        type: 'code',
        language: 'js',
        code: 'const double = (n) => n * 2\n\nconst add = (a, b) => {\n  return a + b\n}\n\ndouble(4) // 8\nadd(2, 3) // 5',
        caption: 'With a single expression and no braces, the result is returned automatically.',
      },
      { type: 'heading', text: 'Why use functions?' },
      {
        type: 'list',
        items: [
          'Reuse: write the logic once, call it many times.',
          'Naming: `calculateTotal(cart)` explains itself.',
          'Testing: a function that takes inputs and returns an output is easy to test — the exercises in this course work exactly that way.',
        ],
      },
    ],
  },
]
