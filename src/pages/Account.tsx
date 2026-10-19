import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { dateMx, money } from '../lib/format'
import { useTitle } from '../lib/useTitle'
import { BIZ } from '../config/business'
import { STATUS_LABEL, type Address, type Order } from '../types'

export function AccountLayout() {
  const { profile, user, isAdmin, signOut } = useAuth()
  useTitle('Mi cuenta')
  return (
    <div className="wrap section tight">
      <div className="sh left"><h1>Mi cuenta</h1><p className="muted">Hola, {profile?.full_name || user?.email}</p></div>
      <div className="acc">
        <nav className="acc-nav" aria-label="Cuenta">
          <NavLink to="/cuenta" end>Pedidos</NavLink>
          <NavLink to="/cuenta/perfil">Perfil</NavLink>
          <NavLink to="/cuenta/direcciones">Direcciones</NavLink>
          {isAdmin && <NavLink to="/admin">Administración</NavLink>}
          <button className="linkish" onClick={() => signOut()}>Cerrar sesión</button>
        </nav>
        <div className="acc-main"><Outlet /></div>
      </div>
    </div>
  )
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  useEffect(() => {
    supabase.from('orders').select('*, order_items(*)').neq('status', 'pending').order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]))
  }, [])
  if (!orders) return <p className="muted">Cargando…</p>
  if (!orders.length) return <p className="muted">Aún no tienes pedidos.</p>
  return (
    <div className="stack">
      {orders.map((o) => (
        <article className="panel" key={o.id}>
          <div className="row"><strong>Pedido #{o.id.slice(0, 8).toUpperCase()}</strong><span className={`pill ${o.status}`}>{STATUS_LABEL[o.status] ?? o.status}</span></div>
          <p className="muted small">{dateMx(o.created_at)}</p>
          {o.order_items?.map((i) => (
            <div className="cart-line" key={i.id}>
              <img src={i.image ?? '/img/logo.png'} alt="" />
              <div>{i.name}<div className="muted small">Talla {i.size} · Cant. {i.quantity}</div></div>
              <span>{money(i.unit_price_cents * i.quantity)}</span>
            </div>
          ))}
          <div className="row"><span>Envío</span><span>{o.shipping_cents ? money(o.shipping_cents) : 'Gratis'}</span></div>
          <div className="row total"><span>Total</span><span>{money(o.total_cents)}</span></div>
          {o.tracking_number && <p className="small">Guía {o.carrier ? `(${o.carrier})` : ''}: <strong>{o.tracking_number}</strong></p>}
          <p className="small muted">¿Necesitas ayuda o factura? Escribe a {BIZ.email} con tu número de pedido.</p>
        </article>
      ))}
    </div>
  )
}

export function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')
  useEffect(() => { setName(profile?.full_name ?? ''); setPhone(profile?.phone ?? '') }, [profile])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', user!.id)
    setMsg(error ? 'No se pudo guardar.' : 'Datos guardados.')
    refreshProfile()
  }
  async function changePass(e: React.FormEvent) {
    e.preventDefault()
    if (pass.length < 8) return setMsg('La contraseña debe tener al menos 8 caracteres.')
    const { error } = await supabase.auth.updateUser({ password: pass })
    setMsg(error ? 'No se pudo cambiar la contraseña.' : 'Contraseña actualizada.'); setPass('')
  }
  return (
    <div className="stack">
      <form className="panel form" onSubmit={save}>
        <h2>Datos personales</h2>
        <label>Nombre completo<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Teléfono<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></label>
        <label>Correo<input value={user?.email ?? ''} disabled /></label>
        <button className="btn dark">Guardar cambios</button>
      </form>
      <form className="panel form" onSubmit={changePass}>
        <h2>Cambiar contraseña</h2>
        <label>Nueva contraseña<input type="password" minLength={8} value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" /></label>
        <button className="btn">Actualizar contraseña</button>
      </form>
      <div className="panel">
        <h2>Tus datos y tus derechos</h2>
        <p className="small muted">Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO), o pedir que eliminemos tu cuenta, escribiendo a <a href={`mailto:${BIZ.privacyEmail}?subject=Solicitud ARCO`}>{BIZ.privacyEmail}</a>.</p>
      </div>
      {msg && <p className="msg ok" role="status">{msg}</p>}
    </div>
  )
}

const empty = { full_name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '' }

export function AddressesTab() {
  const { user } = useAuth()
  const [list, setList] = useState<Address[]>([])
  const [f, setF] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const load = () => supabase.from('addresses').select('*').order('created_at').then(({ data }) => setList((data ?? []) as Address[]))
  useEffect(() => { load() }, [])
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{5}$/.test(f.postal_code)) return setErr('El código postal debe tener 5 dígitos.')
    setErr('')
    const row = { ...f, line2: f.line2 || null, user_id: user!.id, country: 'MX' }
    const { error } = editing ? await supabase.from('addresses').update(row).eq('id', editing) : await supabase.from('addresses').insert({ ...row, is_default: list.length === 0 })
    if (error) return setErr('No se pudo guardar.')
    setShow(false); setEditing(null); setF(empty); load()
  }
  async function del(id: string) { if (confirm('¿Eliminar esta dirección?')) { await supabase.from('addresses').delete().eq('id', id); load() } }
  async function makeDefault(id: string) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id); load()
  }

  return (
    <div className="stack">
      {list.map((a) => (
        <article className="panel" key={a.id}>
          <div className="row"><strong>{a.full_name}</strong>{a.is_default && <span className="pill paid">Principal</span>}</div>
          <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state}, CP {a.postal_code}<br />Tel. {a.phone}</p>
          <div className="btn-row">
            <button className="linkish" onClick={() => { setEditing(a.id); setF({ full_name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, postal_code: a.postal_code }); setShow(true) }}>Editar</button>
            {!a.is_default && <button className="linkish" onClick={() => makeDefault(a.id)}>Hacer principal</button>}
            <button className="linkish" onClick={() => del(a.id)}>Eliminar</button>
          </div>
        </article>
      ))}
      {!list.length && !show && <p className="muted">No tienes direcciones guardadas.</p>}
      {show ? (
        <form className="panel form" onSubmit={save}>
          <h2>{editing ? 'Editar dirección' : 'Nueva dirección'}</h2>
          <label>Nombre de quien recibe<input required value={f.full_name} onChange={set('full_name')} /></label>
          <label>Teléfono<input required inputMode="tel" value={f.phone} onChange={set('phone')} /></label>
          <label>Calle y número<input required value={f.line1} onChange={set('line1')} /></label>
          <label>Colonia, referencias (opcional)<input value={f.line2} onChange={set('line2')} /></label>
          <div className="two"><label>Ciudad<input required value={f.city} onChange={set('city')} /></label>
            <label>Estado<input required value={f.state} onChange={set('state')} /></label></div>
          <label>Código postal<input required inputMode="numeric" maxLength={5} value={f.postal_code} onChange={set('postal_code')} /></label>
          {err && <p className="msg err" role="alert">{err}</p>}
          <div className="btn-row"><button className="btn dark">Guardar</button>
            <button type="button" className="btn" onClick={() => { setShow(false); setEditing(null); setF(empty) }}>Cancelar</button></div>
        </form>
      ) : <div><button className="btn" onClick={() => setShow(true)}>Agregar dirección</button></div>}
    </div>
  )
}
