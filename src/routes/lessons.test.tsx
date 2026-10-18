import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getLessonsForModule, LESSONS, MODULES } from '../content'
import { PROGRESS_STORAGE_KEY } from '../features/progress/storage'
import { renderAt } from '../test/renderAt'

describe('course map (/learn)', () => {
  it('lists every module with a link to each of its lessons', () => {
    renderAt('/learn')

    for (const module of MODULES) {
      const section = screen.getByRole('region', { name: new RegExp(module.title) })
      const links = within(section).getAllByRole('link')
      expect(links).toHaveLength(getLessonsForModule(module.id).length)
    }
  })

  it('opens a lesson when its link is clicked', async () => {
    const { user } = renderAt('/learn')
    await user.click(screen.getByRole('link', { name: /The box model/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'The box model' })).toBeInTheDocument()
  })
})

describe('lesson reader (/learn/:lessonId)', () => {
  it.each(LESSONS.map((lesson) => [lesson.id, lesson.title]))(
    '%s renders its title',
    (id, title) => {
      renderAt(`/learn/${id}`)
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    },
  )

  it('shows "Lesson not found" for an unknown lesson id', () => {
    renderAt('/learn/not-a-real-lesson')
    expect(screen.getByRole('heading', { level: 1, name: 'Lesson not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to all lessons' })).toHaveAttribute(
      'href',
      '/learn',
    )
  })

  it('moves to the next lesson, and the first lesson has no "Previous"', async () => {
    const [first, second] = LESSONS
    const { user } = renderAt(`/learn/${first.id}`)
    const pager = screen.getByRole('navigation', { name: 'Lesson' })

    expect(within(pager).queryByText('Previous')).not.toBeInTheDocument()

    await user.click(within(pager).getByRole('link', { name: /Next/ }))
    expect(screen.getByRole('heading', { level: 1, name: second.title })).toBeInTheDocument()
  })

  it('has no "Next" on the last lesson', () => {
    renderAt(`/learn/${LESSONS[LESSONS.length - 1].id}`)
    const pager = screen.getByRole('navigation', { name: 'Lesson' })
    expect(within(pager).queryByText('Next')).not.toBeInTheDocument()
  })
})

describe('lesson completion', () => {
  const lesson = LESSONS[0]
  const checkboxName = "I've completed this lesson"

  it('marks a lesson complete, and the course map shows a checkmark', async () => {
    const { user } = renderAt(`/learn/${lesson.id}`)
    const checkbox = screen.getByRole('checkbox', { name: checkboxName })
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    // The sidebar and the breadcrumb both have a "Learn" link to /learn; either will do.
    await user.click(screen.getAllByRole('link', { name: 'Learn' })[0])
    expect(
      screen.getByRole('link', { name: (name) => name.startsWith(`${lesson.title} (completed)`) }),
    ).toBeInTheDocument()
    expect(screen.getByText(/1 of \d+ complete/)).toBeInTheDocument()
  })

  it('can be unmarked', async () => {
    const { user } = renderAt(`/learn/${lesson.id}`)
    const checkbox = screen.getByRole('checkbox', { name: checkboxName })
    await user.click(checkbox)
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('survives a reload', async () => {
    const { user, unmount } = renderAt(`/learn/${lesson.id}`)
    await user.click(screen.getByRole('checkbox', { name: checkboxName }))

    // Unmounting throws away all React state; only localStorage is left, like a page refresh.
    unmount()
    renderAt(`/learn/${lesson.id}`)
    expect(screen.getByRole('checkbox', { name: checkboxName })).toBeChecked()
  })

  it('starts fresh instead of crashing when saved data is corrupted', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{not valid json')
    renderAt(`/learn/${lesson.id}`)
    expect(screen.getByRole('checkbox', { name: checkboxName })).not.toBeChecked()
  })
})
