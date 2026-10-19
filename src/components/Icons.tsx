import type { ReactNode } from 'react'
const I = ({ children }: { children: ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
export const MenuIcon = () => <I><path d="M3 7h18M3 12h18M3 17h18" /></I>
export const CloseIcon = () => <I><path d="M5 5l14 14M19 5L5 19" /></I>
export const UserIcon = () => <I><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4.5 4.2-6 8-6s7 1.5 8 6" /></I>
export const BagIcon = () => <I><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></I>
export const SearchIcon = () => <I><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></I>
