import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import Img from '../components/Img'
import { listProducts } from '../lib/data'
import { configured } from '../lib/supabase'
import { useTitle } from '../lib/useTitle'
import { BIZ } from '../config/business'
import { CATEGORIES, type Product } from '../types'

// Fotos completas, sin recortes: cada una conserva su proporción original.
const HERO = [
  { src: '/img/look3.jpg', ar: '811 / 1600', alt: 'Mujer con vestido negro y sandalias de tacón en una calle empedrada' },
  { src: '/img/look1.jpg', ar: '1019 / 1600', alt: 'Mujer sentada con alpargatas negras de listón' },
  { src: '/img/look2.jpg', ar: '914 / 1600', alt: 'Mujer con vestido blanco y cuñas de lazo' },
]

// Imagen de respaldo por categoría mientras no haya productos cargados en ella.
const FALLBACK: Record<string, { src: string; product: boolean }> = {
  alpargatas: { src: '/img/espa.jpg', product: true },
  sandalias: { src: '/img/look1.jpg', product: false },
  tacones: { src: '/img/sand.jpg', product: true },
  botas: { src: '/img/look3.jpg', product: false },
}

export default function Home() {
  useTitle('')
  const [items, setItems] = useState<Product[] | null>(null)
  useEffect(() => { listProducts({ limit: 24 }).then(setItems).catch(() => setItems([])) }, [])

  const tile = (slug: string) => {
    const p = items?.find((x) => x.category === slug && x.images[0])
    return p ? { src: p.images[0], product: true } : FALLBACK[slug]
  }

  return (
    <>
      <section className="hero">
        <div className="hero-strip">
          {HERO.map((h, i) => (
            <figure key={h.src} style={{ aspectRatio: h.ar }}>
              <img src={h.src} alt={h.alt} fetchPriority={i === 1 ? 'high' : undefined} decoding="async" />
            </figure>
          ))}
        </div>
        <div className="hero-cap">
          <p className="eyebrow">Nueva colección</p>
          <h1>Zapatos para caminar la ciudad</h1>
          <Link className="btn-line" to="/tienda">Ver novedades</Link>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <div className="sh"><p className="eyebrow">Explora</p><h2>Compra por categoría</h2></div>
          <div className="cats">
            {CATEGORIES.slice(0, 4).map((c) => {
              const t = tile(c.slug)
              return (
                <Link key={c.slug} to={`/tienda?cat=${c.slug}`} className="cat">
                  <div className={`cat-ph ${t.product ? 'contain' : ''}`}><Img md={t.product} src={t.src} alt="" loading="lazy" /></div>
                  <span>{c.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sh"><p className="eyebrow">Piezas de la temporada</p><h2>Novedades</h2></div>
          {!configured && <p className="msg err center">Falta configurar Supabase: copia <code>.env.example</code> a <code>.env</code>.</p>}
          {items === null && <p className="center muted">Cargando productos…</p>}
          {items?.length === 0 && configured && <p className="center muted">Pronto tendremos productos nuevos.</p>}
          <div className="grid">{items?.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          <p className="center more"><Link className="btn" to="/tienda">Ver toda la colección</Link></p>
        </div>
      </section>

      <section className="split">
        <div className="split-tx">
          <p className="eyebrow light">Nikita</p>
          <h2>Hechos para durar todo el día</h2>
          <p>Diseñamos cada par para que se vea elegante y se sienta cómodo desde la mañana hasta la noche.</p>
          <div><Link className="btn light" to="/nosotros">Conoce Nikita</Link></div>
        </div>
        <img src="/img/look2.jpg" alt="Mujer con vestido blanco y cuñas de lazo" loading="lazy" decoding="async" />
      </section>

      <section className="section">
        <div className="wrap perks">
          <div><h3>Envío a todo México</h3><p className="muted">Gratis desde ${BIZ.freeShippingMinCents / 100} MXN. Entrega en {BIZ.deliveryDays}.</p></div>
          <div><h3>Cambios en {BIZ.returnDays} días</h3><p className="muted">Si tu talla no es la correcta, la cambiamos.</p></div>
          <div><h3>Pago seguro</h3><p className="muted">Procesado por Stripe. No guardamos los datos de tu tarjeta.</p></div>
        </div>
      </section>
      <Newsletter />
    </>
  )
}
