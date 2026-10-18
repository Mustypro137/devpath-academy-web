// Pure functions that check learner code against an exercise's tests. "Pure" means no side
// effects (no DOM, no storage), so they are easy to unit-test. The Worker (runner.worker.ts)
// calls these; nothing on the main page ever runs learner code.
import type { JsTestCase } from '../../types/content'

export interface TestResult {
  description: string
  passed: boolean
  expected: string // shown to the learner, so already formatted as text
  actual?: string // what the learner's function returned
  error?: string // set if the function threw instead of returning
}

// Deep equality for the plain values tests use: numbers, strings, booleans, null, undefined,
// arrays, and plain objects. `===` alone says [1] !== [1], because they are different arrays.
export function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true // like ===, but NaN equals NaN
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(
    (key) =>
      Object.hasOwn(b, key) &&
      isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  )
}

// Turns any value into readable text, like the console would: strings get quotes, so the
// learner can tell "5" (text) from 5 (a number).
export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'function') return 'a function'
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'symbol') {
    return String(value) // JSON.stringify would turn NaN into "null"
  }
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value) // e.g. an object that contains itself
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error)
}

// Runs the learner's code and returns the function it defines. Throws if the code has a syntax
// error or doesn't define `functionName`.
//
// `new Function(code)` is a cousin of `eval`: it runs any text as code. That is only acceptable
// inside the Worker, which can't touch the page, the learner's saved data, or the DOM.
export function loadFunction(code: string, functionName: string): (...args: unknown[]) => unknown {
  // The learner's code runs first; then we return whatever their function name refers to.
  // `typeof` (rather than the bare name) avoids a ReferenceError if it was never declared.
  const getFunction = new Function(
    `${code}\n;return typeof ${functionName} === 'function' ? ${functionName} : undefined`,
  )
  const fn: unknown = getFunction()
  if (typeof fn !== 'function') {
    throw new Error(`Your code needs a function called ${functionName}.`)
  }
  return fn as (...args: unknown[]) => unknown
}

export function runTests(fn: (...args: unknown[]) => unknown, tests: JsTestCase[]): TestResult[] {
  return tests.map((test) => {
    const expected = formatValue(test.expected)
    try {
      // A copy of the arguments, so a function that changes its inputs can't affect other tests.
      const actual = fn(...structuredClone(test.args))
      return {
        description: test.description,
        passed: isEqual(actual, test.expected),
        expected,
        actual: formatValue(actual),
      }
    } catch (error) {
      return { description: test.description, passed: false, expected, error: errorMessage(error) }
    }
  })
}
