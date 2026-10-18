import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ASSESSMENT_QUESTIONS } from '../content'
import { loadProgress } from '../features/progress/storage'
import { renderAt } from '../test/renderAt'
import type { AssessmentQuestion } from '../types/content'

const total = ASSESSMENT_QUESTIONS.length

// Answers every question, choosing the option `pick` returns, then opens the results.
async function answerAll(user: UserEvent, pick: (question: AssessmentQuestion) => number) {
  for (const question of ASSESSMENT_QUESTIONS) {
    const radios = within(screen.getByRole('group')).getAllByRole('radio')
    await user.click(radios[pick(question)])
    await user.click(screen.getByRole('button', { name: /Next question|See my results/ }))
  }
}
const right = (question: AssessmentQuestion) => question.correctIndex
const wrong = (question: AssessmentQuestion) =>
  (question.correctIndex + 1) % question.options.length

async function start() {
  const result = renderAt('/assessment')
  await result.user.click(screen.getByRole('button', { name: 'Start the assessment' }))
  return result
}

describe('skill assessment (/assessment)', () => {
  it('shows one question at a time, and moves focus to it', async () => {
    await start()
    const heading = screen.getByRole('heading', { name: `Question 1 of ${total}` })
    expect(heading).toHaveFocus()
    // The fieldset's legend is the question, so the radio group is named after it.
    expect(screen.getByRole('group')).toHaveAccessibleName(/keyword declares a variable/)
    expect(screen.getAllByRole('radio')).toHaveLength(ASSESSMENT_QUESTIONS[0].options.length)
  })

  it("won't continue without an answer, and explains why", async () => {
    const { user } = await start()
    await user.click(screen.getByRole('button', { name: 'Next question' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Choose an answer to continue.')
    expect(screen.getByRole('heading', { name: `Question 1 of ${total}` })).toBeInTheDocument()

    await user.click(screen.getAllByRole('radio')[0])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('goes back to the previous question with its answer still chosen', async () => {
    const { user } = await start()
    await user.click(screen.getAllByRole('radio')[2])
    await user.click(screen.getByRole('button', { name: 'Next question' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: `Question 1 of ${total}` })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')[2]).toBeChecked()
  })

  it('scores a perfect run, shows explanations, and saves the attempt', async () => {
    const { user } = await start()
    await answerAll(user, right)

    expect(screen.getByRole('heading', { name: 'Your results' })).toHaveFocus()
    expect(screen.getByText(`You got ${total} of ${total} right (100%).`)).toBeInTheDocument()

    const table = screen.getByRole('table', { name: 'Score by topic' })
    expect(within(table).getByRole('rowheader', { name: 'Functions' })).toBeInTheDocument()

    expect(screen.getAllByText(/✓ Correct/)).toHaveLength(total)
    expect(screen.getByText(/the name always points at the same value/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pick an exercise/ })).toHaveAttribute('href', '/learn')

    const { attempts } = loadProgress().assessment
    expect(attempts).toHaveLength(1)
    expect(attempts[0]).toMatchObject({ correct: total, total })
  })

  it('recommends the first lesson after a low score, and shows the right answers', async () => {
    const { user } = await start()
    await answerAll(user, wrong)

    expect(screen.getByText(`You got 0 of ${total} right (0%).`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start the first JavaScript lesson' })).toHaveAttribute(
      'href',
      '/learn/js-values-and-variables',
    )
    expect(screen.getAllByText(/✗ Incorrect/)).toHaveLength(total)
    expect(screen.getAllByText(/The answer is/)).toHaveLength(total)
  })

  it('remembers the last result, and the dashboard shows it', async () => {
    const { user, unmount } = await start()
    await answerAll(user, right)
    await user.click(screen.getByRole('button', { name: 'Take the assessment again' }))
    expect(
      screen.getByText(new RegExp(`Your last result: ${total} of ${total}`)),
    ).toBeInTheDocument()
    unmount()

    renderAt('/')
    const section = screen.getByRole('region', { name: 'Skill assessment' })
    expect(section).toHaveTextContent(`Latest score: ${total} of ${total} (100%)`)
  })

  it('invites a new learner to take it from the dashboard', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Take the skill assessment' })).toHaveAttribute(
      'href',
      '/assessment',
    )
  })
})
