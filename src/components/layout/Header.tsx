import type { Ref } from 'react'
import { Link } from 'react-router'
import styles from './Header.module.css'

interface HeaderProps {
  menuOpen: boolean
  onToggleMenu: () => void
  menuButtonRef: Ref<HTMLButtonElement>
}

export function Header({ menuOpen, onToggleMenu, menuButtonRef }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        DevPath Academy
      </Link>

      {/* Only visible on small screens (see Header.module.css). aria-expanded tells screen
          readers whether the menu is open; aria-controls points at the menu it opens. */}
      <button
        ref={menuButtonRef}
        type="button"
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={onToggleMenu}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20">
          {menuOpen ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
        Menu
      </button>
    </header>
  )
}
