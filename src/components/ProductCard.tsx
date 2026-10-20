import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { money } from '../lib/format'
import { totalStock } from '../lib/data'
import Img from './Img'

export default function ProductCard({ p }: { p: Product }) {
  const sold = totalStock(p) === 0
  const second = p.images[1]
  const sale = p.compare_at_cents && p.compare_at_cents > p.price_cents
  return (
    <article className="card">
      <Link to={`/producto/${p.slug}`} className="card-ph" aria-label={p.name}>
        <Img md className="a" src={p.images[0]} alt={p.name} loading="lazy" />
        {second && <Img md className="b" src={second} loading="lazy" />}
        {sold && <span className="tag">Agotado</span>}
        {!sold && sale && <span className="tag sale">Oferta</span>}
      </Link>
      <h3><Link to={`/producto/${p.slug}`}>{p.name}</Link></h3>
      <div className="meta">
        <span>{sale && <s className="muted">{money(p.compare_at_cents!)} </s>}{money(p.price_cents)}</span>
        <span className="muted">{p.color}</span>
      </div>
    </article>
  )
}
