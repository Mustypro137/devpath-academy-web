import type { JsExercise } from '../../types/content'

// Each exercise is linked from a lesson through that lesson's `exerciseIds`.
// content.test.ts checks that every solution passes its own tests and every starter code fails.

export const jsExercises: JsExercise[] = [
  // --- Values and variables ---
  {
    id: 'js-greet',
    language: 'js',
    title: 'Say hello',
    instructions: [
      'Write a function `greet(name)` that returns a greeting for `name`.',
      "For example, `greet('Ada')` should return `'Hello, Ada!'`.",
    ],
    functionName: 'greet',
    starterCode: 'function greet(name) {\n  // Your code here\n}\n',
    tests: [
      { description: "greet('Ada') returns 'Hello, Ada!'", args: ['Ada'], expected: 'Hello, Ada!' },
      {
        description: "greet('Grace') returns 'Hello, Grace!'",
        args: ['Grace'],
        expected: 'Hello, Grace!',
      },
      { description: "greet('') returns 'Hello, !'", args: [''], expected: 'Hello, !' },
    ],
    hints: [
      'The function must `return` the string. `console.log` only prints it.',
      'Put `name` inside a template literal: backticks, with `${name}` where the name goes.',
      'Check the punctuation: a comma after "Hello" and an exclamation mark at the end.',
    ],
    solution: 'function greet(name) {\n  return `Hello, ${name}!`\n}\n',
    explanation:
      'The template literal puts the value of `name` where `${name}` is, and `return` hands the finished string back to whoever called the function.',
  },
  {
    id: 'js-full-name',
    language: 'js',
    title: 'Full name',
    instructions: [
      'Write a function `fullName(first, last)` that joins a first and last name with one space between them.',
      "`fullName('Ada', 'Lovelace')` should return `'Ada Lovelace'`.",
    ],
    functionName: 'fullName',
    starterCode: 'function fullName(first, last) {\n  // Your code here\n}\n',
    tests: [
      {
        description: "fullName('Ada', 'Lovelace') returns 'Ada Lovelace'",
        args: ['Ada', 'Lovelace'],
        expected: 'Ada Lovelace',
      },
      {
        description: "fullName('Alan', 'Turing') returns 'Alan Turing'",
        args: ['Alan', 'Turing'],
        expected: 'Alan Turing',
      },
    ],
    hints: [
      'You need three pieces: the first name, a space, and the last name.',
      "With `+`, that is `first + ' ' + last`. A template literal works too.",
    ],
    solution: 'function fullName(first, last) {\n  return `${first} ${last}`\n}\n',
    explanation:
      "Both parameters go into one template literal with a space between the placeholders. `first + ' ' + last` works just as well.",
  },
  {
    id: 'js-add-number-strings',
    language: 'js',
    title: 'Add numbers that arrive as text',
    instructions: [
      "Form inputs give you text, even when someone types a number. Write `addAsNumbers(a, b)`, where `a` and `b` are strings like `'5'`, and return their sum as a number.",
      "`addAsNumbers('5', '1')` should return `6`, not `'51'`.",
    ],
    functionName: 'addAsNumbers',
    starterCode: 'function addAsNumbers(a, b) {\n  return a + b\n}\n',
    tests: [
      { description: "addAsNumbers('5', '1') returns 6", args: ['5', '1'], expected: 6 },
      { description: "addAsNumbers('10', '20') returns 30", args: ['10', '20'], expected: 30 },
      { description: "addAsNumbers('2.5', '0.5') returns 3", args: ['2.5', '0.5'], expected: 3 },
    ],
    hints: [
      'Run the starter code first. Why does it give `"51"`? The “Watch out” box in the lesson explains.',
      "Turn each string into a number before adding. `Number('5')` gives `5`.",
      'Try `return Number(a) + Number(b)`.',
    ],
    solution: 'function addAsNumbers(a, b) {\n  return Number(a) + Number(b)\n}\n',
    explanation:
      'When either side of `+` is a string, JavaScript joins the two values. `Number()` converts each string to a number first, so `+` adds them.',
  },

  // --- Functions ---
  {
    id: 'js-double',
    language: 'js',
    title: 'Double it',
    instructions: [
      'Write a function `double(n)` that returns `n` multiplied by 2.',
      'Try writing it as an arrow function: `const double = (n) => ...`.',
    ],
    functionName: 'double',
    starterCode: 'const double = (n) => {\n  // Your code here\n}\n',
    tests: [
      { description: 'double(4) returns 8', args: [4], expected: 8 },
      { description: 'double(0) returns 0', args: [0], expected: 0 },
      { description: 'double(-3) returns -6', args: [-3], expected: -6 },
    ],
    hints: [
      'Multiplication in JavaScript uses `*`.',
      'With braces `{ }`, an arrow function needs `return`. Without braces, the result is returned automatically.',
    ],
    solution: 'const double = (n) => n * 2\n',
    explanation:
      'An arrow function with a single expression and no braces returns that expression, so `n * 2` is the result.',
  },
  {
    id: 'js-rectangle-area',
    language: 'js',
    title: 'Area of a rectangle',
    instructions: [
      'Write `area(width, height)` that returns the area of a rectangle: its width times its height.',
    ],
    functionName: 'area',
    starterCode: 'function area(width, height) {\n  // Your code here\n}\n',
    tests: [
      { description: 'area(3, 4) returns 12', args: [3, 4], expected: 12 },
      { description: 'area(10, 1) returns 10', args: [10, 1], expected: 10 },
      { description: 'area(0, 5) returns 0', args: [0, 5], expected: 0 },
    ],
    hints: [
      'The function has two parameters. Use both.',
      'Remember to `return` the result: `return width * height`.',
    ],
    solution: 'function area(width, height) {\n  return width * height\n}\n',
    explanation:
      'Each parameter holds one of the arguments, in order. Multiplying them and returning the result is all the function needs to do.',
  },
  {
    id: 'js-celsius-to-fahrenheit',
    language: 'js',
    title: 'Celsius to Fahrenheit',
    instructions: [
      'Write `toFahrenheit(celsius)` that converts a temperature: multiply by 9, divide by 5, then add 32.',
      '`toFahrenheit(100)` should return `212`.',
    ],
    functionName: 'toFahrenheit',
    starterCode: 'function toFahrenheit(celsius) {\n  // Your code here\n}\n',
    tests: [
      { description: 'toFahrenheit(0) returns 32', args: [0], expected: 32 },
      { description: 'toFahrenheit(100) returns 212', args: [100], expected: 212 },
      { description: 'toFahrenheit(-40) returns -40', args: [-40], expected: -40 },
      { description: 'toFahrenheit(37) returns 98.6', args: [37], expected: 98.6 },
    ],
    hints: [
      'Write the formula step by step: `celsius * 9`, then `/ 5`, then `+ 32`.',
      'JavaScript does `*` and `/` before `+`, just like in maths, so no brackets are needed.',
    ],
    solution: 'function toFahrenheit(celsius) {\n  return (celsius * 9) / 5 + 32\n}\n',
    explanation:
      'Multiplication and division happen before addition, so `celsius * 9 / 5 + 32` follows the formula. The brackets just make the order easier to read.',
  },
  {
    id: 'js-is-even',
    language: 'js',
    title: 'Is it even?',
    instructions: [
      'Write `isEven(n)` that returns `true` if `n` is even and `false` if it is odd.',
      'The remainder operator `%` gives what is left over after dividing: `7 % 2` is `1`.',
    ],
    functionName: 'isEven',
    starterCode: 'function isEven(n) {\n  // Your code here\n}\n',
    tests: [
      { description: 'isEven(4) returns true', args: [4], expected: true },
      { description: 'isEven(7) returns false', args: [7], expected: false },
      { description: 'isEven(0) returns true', args: [0], expected: true },
      { description: 'isEven(-2) returns true', args: [-2], expected: true },
    ],
    hints: [
      'An even number has nothing left over when divided by 2.',
      '`n % 2` is `0` for even numbers.',
      'A comparison like `n % 2 === 0` already gives `true` or `false`. You can return it directly.',
    ],
    solution: 'function isEven(n) {\n  return n % 2 === 0\n}\n',
    explanation:
      '`n % 2 === 0` is a comparison, and every comparison produces a boolean. Returning it directly is shorter than an `if` that returns `true` or `false`.',
  },
]
