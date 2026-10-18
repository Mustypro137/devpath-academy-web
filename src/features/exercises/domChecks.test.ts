import { afterEach, describe, expect, it } from 'vitest'
import type { DomCheck } from '../../types/content'
import { checkDocument } from './domChecks'

const SAMPLE = `
  <style>
    h1 { color: rebeccapurple; }
    .card { padding: 16px; border: 2px solid black; }
  </style>
  <h1>  Hello,
    world  </h1>
  <a href="https://example.com">Example</a>
  <ul><li>One</li><li>Two</li></ul>
  <div class="card">Card</div>
`

// Runs one check against SAMPLE (put into the test page's body) and returns its result.
function run(check: DomCheck) {
  document.body.innerHTML = SAMPLE
  return checkDocument(document, [{ description: 'a check', check }])[0]
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('checkDocument', () => {
  it('exists', () => {
    expect(run({ type: 'exists', selector: 'h1' }).passed).toBe(true)
    expect(run({ type: 'exists', selector: 'h2' })).toMatchObject({
      passed: false,
      actual: 'none on the page',
    })
  })

  it('count', () => {
    expect(run({ type: 'count', selector: 'li', min: 2 }).passed).toBe(true)
    expect(run({ type: 'count', selector: 'li', min: 3 })).toMatchObject({
      passed: false,
      actual: '2',
    })
  })

  it('text, ignoring extra spaces and line breaks', () => {
    expect(run({ type: 'text', selector: 'h1', text: 'Hello, world' }).passed).toBe(true)
    expect(run({ type: 'text', selector: 'h1', text: 'Hello' })).toMatchObject({
      passed: false,
      expected: '"Hello"',
      actual: '"Hello, world"',
    })
  })

  it('attribute, with or without a value', () => {
    expect(run({ type: 'attribute', selector: 'a', name: 'href' }).passed).toBe(true)
    expect(
      run({ type: 'attribute', selector: 'a', name: 'href', value: 'https://example.com' }).passed,
    ).toBe(true)
    expect(
      run({ type: 'attribute', selector: 'a', name: 'href', value: 'https://nope.com' }),
    ).toMatchObject({ passed: false, actual: 'href="https://example.com"' })
    expect(run({ type: 'attribute', selector: 'a', name: 'title' })).toMatchObject({
      passed: false,
      actual: 'no title attribute',
    })
  })

  it('style, comparing computed values (named colours, shorthands)', () => {
    const color = { type: 'style', selector: 'h1', property: 'color' } as const
    expect(run({ ...color, value: 'rebeccapurple' }).passed).toBe(true)
    expect(run({ ...color, value: '#663399' }).passed).toBe(true) // the same colour
    expect(run({ ...color, value: 'red' }).passed).toBe(false)

    // `padding: 16px` sets padding-top too.
    expect(
      run({ type: 'style', selector: '.card', property: 'padding-top', value: '16px' }).passed,
    ).toBe(true)
  })

  it('leaves no probe elements behind', () => {
    run({ type: 'style', selector: 'h1', property: 'color', value: 'red' })
    expect(document.body.querySelectorAll('div')).toHaveLength(1) // just .card
  })

  it('reports a broken selector without stopping the other checks', () => {
    document.body.innerHTML = SAMPLE
    const results = checkDocument(document, [
      { description: 'broken', check: { type: 'exists', selector: '!!' } },
      { description: 'fine', check: { type: 'exists', selector: 'h1' } },
    ])
    expect(results.map((r) => r.passed)).toEqual([false, true])
    expect(results[0].error).toMatch(/Bad selector/)
  })

  // The function is copied into the iframe as text, so it must still work when rebuilt from
  // its source alone (no imports or outside variables).
  it('works when rebuilt from its own source text', () => {
    const rebuilt = new Function(`return (${checkDocument.toString()})`)() as typeof checkDocument
    document.body.innerHTML = SAMPLE
    expect(
      rebuilt(document, [{ description: 'h1', check: { type: 'exists', selector: 'h1' } }])[0]
        .passed,
    ).toBe(true)
  })
})
