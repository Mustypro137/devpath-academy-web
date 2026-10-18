import { useEffect, useRef } from 'react'
import type { AssessmentQuestion } from '../../types/content'
import { InlineText } from '../lessons/InlineText'
import { LessonContent } from '../lessons/LessonContent'
import styles from './assessment.module.css'

interface QuestionCardProps {
  question: AssessmentQuestion
  number: number // 1-based, for "Question 3 of 15"
  total: number
  selected: number | null
  onSelect: (option: number) => void
}

export function QuestionCard({ question, number, total, selected, onSelect }: QuestionCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Each question replaces the last one on the same page, so move keyboard focus to the new
  // heading. Screen readers then read "Question 3 of 15", and Tab continues from there.
  useEffect(() => {
    headingRef.current?.focus()
  }, [question.id])

  return (
    <>
      {/* tabIndex={-1}: focusable from code, but not a stop when tabbing through the page. */}
      <h2 ref={headingRef} tabIndex={-1} className={styles.questionNumber}>
        Question {number} of {total}
      </h2>

      {/* A fieldset groups the radio buttons; its legend is the question, so screen readers
          announce it with every option ("What is 7 % 2? radio button, 1, 3 of 4"). */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.prompt}>
          <InlineText text={question.prompt} />
        </legend>

        {question.code && (
          <LessonContent blocks={[{ type: 'code', language: 'js', code: question.code }]} />
        )}

        <div className={styles.options}>
          {question.options.map((option, index) => (
            <label key={option} className={styles.option}>
              <input
                type="radio"
                // One name per question: the browser lets only one option in the group be chosen,
                // and the arrow keys move between them.
                name={`question-${question.id}`}
                checked={selected === index}
                onChange={() => onSelect(index)}
              />
              <span>
                <InlineText text={option} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}
