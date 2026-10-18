import { ProgressBar } from '../components/ProgressBar'
import { PROJECT } from '../content'
import { MilestoneChecklist } from '../features/project/MilestoneChecklist'
import styles from '../features/project/project.module.css'
import { countProjectTasks, currentMilestone } from '../features/project/projectProgress'
import { RepoLinkForm } from '../features/project/RepoLinkForm'
import { useProgress } from '../features/progress/useProgress'

export function ProjectPage() {
  const { progress, setProjectTask, setProjectRepoUrl } = useProgress()
  const done = progress.project.tasks
  // Both are calculated from the saved ticks on every render, so they can't get out of date.
  const overall = countProjectTasks(PROJECT, done)
  const current = currentMilestone(PROJECT, done)

  return (
    <>
      <h1>Project: {PROJECT.title}</h1>
      {PROJECT.brief.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      <ProgressBar label="Project progress" value={overall.done} max={overall.total} unit="tasks" />
      <p className={styles.next}>
        {current
          ? `Up next: milestone ${PROJECT.milestones.indexOf(current) + 1}, “${current.title}”.`
          : 'Every milestone is done. Congratulations on finishing the project!'}
      </p>

      {/* The same component for every milestone, each with its own data. */}
      {PROJECT.milestones.map((milestone, index) => (
        <MilestoneChecklist
          key={milestone.id}
          milestone={milestone}
          number={index + 1}
          done={done}
          onToggle={setProjectTask}
        />
      ))}

      <RepoLinkForm savedUrl={progress.project.repoUrl} onSave={setProjectRepoUrl} />
    </>
  )
}
