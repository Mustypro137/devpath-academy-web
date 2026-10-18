import { describe, expect, it } from 'vitest'
import type { Project } from '../../types/content'
import { countProjectTasks, countTasks, currentMilestone, parseRepoUrl } from './projectProgress'

// A small made-up project: two milestones, three tasks.
const project: Project = {
  id: 'p',
  title: 'P',
  brief: [],
  milestones: [
    {
      id: 'one',
      title: 'One',
      goal: '',
      hints: [],
      tasks: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
      ],
    },
    { id: 'two', title: 'Two', goal: '', hints: [], tasks: [{ id: 'c', text: '' }] },
  ],
}

describe('countTasks', () => {
  it('counts ticked tasks, treating unticked and missing ones as not done', () => {
    const [one] = project.milestones
    expect(countTasks(one.tasks, {})).toEqual({ done: 0, total: 2 })
    expect(countTasks(one.tasks, { a: true, b: false })).toEqual({ done: 1, total: 2 })
  })

  it('ignores saved ticks for tasks that no longer exist', () => {
    expect(countTasks(project.milestones[0].tasks, { a: true, removed: true })).toEqual({
      done: 1,
      total: 2,
    })
  })
})

describe('countProjectTasks', () => {
  it('counts across every milestone', () => {
    expect(countProjectTasks(project, { a: true, c: true })).toEqual({ done: 2, total: 3 })
  })
})

describe('currentMilestone', () => {
  it('is the first milestone with a task left', () => {
    expect(currentMilestone(project, {})?.id).toBe('one')
    expect(currentMilestone(project, { a: true, b: true })?.id).toBe('two')
    // Skipping ahead doesn't hide an unfinished earlier milestone.
    expect(currentMilestone(project, { c: true })?.id).toBe('one')
  })

  it('is undefined when every task is done', () => {
    expect(currentMilestone(project, { a: true, b: true, c: true })).toBeUndefined()
  })
})

describe('parseRepoUrl', () => {
  it('accepts web addresses, trimming spaces', () => {
    expect(parseRepoUrl('  https://github.com/me/task-tracker ')).toBe(
      'https://github.com/me/task-tracker',
    )
  })

  it.each(['', 'my repo', 'github.com/me/repo', 'javascript:alert(1)', 'ftp://example.com'])(
    'rejects %j',
    (text) => {
      expect(parseRepoUrl(text)).toBeNull()
    },
  )
})
