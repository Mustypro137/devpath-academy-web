// Counting words: split on any whitespace (spaces, tabs, new lines), then keep the pieces that
// contain at least one letter or digit, so a lone "-" or "#" doesn't count as a word.
// \p{L} means "any letter" and \p{N} "any digit" in any alphabet; the `u` flag enables them.
export function countWords(text: string): number {
  return text.split(/\s+/).filter((piece) => /[\p{L}\p{N}]/u.test(piece)).length
}

export type WordRangeStatus = 'empty' | 'under' | 'within' | 'over'

export function wordRangeStatus(
  words: number,
  range: { min: number; max: number },
): WordRangeStatus {
  if (words === 0) return 'empty'
  if (words < range.min) return 'under'
  if (words > range.max) return 'over'
  return 'within'
}
