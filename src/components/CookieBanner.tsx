import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [show, setShow] = useState(() => { try { return !localStorage.getItem('nikita_cookies') } catch { return false } })
  const ref = useRef<HTMLDivElement>(null)

  // Reserva espacio al final del pie de página mientras el aviso está visible.
  useEffect(() => {
    const el = ref.current
    const root = document.documentElement
    if (!show || !el) { root.style.removeProperty('--cookie-space'); return }
    const set = () => root.style.setProperty('--cookie-space', `${el.offsetHeight + 16}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => { ro.disconnect(); root.style.removeProperty('--cookie-space') }
  }, [show])

  if (!show) return null
  return (
    <div className="cookie" role="dialog" aria-label="Aviso de cookies" ref={ref}>
      <p>Usamos almacenamiento esencial para tu sesión y tu carrito. No usamos cookies de publicidad. <Link to="/legal/cookies">Más información</Link></p>
      <button className="btn dark small" onClick={() => { try { localStorage.setItem('nikita_cookies', '1') } catch { /* noop */ } setShow(false) }}>Entendido</button>
    </div>
  )
}
