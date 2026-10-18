import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router'
import { useTrackLastVisited } from '../../features/dashboard/useTrackLastVisited'
import styles from './AppShell.module.css'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

// The layout shared by every page. <Outlet /> is where React Router puts the current page.
export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  useTrackLastVisited() // for the dashboard's "Continue where you left off"

  // While the mobile menu is open, the Escape key closes it and returns focus to the button.
  useEffect(() => {
    if (!menuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Cleanup: remove the listener when the menu closes or the component unmounts.
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <div className={styles.shell}>
      {/* First thing a keyboard user reaches: lets them jump past the navigation. */}
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>

      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        menuButtonRef={menuButtonRef}
      />
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />

      {/* tabIndex={-1} lets the skip link move focus here without adding a Tab stop. */}
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
