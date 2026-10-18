import { useParams } from 'react-router'

export function WritingPromptPage() {
  // useParams reads the :promptId part of the URL, e.g. /career/cover-letter → "cover-letter".
  const { promptId } = useParams()

  return (
    <>
      <h1>Writing prompt</h1>
      <p>
        Showing <code>{promptId}</code>. The writing editor arrives in Milestone 8.
      </p>
    </>
  )
}
