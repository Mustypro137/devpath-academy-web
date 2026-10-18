import { describe, expect, it } from 'vitest'
import { formatValue, isEqual, loadFunction, runTests } from './checker'

describe('isEqual', () => {
  it('compares plain values', () => {
    expect(isEqual(1, 1)).toBe(true)
    expect(isEqual('1', 1)).toBe(false)
    expect(isEqual(NaN, NaN)).toBe(true)
    expect(isEqual(null, undefined)).toBe(false)
  })

  it('compares arrays and objects by their contents', () => {
    expect(isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true)
    expect(isEqual([1, 2], [2, 1])).toBe(false)
    expect(isEqual({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 })).toBe(true)
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(isEqual({ a: undefined }, { b: undefined })).toBe(false)
    expect(isEqual([], {})).toBe(false)
  })
})

describe('formatValue', () => {
  it('shows values the way a learner would write them', () => {
    expect(formatValue('5')).toBe('"5"')
    expect(formatValue(5)).toBe('5')
    expect(formatValue(NaN)).toBe('NaN')
    expect(formatValue(undefined)).toBe('undefined')
    expect(formatValue([1, 'a'])).toBe('[1,"a"]')
    expect(formatValue(() => 1)).toBe('a function')
  })
})

describe('loadFunction', () => {
  it('returns the named function, written in any style', () => {
    expect(loadFunction('function double(n) { return n * 2 }', 'double')(4)).toBe(8)
    expect(loadFunction('const double = (n) => n * 2', 'double')(4)).toBe(8)
  })

  it('explains when the function is missing', () => {
    expect(() => loadFunction('const x = 1', 'double')).toThrow(
      'Your code needs a function called double.',
    )
    expect(() => loadFunction('const double = 2', 'double')).toThrow(/called double/)
  })

  it('throws a SyntaxError for code that cannot be parsed', () => {
    expect(() => loadFunction('function double(n) {', 'double')).toThrow(SyntaxError)
  })
})

describe('runTests', () => {
  const tests = [
    { description: 'double(2) returns 4', args: [2], expected: 4 },
    { description: 'double(0) returns 0', args: [0], expected: 0 },
  ]

  it('passes every test for a correct function', () => {
    const results = runTests((n) => (n as number) * 2, tests)
    expect(results.map((result) => result.passed)).toEqual([true, true])
  })

  it('reports what a wrong function returned', () => {
    const [first] = runTests((n) => `${n as number}${n as number}`, tests)
    expect(first).toEqual({
      description: 'double(2) returns 4',
      passed: false,
      expected: '4',
      actual: '"22"',
    })
  })

  it('records an error for each test whose call throws, without stopping the others', () => {
    let calls = 0
    const results = runTests(() => {
      calls++
      throw new TypeError('boom')
    }, tests)
    expect(calls).toBe(2)
    expect(results[0]).toMatchObject({ passed: false, error: 'TypeError: boom' })
  })

  it('gives each test its own copy of the arguments', () => {
    const pushTests = [
      { description: 'first', args: [[1]], expected: 2 },
      { description: 'second', args: [[1]], expected: 2 },
    ]
    const results = runTests((list) => (list as number[]).push(9), pushTests)
    expect(results.every((result) => result.passed)).toBe(true)
    expect(pushTests[0].args).toEqual([[1]])
  })
})
