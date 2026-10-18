import type { ProjectMilestone } from '../../types/content'
import { InlineText } from '../lessons/InlineText'
import styles from './project.module.css'
import { countTasks } from './projectProgress'

interface MilestoneChecklistProps {
  milestone: ProjectMilestone
  number: number // 1-based position in the project
  done: Record<string, boolean>
  onToggle: (taskId: string, done: boolean) => void
}

// One milestone: its goal, a checklist of tasks, and folded-away hints. Used once per milestone.
export function MilestoneChecklist({ milestone, number, done, onToggle }: MilestoneChecklistProps) {
  const count = countTasks(milestone.tasks, done)
  const complete = count.done === count.total
  const headingId = `milestone-${milestone.id}`

  return (
    <section aria-labelledby={headingId} className={styles.milestone}>
      <h2 id={headingId} className={styles.milestoneTitle}>
        {number}. {milestone.title}
      </h2>
      <p className={styles.milestoneStatus}>
        {complete ? '✓ Complete' : `${count.done} of ${count.total} tasks done`}
      </p>
      <p>
        <strong>Goal:</strong> <InlineText text={milestone.goal} />
      </p>

      <ul className={styles.tasks}>
        {milestone.tasks.map((task) => (
          <li key={task.id}>
            {/* The input inside its label: clicking the text ticks the box, and the text is
                the checkbox's accessible name. */}
            <label className={styles.task}>
              <input
                type="checkbox"
                checked={done[task.id] ?? false}
                onChange={(event) => onToggle(task.id, event.target.checked)}
              />
              <span>
                <InlineText text={task.text} />
              </span>
            </label>
          </li>
        ))}
      </ul>

      {/* <details> folds the hints away until asked for, with no JavaScript needed. */}
      <details className={styles.hints}>
        <summary>Hints for this milestone ({milestone.hints.length})</summary>
        <ul>
          {milestone.hints.map((hint, index) => (
            <li key={index}>
              <InlineText text={hint} />
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
