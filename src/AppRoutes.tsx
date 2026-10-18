import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { AssessmentPage } from './routes/AssessmentPage'
import { CareerPage } from './routes/CareerPage'
import { DashboardPage } from './routes/DashboardPage'
import { LearnPage } from './routes/LearnPage'
import { LessonPage } from './routes/LessonPage'
import { NotFoundPage } from './routes/NotFoundPage'
import { ProjectPage } from './routes/ProjectPage'
import { SettingsPage } from './routes/SettingsPage'
import { WritingPromptPage } from './routes/WritingPromptPage'

// Lazy loading: the exercise page (and the large CodeMirror editor inside it) is downloaded
// only when someone first opens an exercise, so every other page loads faster.
// lazy() expects a default export, so `.then` renames ExercisePage to `default`.
const ExercisePage = lazy(() =>
  import('./routes/ExercisePage').then((module) => ({ default: module.ExercisePage })),
)

// Every URL in the app. The outer <Route> has no path: it's a "layout route" that wraps all the
// pages in the AppShell. Kept separate from <BrowserRouter> so tests can use a MemoryRouter.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:lessonId" element={<LessonPage />} />
        <Route
          path="exercises/:exerciseId"
          element={
            // Suspense shows the fallback while the lazy page is still downloading.
            <Suspense fallback={<p>Loading exercise…</p>}>
              <ExercisePage />
            </Suspense>
          }
        />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="project" element={<ProjectPage />} />
        <Route path="career" element={<CareerPage />} />
        <Route path="career/:promptId" element={<WritingPromptPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* "*" matches anything not listed above. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
