import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { dateMx, money, slugify } from '../lib/format'
import { processImage } from '../lib/images'
import Img from '../components/Img'
import { useTitle } from '../lib/useTitle'
import { CATEGORIES, STATUS_LABEL, type Order, type Product } from '../types'

export function AdminLayout() {
  useTitle('Administración')
  return (
    <div className="wrap section tight">
      <div className="sh left"><h1>Administración</h1></div>
      <nav className="acc-nav row-nav" aria-label="Administración">
        <NavLink to="/admin" end>Productos</NavLink>
        <NavLink to="/admin/pedidos">Pedidos</NavLink>
        <Link to="/cuenta">Mi cuenta</Link>
      </nav>
      <Outlet />
    </div>
  )
}

/* ---------------- Lista de productos ---------------- */
export function AdminProducts() {
  const [list, setList] = useState<Product[] | null>(null)
  const load = () => supabase.from('products').select('*, product_variants(*)').order('created_at', { ascending: false })
    .then(({ data }) => setList((data ?? []) as Product[]))
  useEffect(() => { load() }, [])

  async function toggle(p: Product) { await supabase.from('products').update({ active: !p.active }).eq('id', p.id); load() }
  async function del(p: Product) {
    if (!confirm(`¿Eliminar “${p.name}”? Esta acción no se puede deshacer.`)) return
    await supabase.from('products').delete().eq('id', p.id); load()
  }

  return (
    <>
      <p><Link className="btn dark" to="/admin/producto/nuevo">Subir producto nuevo</Link></p>
      {!list && <p className="muted">Cargando…</p>}
      {list?.length === 0 && <p className="muted">Aún no hay productos. Sube el primero.</p>}
      <div className="stack">
        {list?.map((p) => (
          <article className="panel prow" key={p.id}>
            <Img md src={p.images[0] ?? '/img/logo.png'} alt="" />
            <div>
              <strong>{p.name}</strong>
              <div className="muted small">{money(p.price_cents)} · {p.category} · {(p.product_variants ?? []).reduce((a, v) => a + v.stock, 0)} pares en total</div>
              <span className={`pill ${p.active ? 'paid' : 'cancelled'}`}>{p.active ? 'Visible' : 'Oculto'}</span>
            </div>
            <div className="btn-row">
              <Link className="btn small" to={`/admin/producto/${p.id}`}>Editar</Link>
              <button className="btn small" onClick={() => toggle(p)}>{p.active ? 'Ocultar' : 'Publicar'}</button>
              <button className="btn small" onClick={() => del(p)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

/* ---------------- Formulario de producto ---------------- */
const SIZES = ['22', '23', '24', '25', '26', '27', '28']
const blank = {
  name: '', slug: '', description: '', category: 'sandalias', price: '', compare: '', color: '', material: '',
  heelCm: '', details: '', care: '', active: true, featured: false,
}

export function AdminProductForm() {
  const { id } = useParams()
  const isNew = !id || id === 'nuevo'
  const nav = useNavigate()
  const [f, setF] = useState(blank)
  const [images, setImages] = useState<string[]>([])
  const [stock, setStock] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [loaded, setLoaded] = useState(isNew)
  useTitle(isNew ? 'Nuevo producto' : 'Editar producto')

  useEffect(() => {
    if (isNew) return
    supabase.from('products').select('*, product_variants(*)').eq('id', id).single().then(({ data }) => {
      const p = data as Product | null
      if (!p) return setMsg('Producto no encontrado')
      setF({
        name: p.name, slug: p.slug, description: p.description, category: p.category, price: String(p.price_cents / 100),
        compare: p.compare_at_cents ? String(p.compare_at_cents / 100) : '', color: p.color ?? '', material: p.material ?? '',
        heelCm: p.heel_height_mm ? String(p.heel_height_mm / 10) : '', details: p.details.join('\n'), care: p.care ?? '',
        active: p.active, featured: p.featured,
      })
      setImages(p.images)
      setStock(Object.fromEntries((p.product_variants ?? []).map((v) => [v.size, String(v.stock)])))
      setLoaded(true)
    })
  }, [id, isNew])

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true); setMsg('')
    const urls: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') || file.size > 25 * 1024 * 1024) { setMsg('Solo imágenes JPG, PNG o WebP de hasta 25 MB.'); continue }
      try {
        // Se optimiza antes de subir: nítida (hasta 2400 px), WebP y una versión mediana para tarjetas.
        const { full, md, ext } = await processImage(file)
        const id = crypto.randomUUID()
        const up = (name: string, blob: Blob) =>
          supabase.storage.from('products').upload(name, blob, { cacheControl: '31536000', contentType: blob.type, upsert: false })
        const [a, b] = await Promise.all([up(`${id}.${ext}`, full), up(`${id}_md.${ext}`, md)])
        if (a.error || b.error) { setMsg('No se pudo subir una imagen: ' + (a.error?.message ?? b.error?.message)); continue }
        urls.push(supabase.storage.from('products').getPublicUrl(`${id}.${ext}`).data.publicUrl)
      } catch {
        setMsg('No se pudo procesar una imagen. Prueba con otro archivo JPG, PNG o WebP.')
      }
    }
    setImages((cur) => [...cur, ...urls]); setBusy(false)
  }
  const move = (i: number, d: number) => setImages((cur) => {
    const n = [...cur]; const j = i + d; if (j < 0 || j >= n.length) return cur; [n[i], n[j]] = [n[j], n[i]]; return n
  })

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    const price = Math.round(parseFloat(f.price) * 100)
    if (!(price >= 0)) return setMsg('Escribe un precio válido.')
    if (!images.length) return setMsg('Sube al menos una foto.')
    const compare = f.compare ? Math.round(parseFloat(f.compare) * 100) : null
    setBusy(true)
    const row = {
      name: f.name.trim(), slug: slugify(f.slug || f.name), description: f.description.trim(), category: f.category,
      price_cents: price, compare_at_cents: compare, color: f.color.trim() || null, material: f.material.trim() || null,
      heel_height_mm: f.heelCm ? Math.round(parseFloat(f.heelCm) * 10) : null,
      details: f.details.split('\n').map((s) => s.trim()).filter(Boolean), care: f.care.trim() || null,
      images, active: f.active, featured: f.featured,
    }
    const res = isNew ? await supabase.from('products').insert(row).select('id').single() : await supabase.from('products').update(row).eq('id', id).select('id').single()
    if (res.error || !res.data) { setBusy(false); return setMsg(res.error?.code === '23505' ? 'Ya existe un producto con ese enlace (slug).' : 'No se pudo guardar: ' + res.error?.message) }
    const pid = res.data.id as string
    const variants = SIZES.filter((s) => stock[s] !== undefined && stock[s] !== '').map((s) => ({ product_id: pid, size: s, stock: Math.max(0, parseInt(stock[s], 10) || 0) }))
    if (variants.length) {
      const { error } = await supabase.from('product_variants').upsert(variants, { onConflict: 'product_id,size' })
      if (error) { setBusy(false); return setMsg('Producto guardado, pero falló el inventario: ' + error.message) }
    }
    // Tallas vaciadas: se eliminan.
    const remove = SIZES.filter((s) => (stock[s] === undefined || stock[s] === '') && !isNew)
    if (remove.length) await supabase.from('product_variants').delete().eq('product_id', pid).in('size', remove)
    setBusy(false); nav('/admin')
  }

  if (!loaded) return <p className="muted">Cargando…</p>
  return (
    <form className="form admin-form" onSubmit={save}>
      <h2>{isNew ? 'Producto nuevo' : 'Editar producto'}</h2>

      <fieldset><legend>Fotos</legend>
        <p className="muted small">La primera foto es la principal. Sube originales de al menos 2000 px por el lado largo, con fondo blanco o gris claro y la misma luz en todos los productos. La tienda las optimiza sola.</p>
        <div className="img-grid">
          {images.map((u, i) => (
            <div key={u} className="img-item"><Img md src={u} alt="" />
              <div className="btn-row">
                <button type="button" aria-label="Mover a la izquierda" onClick={() => move(i, -1)}>←</button>
                <button type="button" aria-label="Mover a la derecha" onClick={() => move(i, 1)}>→</button>
                <button type="button" onClick={() => setImages((c) => c.filter((x) => x !== u))}>Quitar</button>
              </div>{i === 0 && <span className="tag">Principal</span>}</div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} aria-label="Subir fotos" />
      </fieldset>

      <fieldset><legend>Información</legend>
        <label>Nombre<input required value={f.name} onChange={set('name')} /></label>
        <label>Enlace (se genera solo si lo dejas vacío)<input value={f.slug} onChange={set('slug')} placeholder={slugify(f.name)} /></label>
        <label>Categoría<select value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></label>
        <label>Descripción<textarea required rows={4} value={f.description} onChange={set('description')} /></label>
        <div className="two"><label>Color<input value={f.color} onChange={set('color')} /></label>
          <label>Material<input value={f.material} onChange={set('material')} /></label></div>
        <label>Altura del tacón (cm)<input inputMode="decimal" value={f.heelCm} onChange={set('heelCm')} /></label>
        <label>Características (una por línea)<textarea rows={4} value={f.details} onChange={set('details')} placeholder={'Tacón ancho de 7 cm\nSuela antiderrapante'} /></label>
        <label>Cuidado del producto<textarea rows={2} value={f.care} onChange={set('care')} /></label>
      </fieldset>

      <fieldset><legend>Precio (MXN, con IVA incluido)</legend>
        <div className="two"><label>Precio de venta<input required inputMode="decimal" value={f.price} onChange={set('price')} placeholder="1890" /></label>
          <label>Precio anterior (opcional, para oferta)<input inputMode="decimal" value={f.compare} onChange={set('compare')} /></label></div>
      </fieldset>

      <fieldset><legend>Inventario por talla (deja vacío si no hay esa talla)</legend>
        <div className="stock-grid">{SIZES.map((s) => (
          <label key={s}>Talla {s}<input inputMode="numeric" value={stock[s] ?? ''} onChange={(e) => setStock({ ...stock, [s]: e.target.value.replace(/\D/g, '') })} /></label>
        ))}</div>
      </fieldset>

      <fieldset><legend>Publicación</legend>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Visible en la tienda</span></label>
        <label className="check"><input type="checkbox" checked={f.featured} onChange={set('featured')} /><span>Destacado</span></label>
      </fieldset>

      {msg && <p className="msg err" role="alert">{msg}</p>}
      <div className="btn-row"><button className="btn dark" disabled={busy}>{busy ? 'Guardando…' : 'Guardar producto'}</button>
        <Link className="btn" to="/admin">Cancelar</Link></div>
    </form>
  )
}

/* ---------------- Pedidos ---------------- */
export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('orders').select('*, order_items(*)').neq('status', 'pending').order('created_at', { ascending: false })
    .then(({ data }) => setOrders((data ?? []) as Order[]))
  useEffect(() => { load() }, [])

  async function update(o: Order, patch: Partial<Order>) {
    const { error } = await supabase.from('orders').update(patch).eq('id', o.id)
    setMsg(error ? 'No se pudo actualizar.' : 'Pedido actualizado.'); load()
  }
  if (!orders) return <p className="muted">Cargando…</p>
  if (!orders.length) return <p className="muted">Todavía no hay pedidos pagados.</p>
  return (
    <div className="stack">
      {msg && <p className="msg ok" role="status">{msg}</p>}
      {orders.map((o) => <OrderRow key={o.id} o={o} update={update} />)}
    </div>
  )
}

function OrderRow({ o, update }: { o: Order; update: (o: Order, p: Partial<Order>) => void }) {
  const [track, setTrack] = useState(o.tracking_number ?? '')
  const [carrier, setCarrier] = useState(o.carrier ?? '')
  const a = o.shipping_address
  return (
    <article className="panel">
      <div className="row"><strong>#{o.id.slice(0, 8).toUpperCase()} · {money(o.total_cents)}</strong><span className={`pill ${o.status}`}>{STATUS_LABEL[o.status]}</span></div>
      <p className="muted small">{dateMx(o.created_at)} · {o.customer_name} · {o.email} · {o.customer_phone}</p>
      {a && <p className="small">Enviar a: {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state}, CP {a.postal_code}</p>}
      <ul className="small">{o.order_items?.map((i) => <li key={i.id}>{i.quantity} × {i.name}, talla {i.size}</li>)}</ul>
      <div className="two">
        <label>Estado<select value={o.status} onChange={(e) => update(o, { status: e.target.value })}>
          {Object.entries(STATUS_LABEL).filter(([k]) => k !== 'pending').map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Paquetería<input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Estafeta, DHL…" /></label>
      </div>
      <label>Número de guía<input value={track} onChange={(e) => setTrack(e.target.value)} /></label>
      <div><button className="btn small" onClick={() => update(o, { tracking_number: track || null, carrier: carrier || null, ...(track && o.status === 'paid' ? { status: 'shipped' } : {}) })}>Guardar guía</button></div>
    </article>
  )
}
