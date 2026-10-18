import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { CodeEditor } from '../components/CodeEditor'
import { getExercise, getLessonForExercise } from '../content'
import type { RunOutcome } from '../features/exercises/checker'
import {
  addSubmission,
  revealNextHint,
  startExercise,
  toSubmission,
} from '../features/exercises/exerciseProgress'
import { HintPanel } from '../features/exercises/HintPanel'
import { runHtmlChecks } from '../features/exercises/htmlRunner'
import { HtmlPreview } from '../features/exercises/HtmlPreview'
import { runCode } from '../features/exercises/runner'
import { SolutionReveal } from '../features/exercises/SolutionReveal'
import { SubmissionHistory } from '../features/exercises/SubmissionHistory'
import { TestResults } from '../features/exercises/TestResults'
import { InlineText } from '../features/lessons/InlineText'
import { useProgress } from '../features/progress/useProgress'
import type { Exercise } from '../types/content'
import type { ExerciseProgress } from '../types/progress'
import styles from './ExercisePage.module.css'

export function ExercisePage() {
  // useParams reads the :exerciseId part of the URL, e.g. /exercises/js-double → "js-double".
  const { exerciseId } = useParams()
  const exercise = getExercise(exerciseId)

  if (!exercise) {
    return (
      <>
        <h1>Exercise not found</h1>
        <p>There is no exercise with this address.</p>
        <p>
          <Link to="/learn">Back to all lessons</Link>
        </p>
      </>
    )
  }

  // `key` gives each exercise its own fresh copy of the workspace's state (like the last
  // results), so moving to another exercise never shows the previous one's results.
  return <ExerciseWorkspace key={exercise.id} exercise={exercise} />
}

function statusText(entry: ExerciseProgress | undefined): string {
  if (!entry || entry.attempts === 0) return 'Not attempted yet'
  const attempts = `${entry.attempts} ${entry.attempts === 1 ? 'run' : 'runs'}`
  if (entry.status === 'passed') {
    return entry.solutionViewed ? `Solved with the solution (${attempts})` : `Passed (${attempts})`
  }
  return `In progress (${attempts})`
}

// A separate component because hooks (useState, useProgress) can't come after the early
// `return` above: React needs the same hooks, in the same order, on every render.
function ExerciseWorkspace({ exercise }: { exercise: Exercise }) {
  const { getExerciseProgress, updateExercise } = useProgress()
  const saved = getExerciseProgress(exercise.id)
  const entry = saved ?? startExercise(exercise)
  const lesson = getLessonForExercise(exercise.id)
  // The editor's language: HTML/CSS exercises are one HTML document with a <style> element.
  const editorLanguage = exercise.language === 'js' ? 'js' : 'html'

  // The last run's results only matter while the page is open, so they live in React state
  // rather than in saved progress. The submission history keeps a summary of each run.
  const [outcome, setOutcome] = useState<RunOutcome | null>(null)
  const [running, setRunning] = useState(false)

  // Every change goes through here: start from the saved entry, or a fresh one.
  function update(change: (current: ExerciseProgress) => ExerciseProgress) {
    updateExercise(exercise.id, (current) => change(current ?? startExercise(exercise)))
  }

  // The editor's text is saved on every change, so it is still there after a refresh.
  function setCode(code: string) {
    update((current) => ({ ...current, lastCode: code }))
  }

  async function handleRun() {
    if (running) return
    const code = entry.lastCode
    setRunning(true)
    // `await` pauses this function until the Worker or checker iframe answers (or the timeout
    // stops it). The rest of the page keeps working in the meantime.
    const result =
      exercise.language === 'js'
        ? await runCode({ code, functionName: exercise.functionName, tests: exercise.tests })
        : await runHtmlChecks(code, exercise.tests)
    setRunning(false)
    setOutcome(result)
    update((current) => addSubmission(current, toSubmission(code, result, exercise.tests.length)))
  }

  function handleStartOver() {
    if (window.confirm('Replace your code with the starter code?')) {
      setCode(exercise.starterCode)
      setOutcome(null)
    }
  }

  return (
    <article>
      {lesson && (
        <p className={styles.breadcrumb}>
          <Link to={`/learn/${lesson.id}`}>{lesson.title}</Link> / Exercise
        </p>
      )}
      <h1>{exercise.title}</h1>
      <p className={styles.status}>{statusText(saved)}</p>

      {exercise.instructions.map((paragraph, index) => (
        <p key={index}>
          <InlineText text={paragraph} />
        </p>
      ))}

      <CodeEditor
        label="Your code"
        language={editorLanguage}
        value={entry.lastCode}
        onChange={setCode}
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.run}
          onClick={handleRun}
          // aria-disabled instead of disabled: a disabled button loses keyboard focus.
          aria-disabled={running}
        >
          {running ? 'Running…' : 'Run tests'}
        </button>
        <button type="button" onClick={handleStartOver}>
          Start over
        </button>
      </div>

      <TestResults outcome={outcome} language={exercise.language} />

      {exercise.language === 'html-css' && <HtmlPreview code={entry.lastCode} />}

      <HintPanel
        hints={exercise.hints}
        hintsUsed={entry.hintsUsed}
        onReveal={() => update((current) => revealNextHint(current, exercise))}
      />

      <SolutionReveal
        language={editorLanguage}
        solution={exercise.solution}
        explanation={exercise.explanation}
        revealed={entry.solutionViewed}
        canReveal={entry.hintsUsed >= exercise.hints.length}
        onReveal={() => update((current) => ({ ...current, solutionViewed: true }))}
      />

      <SubmissionHistory submissions={entry.submissions} onLoad={setCode} />
    </article>
  )
}
