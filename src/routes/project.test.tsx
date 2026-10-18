import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PROJECT } from '../content'
import {
  createEmptyProgress,
  loadProgress,
  PROGRESS_STORAGE_KEY,
} from '../features/progress/storage'
import { renderAt } from '../test/renderAt'

const [first, second] = PROJECT.milestones
const allTasks = PROJECT.milestones.flatMap((milestone) => milestone.tasks)
const total = allTasks.length

function milestoneRegion(index: number) {
  const milestone = PROJECT.milestones[index]
  return screen.getByRole('region', { name: `${index + 1}. ${milestone.title}` })
}

// Starts the app with these task ids already ticked.
function renderWithTicked(taskIds: string[]) {
  const progress = createEmptyProgress()
  progress.project.tasks = Object.fromEntries(taskIds.map((id) => [id, true]))
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  return renderAt('/project')
}

describe('project page (/project)', () => {
  it('shows every milestone with its tasks, and an empty progress bar', () => {
    renderAt('/project')
    PROJECT.milestones.forEach((milestone, index) => {
      expect(within(milestoneRegion(index)).getAllByRole('checkbox')).toHaveLength(
        milestone.tasks.length,
      )
    })
    const bar = screen.getByRole('progressbar', { name: /Project progress/ })
    expect(bar).toHaveAttribute('value', '0')
    expect(bar).toHaveAttribute('max', String(total))
    expect(screen.getByText(`0 of ${total} tasks done (0%)`)).toBeInTheDocument()
    expect(screen.getByText(`Up next: milestone 1, “${first.title}”.`)).toBeInTheDocument()
  })

  it('ticks a task, updates the counts, and keeps it after a reload', async () => {
    const { user, unmount } = renderAt('/project')
    const region = milestoneRegion(0)
    await user.click(within(region).getAllByRole('checkbox')[0])

    expect(within(region).getByText(`1 of ${first.tasks.length} tasks done`)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /Project progress/ })).toHaveAttribute(
      'value',
      '1',
    )
    expect(loadProgress().project.tasks[first.tasks[0].id]).toBe(true)

    unmount()
    renderAt('/project')
    expect(within(milestoneRegion(0)).getAllByRole('checkbox')[0]).toBeChecked()
  })

  it('unticks a task', async () => {
    const { user } = renderWithTicked([first.tasks[0].id])
    const checkbox = within(milestoneRegion(0)).getAllByRole('checkbox')[0]
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText(`0 of ${total} tasks done (0%)`)).toBeInTheDocument()
  })

  it('marks a finished milestone complete and moves "Up next" on', () => {
    renderWithTicked(first.tasks.map((task) => task.id))
    expect(within(milestoneRegion(0)).getByText('✓ Complete')).toBeInTheDocument()
    expect(screen.getByText(`Up next: milestone 2, “${second.title}”.`)).toBeInTheDocument()
  })

  it('celebrates when every task is done', () => {
    renderWithTicked(allTasks.map((task) => task.id))
    expect(screen.getByText(`${total} of ${total} tasks done (100%)`)).toBeInTheDocument()
    expect(screen.getByText(/Congratulations on finishing the project/)).toBeInTheDocument()
  })

  it('keeps hints folded away until asked for', async () => {
    const { user } = renderAt('/project')
    const summary = within(milestoneRegion(0)).getByText(/Hints for this milestone/)
    const details = summary.closest('details')!
    expect(details).not.toHaveAttribute('open')
    await user.click(summary)
    expect(details).toHaveAttribute('open')
  })
})

describe('repository link', () => {
  it('rejects text that is not a web address', async () => {
    const { user } = renderAt('/project')
    const input = screen.getByLabelText('Repository link')
    await user.type(input, 'my repo')
    await user.click(screen.getByRole('button', { name: 'Save link' }))

    expect(screen.getByRole('alert')).toHaveTextContent('starting with https://')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/starting with https:\/\//)
    expect(loadProgress().project.repoUrl).toBe('')
  })

  it('saves a valid link, shows it, and keeps it after a reload', async () => {
    const { user, unmount } = renderAt('/project')
    await user.type(screen.getByLabelText('Repository link'), 'https://github.com/me/task-tracker')
    await user.click(screen.getByRole('button', { name: 'Save link' }))

    expect(screen.getByRole('status')).toHaveTextContent('Link saved.')
    expect(
      screen.getByRole('link', { name: 'https://github.com/me/task-tracker' }),
    ).toHaveAttribute('href', 'https://github.com/me/task-tracker')

    unmount()
    renderAt('/project')
    expect(screen.getByLabelText('Repository link')).toHaveValue(
      'https://github.com/me/task-tracker',
    )
  })

  it('removes the link when saved empty', async () => {
    const { user } = renderAt('/project')
    const input = screen.getByLabelText('Repository link')
    await user.type(input, 'https://github.com/me/tt')
    await user.click(screen.getByRole('button', { name: 'Save link' }))
    await user.clear(input)
    await user.click(screen.getByRole('button', { name: 'Save link' }))

    expect(loadProgress().project.repoUrl).toBe('')
    expect(screen.queryByRole('link', { name: /github\.com\/me/ })).not.toBeInTheDocument()
  })
})
