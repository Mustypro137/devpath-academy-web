import { BrowserRouter } from 'react-router'
import { AppRoutes } from './AppRoutes'
import { ProgressProvider } from './features/progress/ProgressProvider'

// BrowserRouter keeps the UI in sync with the address bar, so Back, refresh, and bookmarks work.
// ProgressProvider wraps everything, so every page can use useProgress().
function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ProgressProvider>
  )
}

export default App
