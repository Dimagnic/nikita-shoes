import type { ReactNode } from 'react'
const I = ({ children }: { children: ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
export const MenuIcon = () => <I><path d="M3 7h18M3 12h18M3 17h18" /></I>
export const CloseIcon = () => <I><path d="M5 5l14 14M19 5L5 19" /></I>
export const UserIcon = () => <I><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4.5 4.2-6 8-6s7 1.5 8 6" /></I>
export const BagIcon = () => <I><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></I>
export const SearchIcon = () => <I><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></I>
export const FacebookIcon = () => <I><path d="M14 21v-8h3l.5-3.5H14V7.8c0-1 .4-1.8 1.8-1.8h1.8V3.1C17.2 3 16.2 3 15.1 3 12.7 3 11 4.5 11 7.2v2.3H8V13h3v8z" /></I>
export const InstagramIcon = () => <I><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" /></I>
export const ArrowUpIcon = () => <I><path d="M12 19V5M5 12l7-7 7 7" /></I>
export const WhatsAppIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.86 11.86 0 0012.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.13 1.59 5.93L0 24l6.35-1.66a11.85 11.85 0 005.7 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.42-8.43zM12.06 21.8h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.88 9.88 0 01-1.52-5.27c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.9 7c0 5.45-4.44 9.9-9.86 9.9zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
  </svg>
)
