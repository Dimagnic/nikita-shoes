import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../lib/data'
import { useCart } from '../context/CartContext'
import { useTitle } from '../lib/useTitle'
import { money } from '../lib/format'
import { BIZ } from '../config/business'
import Img from '../components/Img'
import type { Product as P } from '../types'

// Zoom al pasar el cursor (solo en computadora). Usa la foto original de alta resolución.
function Zoom({ src, alt }: { src: string; alt: string }) {
  const [origin, setOrigin] = useState<string | null>(null)
  const canZoom = () => window.matchMedia('(hover: hover) and (min-width: 960px)').matches
  return (
    <div
      className="zoom"
      onMouseMove={(e) => {
        if (!canZoom()) return
        const r = e.currentTarget.getBoundingClientRect()
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <Img src={src} alt={alt} fetchPriority="high" style={origin ? { transformOrigin: origin, transform: 'scale(2)' } : undefined} />
    </div>
  )
}

export default function Product() {
  const { slug = '' } = useParams()
  const [p, setP] = useState<P | null | undefined>(undefined)
  const [img, setImg] = useState(0)
  const [size, setSize] = useState('')
  const [warn, setWarn] = useState(false)
  const { add, setOpen } = useCart()
  useTitle(p?.name ?? '')

  useEffect(() => { setP(undefined); setImg(0); setSize(''); getProduct(slug).then((x) => setP(x && x.active ? x : null)).catch(() => setP(null)) }, [slug])

  if (p === undefined) return <div className="wrap section center muted">Cargando…</div>
  if (p === null) return <div className="wrap section center"><h2>Producto no encontrado</h2><p><Link className="btn" to="/tienda">Volver a la tienda</Link></p></div>

  const vars = [...(p.product_variants ?? [])].sort((a, b) => Number(a.size) - Number(b.size) || a.size.localeCompare(b.size))
  const chosen = vars.find((v) => v.id === size)
  const onSale = p.compare_at_cents && p.compare_at_cents > p.price_cents
  const soldOut = vars.every((v) => v.stock === 0)

  function addToCart() {
    if (!p || !chosen) return setWarn(true)
    add({ variantId: chosen.id, productId: p.id, slug: p.slug, name: p.name, size: chosen.size, price_cents: p.price_cents, image: p.images[0] ?? null, maxStock: chosen.stock })
    setOpen(true)
  }

  const specs: [string, string | null][] = [
    ['Color', p.color], ['Material', p.material], ['Altura de tacón', p.heel_height_mm ? `${p.heel_height_mm / 10} cm` : null], ['Categoría', p.category],
  ]

  return (
    <div className="wrap section tight pdp">
      <div className="gallery">
        <div className="g-main"><Zoom src={p.images[img]} alt={p.name} /></div>
        {p.images.length > 1 && (
          <div className="g-thumbs">{p.images.map((u, i) => (
            <button key={u} aria-label={`Ver foto ${i + 1}`} aria-current={i === img} onClick={() => setImg(i)}><Img md src={u} /></button>
          ))}</div>
        )}
      </div>
      <div className="info">
        <p className="eyebrow">{p.category}</p>
        <h1>{p.name}</h1>
        <p className="price">{onSale && <s className="muted">{money(p.compare_at_cents!)}</s>} {money(p.price_cents)} <span className="muted small">IVA incluido</span></p>
        {p.color && <p className="muted">Color: {p.color}</p>}

        <div className="size-head"><strong>Talla (MX)</strong><Link to="/guia-de-tallas" className="small">Guía de tallas</Link></div>
        <div className="sizes" role="group" aria-label="Talla">
          {vars.map((v) => (
            <button key={v.id} disabled={v.stock === 0} aria-pressed={size === v.id} onClick={() => { setSize(v.id); setWarn(false) }}>{v.size}</button>
          ))}
        </div>
        {chosen && chosen.stock <= 3 && <p className="small muted">Quedan {chosen.stock} pares en esta talla.</p>}
        {warn && <p className="msg err" role="alert">Elige una talla para continuar.</p>}
        <button className="btn dark wide" onClick={addToCart} disabled={soldOut}>{soldOut ? 'Agotado' : 'Añadir al carrito'}</button>

        <p className="desc">{p.description}</p>
        <details open><summary>Detalles</summary>
          <ul>{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          <dl className="specs">{specs.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </details>
        {p.care && <details><summary>Cuidado del producto</summary><p>{p.care}</p></details>}
        <details><summary>Envíos y cambios</summary>
          <p>Entrega en {BIZ.deliveryDays}. Envío gratis desde {money(BIZ.freeShippingMinCents)}. Tienes {BIZ.returnDays} días naturales para solicitar un cambio. <Link to="/legal/devoluciones">Ver política completa</Link>.</p></details>
      </div>
    </div>
  )
}
