import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getExercisesForLesson, LESSONS } from '../content'
import {
  createEmptyProgress,
  loadProgress,
  PROGRESS_STORAGE_KEY,
} from '../features/progress/storage'
import { finished } from '../test/progressFixtures'
import { renderAt } from '../test/renderAt'
import type { Progress } from '../types/progress'

const [firstLesson] = LESSONS
const firstExercise = getExercisesForLesson(firstLesson)[0]

// Starts the app with this progress already saved.
function renderWith(progress: Progress, path = '/') {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  return renderAt(path)
}

function upNext() {
  return screen.getByRole('region', { name: 'Up next' })
}

describe('dashboard (/) for a new learner', () => {
  it('suggests the assessment and shows empty progress', () => {
    renderAt('/')
    expect(within(upNext()).getByRole('link', { name: 'Start the assessment' })).toHaveAttribute(
      'href',
      '/assessment',
    )
    expect(
      screen.queryByRole('region', { name: 'Continue where you left off' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /Whole course/ })).toHaveAttribute('value', '0')
    expect(screen.getByRole('region', { name: 'Project' })).toHaveTextContent('0 of')
    expect(screen.getByRole('region', { name: 'Writing' })).toHaveTextContent(
      '0 of 6 prompts started',
    )
  })
})

describe('dashboard for a learner partway through', () => {
  it('remembers the last lesson opened and offers to continue there', async () => {
    const { user } = renderAt(`/learn/${firstLesson.id}`)
    expect(loadProgress().lastVisited).toBe(`/learn/${firstLesson.id}`)

    await user.click(screen.getByRole('checkbox', { name: "I've completed this lesson" }))
    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', {
        name: 'Dashboard',
      }),
    )

    // Up next: this lesson's first exercise. Continue: the lesson itself.
    expect(within(upNext()).getByRole('link')).toHaveAttribute(
      'href',
      `/exercises/${firstExercise.id}`,
    )
    const resume = screen.getByRole('region', { name: 'Continue where you left off' })
    expect(within(resume).getByRole('link', { name: firstLesson.title })).toHaveAttribute(
      'href',
      `/learn/${firstLesson.id}`,
    )
    expect(screen.getByText(/Lessons 1 of \d+ · Exercises passed 0 of/)).toBeInTheDocument()
  })

  it("doesn't offer the same page twice", () => {
    const progress = createEmptyProgress()
    progress.assessment.attempts.push({ completedAt: 'x', correct: 1, total: 15, byTopic: {} })
    progress.lastVisited = `/learn/${firstLesson.id}` // also where "Up next" points
    renderWith(progress)

    expect(within(upNext()).getByRole('link')).toHaveAttribute('href', `/learn/${firstLesson.id}`)
    expect(
      screen.queryByRole('region', { name: 'Continue where you left off' }),
    ).not.toBeInTheDocument()
  })

  it('only remembers content pages', () => {
    renderAt('/settings')
    expect(loadProgress().lastVisited).toBe('')
  })
})

describe('dashboard for a learner who has finished', () => {
  it('congratulates them, with everything at 100%', () => {
    renderWith(finished())
    expect(within(upNext()).getByText('You’ve done everything!')).toBeInTheDocument()
    const course = screen.getByRole('progressbar', { name: /Whole course/ })
    expect(course.getAttribute('value')).toBe(course.getAttribute('max'))
    for (const bar of screen.getAllByRole('progressbar')) {
      expect(bar).toHaveAccessibleName(/\(100%\)/) // every module too
    }
    expect(screen.getByRole('region', { name: 'Writing' })).toHaveTextContent('6 finished')
  })
})
