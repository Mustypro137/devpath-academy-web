import { NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'
import styles from './Sidebar.module.css'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

// One component serves both screen sizes: a dropdown menu on phones (shown when `open`)
// and a permanent sidebar from 768px up. CSS decides which.
export function Sidebar({ open, onNavigate }: SidebarProps) {
  return (
    <nav id="site-nav" aria-label="Main" className={styles.sidebar} data-open={open}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            {/* NavLink adds aria-current="page" to the link for the current page. */}
            <NavLink to={item.to} end={item.end} className={styles.link} onClick={onNavigate}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
