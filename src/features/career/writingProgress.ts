// How a writing prompt's saved entry changes. Pure functions, used with updateWriting().
import type { WritingPrompt } from '../../types/content'
import type { WritingProgress } from '../../types/progress'

export function startWriting(prompt: WritingPrompt): WritingProgress {
  return {
    draft: '',
    checklist: prompt.checklist.map(() => false),
    updatedAt: new Date().toISOString(),
  }
}

export function withDraft(current: WritingProgress, draft: string): WritingProgress {
  return { ...current, draft, updatedAt: new Date().toISOString() }
}

export function withCheck(
  current: WritingProgress,
  index: number,
  checked: boolean,
): WritingProgress {
  const checklist = [...current.checklist]
  // If items were added to the prompt since this was saved, the array is shorter: fill the gap.
  while (checklist.length <= index) checklist.push(false)
  checklist[index] = checked
  return { ...current, checklist, updatedAt: new Date().toISOString() }
}

// How many checklist items are ticked, counting only items the prompt still has.
export function countChecked(entry: WritingProgress | undefined, prompt: WritingPrompt): number {
  return prompt.checklist.filter((_, index) => entry?.checklist[index]).length
}
