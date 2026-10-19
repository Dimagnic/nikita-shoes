import type { VercelRequest, VercelResponse } from '@vercel/node'
import { admin, stripe, siteUrl, env } from './_lib/clients'

type InItem = { variantId: string; quantity: number }

type VariantRow = {
  id: string
  size: string
  stock: number
  products: {
    id: string
    name: string
    price_cents: number
    images: string[]
    active: boolean
  } | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const items: InItem[] = Array.isArray(req.body?.items) ? req.body.items : []
    if (!items.length || items.length > 30) return res.status(400).json({ error: 'Carrito inválido' })
    for (const i of items) {
      if (typeof i.variantId !== 'string' || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10)
        return res.status(400).json({ error: 'Cantidad inválida' })
    }

    const db = admin()

    // Usuario (opcional): se valida el token con Supabase.
    let userId: string | null = null
    let userEmail: string | undefined
    const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
    if (token) {
      const { data } = await db.auth.getUser(token)
      userId = data.user?.id ?? null
      userEmail = data.user?.email ?? undefined
    }

    // Los precios SIEMPRE salen de la base de datos, nunca del navegador.
    const ids = [...new Set(items.map((i) => i.variantId))]
    const { data: rows, error } = await db
      .from('product_variants')
      .select('id,size,stock,products(id,name,price_cents,images,active)')
      .in('id', ids)
    if (error) throw error
    const variants = new Map((rows as unknown as VariantRow[]).map((v) => [v.id, v]))

    const base = siteUrl()
    let subtotal = 0
    const lines = items.map((i) => {
      const v = variants.get(i.variantId)
      if (!v || !v.products || !v.products.active) throw new UserError('Un producto ya no está disponible')
      if (v.stock < i.quantity)
        throw new UserError(`Sin existencias suficientes de ${v.products.name} talla ${v.size}`)
      subtotal += v.products.price_cents * i.quantity
      const img = v.products.images[0]
      const abs = img ? (img.startsWith('http') ? img : base + img) : undefined
      return { v, p: v.products, quantity: i.quantity, image: abs }
    })

    const freeMin = Number(env('FREE_SHIPPING_MIN_CENTS', '250000'))
    const flat = Number(env('SHIPPING_FLAT_CENTS', '15000'))
    const shipping = subtotal >= freeMin ? 0 : flat
    const total = subtotal + shipping

    // Pedido pendiente (se confirma en el webhook cuando Stripe cobra).
    const { data: order, error: oErr } = await db
      .from('orders')
      .insert({
        user_id: userId,
        email: userEmail ?? null,
        status: 'pending',
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: total,
      })
      .select('id')
      .single()
    if (oErr) throw oErr

    const { error: iErr } = await db.from('order_items').insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.p.id,
        variant_id: l.v.id,
        name: l.p.name,
        size: l.v.size,
        unit_price_cents: l.p.price_cents,
        quantity: l.quantity,
        image: l.image ?? null,
      })),
    )
    if (iErr) throw iErr

    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      customer_email: userEmail,
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: 'mxn',
          unit_amount: l.p.price_cents,
          product_data: {
            name: `${l.p.name} · Talla ${l.v.size}`,
            ...(l.image ? { images: [l.image] } : {}),
          },
        },
      })),
      shipping_address_collection: { allowed_countries: ['MX'] },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: shipping === 0 ? 'Envío gratis' : 'Envío estándar',
            fixed_amount: { amount: shipping, currency: 'mxn' },
          },
        },
      ],
      success_url: `${base}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancelado`,
    })

    await db.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)
    return res.status(200).json({ url: session.url })
  } catch (e) {
    if (e instanceof UserError) return res.status(409).json({ error: e.message })
    console.error('checkout error', e)
    return res.status(500).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo.' })
  }
}

class UserError extends Error {}
