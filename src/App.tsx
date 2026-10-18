import { BrowserRouter } from 'react-router'
import { AppRoutes } from './AppRoutes'

// BrowserRouter keeps the UI in sync with the address bar, so Back, refresh, and bookmarks work.
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
