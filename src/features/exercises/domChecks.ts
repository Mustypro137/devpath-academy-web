// Checks a learner's HTML/CSS page against an exercise's tests.
//
// This function runs INSIDE the sandboxed checker iframe (see htmlRunner.ts): its source text is
// copied into the iframe with `checkDocument.toString()`. So it must be fully self-contained:
// no imports and no outside variables, only its parameters and the helpers declared inside it.
// Unit tests call it directly on a test document.
import type { HtmlCssTestCase } from '../../types/content'
import type { TestResult } from './checker'

export function checkDocument(doc: Document, tests: HtmlCssTestCase[]): TestResult[] {
  const win = doc.defaultView!

  // Collapse runs of spaces and newlines, like the browser does when it shows text.
  function normalise(text: string | null): string {
    return (text ?? '').replace(/\s+/g, ' ').trim()
  }

  // The browser turns style values into a standard form ("red" becomes "rgb(255, 0, 0)").
  // To compare fairly, apply the expected value to a hidden element and read it back.
  function computedForm(property: string, value: string): string {
    const probe = doc.createElement('div')
    probe.style.setProperty(property, value)
    doc.body.append(probe)
    const result = win.getComputedStyle(probe).getPropertyValue(property)
    probe.remove()
    return result
  }

  function check(test: HtmlCssTestCase): TestResult {
    const { description, check } = test
    const result = (passed: boolean, expected: string, actual: string): TestResult => ({
      description,
      passed,
      expected,
      actual,
    })

    let elements: Element[]
    try {
      elements = Array.from(doc.querySelectorAll(check.selector))
    } catch {
      // Only possible if an exercise has a broken selector, but don't crash the other checks.
      return { description, passed: false, expected: '', error: `Bad selector: ${check.selector}` }
    }
    const first = elements[0]

    if (check.type === 'count') {
      return result(
        elements.length >= check.min,
        `at least ${check.min} × ${check.selector}`,
        `${elements.length}`,
      )
    }
    if (!first) {
      return result(false, `an element matching ${check.selector}`, 'none on the page')
    }

    switch (check.type) {
      case 'exists':
        return result(true, `an element matching ${check.selector}`, 'found')
      case 'text': {
        const actual = normalise(first.textContent)
        return result(actual === check.text, `"${check.text}"`, `"${actual}"`)
      }
      case 'attribute': {
        const actual = first.getAttribute(check.name)
        const expected =
          check.value === undefined ? `a ${check.name} attribute` : `${check.name}="${check.value}"`
        if (actual === null) return result(false, expected, `no ${check.name} attribute`)
        return result(
          check.value === undefined || actual === check.value,
          expected,
          `${check.name}="${actual}"`,
        )
      }
      case 'style': {
        const actual = win.getComputedStyle(first).getPropertyValue(check.property)
        const expected = computedForm(check.property, check.value)
        return result(
          actual === expected,
          `${check.property}: ${check.value}`,
          `${check.property}: ${actual}`,
        )
      }
    }
  }

  return tests.map(check)
}
