import { describe, expect, it } from 'vitest'
import { countWords, wordRangeStatus } from './wordCount'

describe('countWords', () => {
  it.each([
    ['', 0],
    ['   \n\t  ', 0],
    ['hello', 1],
    ['  hello   world  ', 2], // extra spaces at the ends and in between
    ['one\ntwo\n\nthree', 3], // new lines and blank lines
    ['one\ttwo', 2],
    ["don't stop", 2], // an apostrophe stays inside the word
    ['well-known fact', 2], // a hyphenated word is one word
    ['Done - finally!', 2], // a lone dash is not a word
    ['# Title', 1], // nor is a Markdown heading mark
    ['I have 3 cats', 4], // numbers count
    ['café naïve 日本', 3], // letters from any alphabet count
    ['https://example.com is the site', 4], // a link is one word
  ])('%j has %i words', (text, expected) => {
    expect(countWords(text)).toBe(expected)
  })
})

describe('wordRangeStatus', () => {
  const range = { min: 50, max: 100 }

  it('describes where a count sits in the range, including both edges', () => {
    expect(wordRangeStatus(0, range)).toBe('empty')
    expect(wordRangeStatus(49, range)).toBe('under')
    expect(wordRangeStatus(50, range)).toBe('within')
    expect(wordRangeStatus(100, range)).toBe('within')
    expect(wordRangeStatus(101, range)).toBe('over')
  })
})
