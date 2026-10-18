// Pure functions for the project page: counting done tasks and checking the repository link.
import type { Project, ProjectMilestone, ProjectTask } from '../../types/content'

export interface TaskCount {
  done: number
  total: number
}

// `done` is the saved record of ticked tasks. A task missing from it counts as not done.
export function countTasks(
  tasks: readonly ProjectTask[],
  done: Record<string, boolean>,
): TaskCount {
  return { done: tasks.filter((task) => done[task.id]).length, total: tasks.length }
}

// Nested data: a project has milestones, a milestone has tasks. flatMap flattens the milestones'
// task lists into one list, so the overall count is just countTasks over all of them.
export function countProjectTasks(project: Project, done: Record<string, boolean>): TaskCount {
  return countTasks(
    project.milestones.flatMap((milestone) => milestone.tasks),
    done,
  )
}

// The first milestone with a task left to do, or undefined when everything is done.
export function currentMilestone(
  project: Project,
  done: Record<string, boolean>,
): ProjectMilestone | undefined {
  return project.milestones.find((milestone) => milestone.tasks.some((task) => !done[task.id]))
}

// Returns the cleaned-up link, or null if it isn't a web address (http:// or https://).
// `new URL()` throws on text that isn't a URL at all, like "my repo".
export function parseRepoUrl(text: string): string | null {
  try {
    const url = new URL(text.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
