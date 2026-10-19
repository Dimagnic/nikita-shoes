import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { admin, stripe } from './_lib/clients'

// Stripe necesita el cuerpo SIN procesar para verificar la firma.
export const config = { api: { bodyParser: false } }

async function raw(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c)
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers['stripe-signature']
  if (!secret || typeof sig !== 'string') return res.status(400).send('Falta firma')

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(await raw(req), sig, secret)
  } catch {
    return res.status(400).send('Firma inválida')
  }

  const db = admin()
  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const s = event.data.object as Stripe.Checkout.Session
        if (s.payment_status !== 'paid') break // pagos diferidos: espera async_payment_succeeded
        const orderId = s.metadata?.order_id
        if (!orderId) break

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const a: any = s
        const ship = a.collected_information?.shipping_details ?? a.shipping_details
        const { data: updated } = await db
          .from('orders')
          .update({
            status: 'paid',
            email: s.customer_details?.email ?? undefined,
            customer_name: ship?.name ?? s.customer_details?.name ?? null,
            customer_phone: s.customer_details?.phone ?? null,
            shipping_address: ship?.address ?? null,
            stripe_payment_intent: typeof s.payment_intent === 'string' ? s.payment_intent : null,
          })
          .eq('id', orderId)
          .eq('status', 'pending') // idempotente: Stripe puede reenviar el evento
          .select('id')
        if (updated?.length) await db.rpc('decrement_stock', { p_order_id: orderId })
        break
      }
      case 'checkout.session.expired': {
        const s = event.data.object as Stripe.Checkout.Session
        if (s.metadata?.order_id)
          await db.from('orders').update({ status: 'cancelled' }).eq('id', s.metadata.order_id).eq('status', 'pending')
        break
      }
      case 'charge.refunded': {
        const ch = event.data.object as Stripe.Charge
        const pi = typeof ch.payment_intent === 'string' ? ch.payment_intent : null
        if (pi && ch.refunded) await db.from('orders').update({ status: 'refunded' }).eq('stripe_payment_intent', pi)
        break
      }
    }
  } catch (e) {
    console.error('webhook error', e)
    return res.status(500).send('Error procesando el evento') // Stripe reintentará
  }
  return res.status(200).json({ received: true })
}
