import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { applyTheme, loadTheme } from './features/theme/theme'

// Apply the saved theme before the first render, so the page doesn't flash the wrong colours.
applyTheme(loadTheme())

// Find the <div id="root"> in index.html and let React render the app inside it.
// StrictMode adds extra development-only checks; it does nothing in production.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
