import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { listProducts } from '../lib/data'
import { useTitle } from '../lib/useTitle'
import { CATEGORIES, type Product } from '../types'

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const cat = sp.get('cat') ?? ''
  const q = (sp.get('q') ?? '').toLowerCase()
  const [sort, setSort] = useState('new')
  const [items, setItems] = useState<Product[] | null>(null)
  const label = CATEGORIES.find((c) => c.slug === cat)?.label ?? 'Novedades'
  useTitle(label)

  useEffect(() => { setItems(null); listProducts({ category: cat || undefined }).then(setItems).catch(() => setItems([])) }, [cat])

  const shown = useMemo(() => {
    let l = (items ?? []).filter((p) => !q || `${p.name} ${p.color ?? ''} ${p.category}`.toLowerCase().includes(q))
    if (sort === 'asc') l = [...l].sort((a, b) => a.price_cents - b.price_cents)
    if (sort === 'desc') l = [...l].sort((a, b) => b.price_cents - a.price_cents)
    return l
  }, [items, q, sort])

  const setCat = (c: string) => { const n = new URLSearchParams(sp); c ? n.set('cat', c) : n.delete('cat'); setSp(n) }

  return (
    <div className="wrap section tight">
      <div className="sh"><h1>{q ? `Resultados para “${sp.get('q')}”` : label}</h1></div>
      <div className="tools">
        <div className="chips" role="group" aria-label="Categorías">
          <button className="chip" aria-pressed={!cat} onClick={() => setCat('')}>Todo</button>
          {CATEGORIES.map((c) => <button key={c.slug} className="chip" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}>{c.label}</button>)}
        </div>
        <div className="tools-r">
          <span className="muted">{items ? `${shown.length} resultados` : ''}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
            <option value="new">Más nuevos</option><option value="asc">Precio: menor a mayor</option><option value="desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>
      {items === null && <p className="center muted">Cargando…</p>}
      {items && shown.length === 0 && <p className="center muted">No encontramos productos con esos filtros.</p>}
      <div className="grid">{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  )
}
