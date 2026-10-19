import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [show, setShow] = useState(() => { try { return !localStorage.getItem('nikita_cookies') } catch { return false } })
  if (!show) return null
  return (
    <div className="cookie" role="dialog" aria-label="Aviso de cookies">
      <p>Usamos almacenamiento esencial para tu sesión y tu carrito. No usamos cookies de publicidad. <Link to="/legal/cookies">Más información</Link></p>
      <button className="btn dark small" onClick={() => { try { localStorage.setItem('nikita_cookies', '1') } catch { /* noop */ } setShow(false) }}>Entendido</button>
    </div>
  )
}
