import type { AssessmentQuestion, AssessmentTopic } from '../types/content'

// Each topic links to the lesson that teaches it, so the results can recommend where to start.
export const ASSESSMENT_TOPICS: Record<AssessmentTopic, { title: string; lessonId: string }> = {
  values: { title: 'Values and variables', lessonId: 'js-values-and-variables' },
  strings: { title: 'Strings', lessonId: 'js-values-and-variables' },
  operators: { title: 'Operators', lessonId: 'js-values-and-variables' },
  functions: { title: 'Functions', lessonId: 'js-functions' },
}

// Shown in this order. content.test.ts checks ids, answers, and that every topic is covered.
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // --- Values and variables ---
  {
    id: 'const-keyword',
    topic: 'values',
    level: 'beginner',
    prompt: 'Which keyword declares a variable that can’t be reassigned?',
    options: ['`let`', '`const`', '`var`', '`static`'],
    correctIndex: 1,
    explanation:
      '`const` means the name always points at the same value. `let` can be reassigned, and `var` is the old way of declaring variables.',
  },
  {
    id: 'let-reassign',
    topic: 'values',
    level: 'beginner',
    prompt: 'What is the value of `score` after this code runs?',
    code: 'let score = 5\nscore = score + 1',
    options: ['`5`', '`6`', '`"51"`', 'It throws an error'],
    correctIndex: 1,
    explanation:
      '`score + 1` is calculated with the current value (5), and the result is stored back in `score`. That is allowed because it was declared with `let`.',
  },
  {
    id: 'typeof-number',
    topic: 'values',
    level: 'beginner',
    prompt: 'What does `typeof 42` give?',
    options: ['`"number"`', '`"integer"`', '`"string"`', '`"object"`'],
    correctIndex: 0,
    explanation:
      'JavaScript has one number type for whole numbers and decimals alike, so `typeof 42` is `"number"`.',
  },
  {
    id: 'undefined-variable',
    topic: 'values',
    level: 'intermediate',
    prompt: 'What does this code print?',
    code: 'let total\nconsole.log(total)',
    options: ['`0`', '`null`', '`undefined`', 'It throws an error'],
    correctIndex: 2,
    explanation:
      'A variable declared without a value holds `undefined`. `null` only appears when you set it on purpose.',
  },

  // --- Strings ---
  {
    id: 'template-literal',
    topic: 'strings',
    level: 'beginner',
    prompt: 'What is the value of `message`?',
    code: "const name = 'Ada'\nconst message = `Hi, ${name}!`",
    options: ['`"Hi, ${name}!"`', '`"Hi, name!"`', '`"Hi, Ada!"`', 'It throws an error'],
    correctIndex: 2,
    explanation:
      'In a template literal (backticks), `${...}` is replaced by the value inside it, so `${name}` becomes `Ada`.',
  },
  {
    id: 'string-literal',
    topic: 'strings',
    level: 'beginner',
    prompt: 'Which of these is a string?',
    options: ['`42`', '`true`', '`null`', "`'42'`"],
    correctIndex: 3,
    explanation:
      'Quotes make a string. `42` is a number, `true` is a boolean, and `null` means “deliberately empty”.',
  },
  {
    id: 'string-join',
    topic: 'strings',
    level: 'beginner',
    prompt: 'What is the result?',
    code: "'abc' + 'def'",
    options: ['`"abcdef"`', '`"abc def"`', '`NaN`', 'It throws an error'],
    correctIndex: 0,
    explanation:
      '`+` joins two strings exactly as they are. It doesn’t add a space; you would have to include one yourself.',
  },
  {
    id: 'string-length',
    topic: 'strings',
    level: 'intermediate',
    prompt: 'What is `"Hello".length`?',
    options: ['`4`', '`5`', '`6`', '`undefined`'],
    correctIndex: 1,
    explanation:
      '`.length` counts the characters in a string. "Hello" has 5. (Positions start at 0, but the count doesn’t.)',
  },

  // --- Operators ---
  {
    id: 'string-plus-number',
    topic: 'operators',
    level: 'beginner',
    prompt: 'What is the result?',
    code: "'5' + 1",
    options: ['`6`', '`"51"`', '`NaN`', 'It throws an error'],
    correctIndex: 1,
    explanation:
      'When one side of `+` is a string, JavaScript joins instead of adding, so the result is the string `"51"`.',
  },
  {
    id: 'operator-order',
    topic: 'operators',
    level: 'beginner',
    prompt: 'What is the result?',
    code: '2 + 3 * 4',
    options: ['`20`', '`24`', '`9`', '`14`'],
    correctIndex: 3,
    explanation:
      'Like in maths, `*` happens before `+`: 3 × 4 is 12, then 2 + 12 is 14. Brackets would change that: `(2 + 3) * 4` is 20.',
  },
  {
    id: 'remainder',
    topic: 'operators',
    level: 'intermediate',
    prompt: 'What is `7 % 2`?',
    options: ['`3.5`', '`3`', '`1`', '`0`'],
    correctIndex: 2,
    explanation:
      '`%` gives the remainder after dividing: 7 ÷ 2 is 3 with 1 left over. It is often used to check for even numbers: `n % 2 === 0`.',
  },

  // --- Functions ---
  {
    id: 'function-return',
    topic: 'functions',
    level: 'beginner',
    prompt: 'What does `add(2, 3)` return?',
    code: 'function add(a, b) {\n  return a + b\n}',
    options: ['`5`', '`"23"`', '`undefined`', 'It throws an error'],
    correctIndex: 0,
    explanation:
      'The arguments `2` and `3` fill the parameters `a` and `b`, and `return` sends back their sum.',
  },
  {
    id: 'parameter-vs-argument',
    topic: 'functions',
    level: 'beginner',
    prompt: 'In `function greet(name) { ... }`, what is `name`?',
    options: ['An argument', 'A parameter', 'A return value', 'A global variable'],
    correctIndex: 1,
    explanation:
      "A parameter is the placeholder in the function definition. The argument is the actual value passed in when calling it, like `greet('Ada')`.",
  },
  {
    id: 'arrow-function',
    topic: 'functions',
    level: 'beginner',
    prompt: 'What does `double(4)` return?',
    code: 'const double = (n) => n * 2',
    options: ['`"44"`', '`8`', '`undefined`', '`4`'],
    correctIndex: 1,
    explanation:
      'An arrow function with no braces returns its expression automatically, so `double(4)` is `4 * 2`.',
  },
  {
    id: 'log-is-not-return',
    topic: 'functions',
    level: 'intermediate',
    prompt: 'What is the value of `result`?',
    code: "function greet(name) {\n  console.log('Hi ' + name)\n}\n\nconst result = greet('Ada')",
    options: ['`"Hi Ada"`', '`"Ada"`', '`null`', '`undefined`'],
    correctIndex: 3,
    explanation:
      '`console.log` prints, but the function never uses `return`, so calling it gives back `undefined`.',
  },
]
