// Everything the dashboard shows, worked out from saved progress by pure functions.
// Nothing here is stored: it is recalculated whenever progress changes, so it can't go stale.
import {
  getExercise,
  getExercisesForLesson,
  getLesson,
  getLessonsForModule,
  getWritingPrompt,
  LESSONS,
  MODULES,
  PROJECT,
  WRITING_PROMPTS,
} from '../../content'
import type { Module, WritingPrompt } from '../../types/content'
import type { Progress } from '../../types/progress'
import { countProjectTasks, currentMilestone } from '../project/projectProgress'

export interface Count {
  done: number
  total: number
}

// --- Where the learner was last ---------------------------------------------------------------

export interface Place {
  kind: 'Lesson' | 'Exercise' | 'Writing' | 'Project'
  title: string
}

// What a saved address points to, or undefined if it isn't a content page (or the content was
// removed). Only these pages count as somewhere to continue from.
export function describePlace(path: string): Place | undefined {
  const [, section, id] = path.split('/') // "/learn/js-functions" → ["", "learn", "js-functions"]
  if (section === 'learn' && id) {
    const lesson = getLesson(id)
    return lesson && { kind: 'Lesson', title: lesson.title }
  }
  if (section === 'exercises' && id) {
    const exercise = getExercise(id)
    return exercise && { kind: 'Exercise', title: exercise.title }
  }
  if (section === 'career' && id) {
    const prompt = getWritingPrompt(id)
    return prompt && { kind: 'Writing', title: prompt.title }
  }
  if (path === '/project') return { kind: 'Project', title: PROJECT.title }
  return undefined
}

// --- Progress counts --------------------------------------------------------------------------

function isPassed(progress: Progress, exerciseId: string): boolean {
  return progress.exercises[exerciseId]?.status === 'passed'
}

export interface ModuleProgress {
  module: Module
  lessons: Count
  exercises: Count
}

export function moduleProgress(progress: Progress): ModuleProgress[] {
  return MODULES.map((module) => {
    const lessons = getLessonsForModule(module.id)
    const exercises = lessons.flatMap(getExercisesForLesson)
    return {
      module,
      lessons: {
        done: lessons.filter((lesson) => lesson.id in progress.lessons).length,
        total: lessons.length,
      },
      exercises: {
        done: exercises.filter((exercise) => isPassed(progress, exercise.id)).length,
        total: exercises.length,
      },
    }
  })
}

// The whole course: every lesson and exercise counts as one item.
export function courseProgress(modules: ModuleProgress[]): Count {
  return modules.reduce(
    (sum, { lessons, exercises }) => ({
      done: sum.done + lessons.done + exercises.done,
      total: sum.total + lessons.total + exercises.total,
    }),
    { done: 0, total: 0 },
  )
}

// A writing prompt is finished when it has a draft and every checklist item is ticked.
function isWritingFinished(progress: Progress, prompt: WritingPrompt): boolean {
  const entry = progress.writing[prompt.id]
  return (
    !!entry &&
    entry.draft.trim() !== '' &&
    prompt.checklist.every((_, index) => entry.checklist[index])
  )
}

export function writingSummary(progress: Progress): {
  started: number
  finished: number
  total: number
} {
  return {
    started: WRITING_PROMPTS.filter((prompt) => progress.writing[prompt.id]?.draft.trim()).length,
    finished: WRITING_PROMPTS.filter((prompt) => isWritingFinished(progress, prompt)).length,
    total: WRITING_PROMPTS.length,
  }
}

// --- What to do next --------------------------------------------------------------------------

export interface NextStep {
  title: string
  reason: string
  to: string
  linkText: string
}

function hasStarted(progress: Progress): boolean {
  return (
    Object.keys(progress.lessons).length > 0 ||
    Object.values(progress.exercises).some((entry) => entry.attempts > 0) ||
    progress.assessment.attempts.length > 0 ||
    Object.values(progress.project.tasks).some(Boolean) ||
    Object.values(progress.writing).some((entry) => entry.draft.trim() !== '')
  )
}

// The course order: each lesson, then its exercises; then the project; then writing.
export function nextStep(progress: Progress): NextStep {
  if (!hasStarted(progress)) {
    return {
      title: 'Take the skill assessment',
      reason: 'Find out what you already know, and get a recommended starting point.',
      to: '/assessment',
      linkText: 'Start the assessment',
    }
  }

  for (const lesson of LESSONS) {
    if (!(lesson.id in progress.lessons)) {
      return {
        title: `Read “${lesson.title}”`,
        reason: 'The next lesson in the course.',
        to: `/learn/${lesson.id}`,
        linkText: 'Open the lesson',
      }
    }
    const exercise = getExercisesForLesson(lesson).find((ex) => !isPassed(progress, ex.id))
    if (exercise) {
      return {
        title: `Practise: “${exercise.title}”`,
        reason: `An exercise for “${lesson.title}”, which you’ve read.`,
        to: `/exercises/${exercise.id}`,
        linkText: 'Open the exercise',
      }
    }
  }

  const milestone = currentMilestone(PROJECT, progress.project.tasks)
  if (milestone) {
    const number = PROJECT.milestones.indexOf(milestone) + 1
    return {
      title: `Project milestone ${number}: “${milestone.title}”`,
      reason: 'You’ve finished the lessons and exercises. Now put them together in a real project.',
      to: '/project',
      linkText: 'Go to the project',
    }
  }

  const prompt = WRITING_PROMPTS.find((p) => !isWritingFinished(progress, p))
  if (prompt) {
    return {
      title: `Write: “${prompt.title}”`,
      reason: 'Clear writing matters as much as code. Finish the draft and its checklist.',
      to: `/career/${prompt.id}`,
      linkText: 'Open the writing prompt',
    }
  }

  return {
    title: 'You’ve done everything!',
    reason:
      'Every lesson, exercise, project task, and writing prompt is complete. Retake the assessment to see how far you’ve come.',
    to: '/assessment',
    linkText: 'Retake the assessment',
  }
}

// --- All of it together -----------------------------------------------------------------------

export interface DashboardSummary {
  lastPlace: (Place & { path: string }) | undefined
  modules: ModuleProgress[]
  course: Count
  project: Count
  writing: ReturnType<typeof writingSummary>
  next: NextStep
}

export function summarizeDashboard(progress: Progress): DashboardSummary {
  const place = progress.lastVisited ? describePlace(progress.lastVisited) : undefined
  const modules = moduleProgress(progress)
  return {
    lastPlace: place && { ...place, path: progress.lastVisited },
    modules,
    course: courseProgress(modules),
    project: countProjectTasks(PROJECT, progress.project.tasks),
    writing: writingSummary(progress),
    next: nextStep(progress),
  }
}
