import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { BIZ } from '../config/business'
import { money } from '../lib/format'
import { CloseIcon } from './Icons'

export default function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQty, remove } = useCart()
  const { session } = useAuth()
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const shipping = lines.length === 0 || subtotal >= BIZ.freeShippingMinCents ? 0 : BIZ.shippingFlatCents
  const missing = BIZ.freeShippingMinCents - subtotal

  async function pay() {
    setErr('')
    if (!terms) return setErr('Acepta los términos para continuar.')
    setBusy(true)
    try {
      const r = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })) }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.url) throw new Error(j.error ?? 'No pudimos iniciar el pago.')
      window.location.href = j.url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error inesperado')
      setBusy(false)
    }
  }

  return (
    <>
      <div className={`veil ${open ? 'on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer right ${open ? 'on' : ''}`} aria-hidden={!open} aria-label="Carrito">
        <div className="drawer-head"><h2>Tu carrito</h2>
          <button className="icon-btn" aria-label="Cerrar carrito" onClick={() => setOpen(false)}><CloseIcon /></button>
        </div>
        <div className="cart-lines">
          {lines.length === 0 && (
            <p className="muted">Tu carrito está vacío. <Link to="/tienda" onClick={() => setOpen(false)}>Ver novedades</Link></p>
          )}
          {lines.map((l) => (
            <div className="cart-line" key={l.variantId}>
              <img src={l.image ?? '/img/logo.png'} alt="" />
              <div>
                <Link to={`/producto/${l.slug}`} onClick={() => setOpen(false)}>{l.name}</Link>
                <div className="muted">Talla {l.size} · {money(l.price_cents)}</div>
                <div className="qty">
                  <button aria-label="Quitar uno" onClick={() => setQty(l.variantId, l.quantity - 1)}>−</button>
                  <span>{l.quantity}</span>
                  <button aria-label="Agregar uno" disabled={l.quantity >= l.maxStock} onClick={() => setQty(l.variantId, l.quantity + 1)}>+</button>
                  <button className="linkish" onClick={() => remove(l.variantId)}>Quitar</button>
                </div>
              </div>
              <strong>{money(l.price_cents * l.quantity)}</strong>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="cart-foot">
            {missing > 0 && <p className="muted small">Te faltan {money(missing)} para envío gratis.</p>}
            <div className="row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="row"><span>Envío</span><span>{shipping === 0 ? 'Gratis' : money(shipping)}</span></div>
            <div className="row total"><span>Total (IVA incluido)</span><span>{money(subtotal + shipping)}</span></div>
            <label className="check">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>Acepto los <Link to="/legal/terminos" onClick={() => setOpen(false)}>Términos</Link>, la <Link to="/legal/devoluciones" onClick={() => setOpen(false)}>política de cambios</Link> y el <Link to="/legal/privacidad" onClick={() => setOpen(false)}>Aviso de Privacidad</Link>.</span>
            </label>
            {err && <p className="msg err" role="alert">{err}</p>}
            <button className="btn dark" disabled={busy} onClick={pay}>{busy ? 'Redirigiendo…' : 'Pagar de forma segura'}</button>
            <p className="muted small center">Pago procesado por Stripe. Aceptamos tarjetas de crédito y débito.</p>
          </div>
        )}
      </aside>
    </>
  )
}
