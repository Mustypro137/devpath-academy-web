import { useId } from 'react'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  label: string // e.g. "Project progress"
  value: number
  max: number
  unit: string // e.g. "tasks", for "7 of 30 tasks done"
}

// The native <progress> element: browsers and screen readers already know it is a progress bar
// and read its value. The numbers are also written out, so nothing depends on the bar alone.
export function ProgressBar({ label, value, max, unit }: ProgressBarProps) {
  const id = useId()
  const percent = max === 0 ? 0 : Math.round((value / max) * 100)

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        <span>{label}</span>
        <span className={styles.numbers}>
          {value} of {max} {unit} done ({percent}%)
        </span>
      </label>
      <progress id={id} value={value} max={max} className={styles.bar}>
        {percent}%
      </progress>
    </div>
  )
}
