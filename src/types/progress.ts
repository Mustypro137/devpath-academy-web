// The shape of the learner's saved progress. Stored in localStorage and in exported files.
// Later milestones add sections (exercises, assessment, ...). A section missing from older saved
// data is filled in as empty when loading, so adding one doesn't need a new version.
// Bump `version` (and add a migration in features/progress/storage.ts) only when an existing
// field changes meaning or shape.

export const PROGRESS_VERSION = 1

export interface LessonProgress {
  completedAt: string // ISO date, e.g. "2026-10-18T13:00:00.000Z"
}

export interface Progress {
  version: typeof PROGRESS_VERSION
  lessons: Record<string, LessonProgress> // keyed by lesson id
}
