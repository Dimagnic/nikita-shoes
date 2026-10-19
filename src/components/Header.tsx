import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { CATEGORIES } from '../types'
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './Icons'

export default function Header() {
  const { user, isAdmin, openAuth, signOut } = useAuth()
  const { count, setOpen } = useCart()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const loc = useLocation()
  const nav = useNavigate()

  useEffect(() => { setMenu(false); setSearch(false) }, [loc.pathname, loc.search])
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : '' }, [menu])

  const goAccount = () => (user ? nav('/cuenta') : openAuth('login'))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) nav(`/tienda?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="hdr">
      <div className="announce">Envíos a todo México · Cambios en 30 días</div>
      <div className="wrap hdr-row">
        <div className="hdr-left">
          <button className="icon-btn only-mobile" aria-label="Abrir menú" onClick={() => setMenu(true)}><MenuIcon /></button>
          <Link className="only-desktop txt-link" to="/contacto">Contáctanos</Link>
        </div>
        <Link className="logo" to="/" aria-label="Nikita Shoes, inicio"><img src="/img/logo.png" alt="Nikita" /></Link>
        <div className="hdr-actions">
          <button className="icon-btn" aria-label="Buscar" onClick={() => setSearch((s) => !s)}><SearchIcon /></button>
          <button className="icon-btn" aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'} onClick={goAccount}><UserIcon /></button>
          <button className="icon-btn cart-btn" aria-label={`Carrito, ${count} artículos`} onClick={() => setOpen(true)}>
            <BagIcon />{count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
      </div>

      <nav className="only-desktop desk-nav" aria-label="Principal">
        <NavLink to="/tienda">Novedades</NavLink>
        {CATEGORIES.slice(0, 4).map((c) => <NavLink key={c.slug} to={`/tienda?cat=${c.slug}`}>{c.label}</NavLink>)}
        <NavLink to="/nosotros">Nosotros</NavLink>
      </nav>

      {search && (
        <form className="searchbar wrap" onSubmit={submit} role="search">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar zapatos" aria-label="Buscar zapatos" />
          <button className="btn dark small">Buscar</button>
        </form>
      )}

      <div className={`veil ${menu ? 'on' : ''}`} onClick={() => setMenu(false)} />
      <aside className={`drawer left ${menu ? 'on' : ''}`} aria-hidden={!menu} aria-label="Menú">
        <div className="drawer-head">
          <img src="/img/logo.png" alt="Nikita" height={48} />
          <button className="icon-btn" aria-label="Cerrar menú" onClick={() => setMenu(false)}><CloseIcon /></button>
        </div>
        <nav className="menu-list">
          <Link to="/tienda">Novedades</Link>
          {CATEGORIES.map((c) => <Link key={c.slug} to={`/tienda?cat=${c.slug}`}>{c.label}</Link>)}
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contáctanos</Link>
        </nav>
        <div className="menu-foot">
          {user ? (
            <>
              <Link to="/cuenta">Mi cuenta</Link>
              {isAdmin && <Link to="/admin">Panel de administración</Link>}
              <button className="linkish" onClick={() => signOut()}>Cerrar sesión</button>
            </>
          ) : (
            <button className="btn dark" onClick={() => { setMenu(false); openAuth('login') }}>Iniciar sesión o crear cuenta</button>
          )}
        </div>
      </aside>
    </header>
  )
}
