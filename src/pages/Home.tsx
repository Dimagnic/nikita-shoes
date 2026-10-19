import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import { listProducts } from '../lib/data'
import { configured } from '../lib/supabase'
import { useTitle } from '../lib/useTitle'
import { BIZ } from '../config/business'
import { CATEGORIES, type Product } from '../types'

export default function Home() {
  useTitle('')
  const [items, setItems] = useState<Product[] | null>(null)
  useEffect(() => { listProducts({ limit: 8 }).then(setItems).catch(() => setItems([])) }, [])

  return (
    <>
      <section className="hero">
        <figure><img src="/img/look3.jpg" alt="Mujer con vestido negro y sandalias de tacón en una calle empedrada" /></figure>
        <figure className="hero-2"><img src="/img/look1.jpg" alt="Mujer sentada con alpargatas negras de listón" /></figure>
        <div className="hero-cap">
          <h1>Zapatos para caminar la ciudad</h1>
          <p>Nueva colección de mujer</p>
          <Link className="btn light" to="/tienda">Ver novedades</Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sh"><h2>Compra por categoría</h2></div>
          <div className="cats">
            {CATEGORIES.slice(0, 4).map((c, i) => (
              <Link key={c.slug} to={`/tienda?cat=${c.slug}`} className="cat">
                <div className="cat-ph"><img src={['/img/espa.jpg', '/img/look2.jpg', '/img/sand.jpg', '/img/look3.jpg'][i]} alt="" className={i % 2 === 0 ? 'contain' : ''} /></div>
                <span>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <div className="sh"><h2>Novedades</h2><p className="muted">Piezas de la temporada</p></div>
          {!configured && <p className="msg err center">Falta configurar Supabase: copia <code>.env.example</code> a <code>.env</code>.</p>}
          {items === null && <p className="center muted">Cargando productos…</p>}
          {items?.length === 0 && configured && <p className="center muted">Pronto tendremos productos nuevos.</p>}
          <div className="grid">{items?.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          <p className="center"><Link className="btn" to="/tienda">Ver todo</Link></p>
        </div>
      </section>

      <section className="split">
        <div className="split-tx">
          <h2>Hechos para durar todo el día</h2>
          <p>Diseñamos cada par para que se vea elegante y se sienta cómodo desde la mañana hasta la noche.</p>
          <div><Link className="btn light" to="/nosotros">Conoce Nikita</Link></div>
        </div>
        <img src="/img/look2.jpg" alt="Mujer con vestido blanco y cuñas de lazo" />
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
