// The main navigation links. Kept as data so the sidebar just loops over it.
export interface NavItem {
  to: string
  label: string
  // `end: true` means "only active on this exact URL". Without it, "/" would match every page.
  end?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/learn', label: 'Learn' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/project', label: 'Project' },
  { to: '/career', label: 'Career' },
  { to: '/settings', label: 'Settings' },
]
