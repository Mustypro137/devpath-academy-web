import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>There is no page at this address. It may have moved, or the link may be mistyped.</p>
      <p>
        <Link to="/">Go to the dashboard</Link>
      </p>
    </>
  )
}
