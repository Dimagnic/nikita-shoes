export type Variant = { id: string; product_id: string; size: string; stock: number; sku: string | null }

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  category: string
  price_cents: number
  compare_at_cents: number | null
  color: string | null
  material: string | null
  heel_height_mm: number | null
  details: string[]
  care: string | null
  images: string[]
  active: boolean
  featured: boolean
  created_at: string
  product_variants?: Variant[]
}

export type Profile = { id: string; full_name: string | null; phone: string | null; role: 'customer' | 'admin' }

export type Address = {
  id: string; user_id: string; full_name: string; phone: string; line1: string; line2: string | null
  city: string; state: string; postal_code: string; country: string; is_default: boolean
}

export type OrderItem = {
  id: string; name: string; size: string; unit_price_cents: number; quantity: number; image: string | null
}

export type Order = {
  id: string; email: string | null; status: string; subtotal_cents: number; shipping_cents: number
  total_cents: number; created_at: string; tracking_number: string | null; carrier: string | null
  customer_name: string | null; customer_phone: string | null
  shipping_address: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string } | null
  order_items?: OrderItem[]
}

export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'alpargatas', label: 'Alpargatas' },
  { slug: 'sandalias', label: 'Sandalias' },
  { slug: 'tacones', label: 'Tacones' },
  { slug: 'botas', label: 'Botas' },
  { slug: 'flats', label: 'Flats' },
]

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente de pago', paid: 'Pagado', shipped: 'Enviado',
  delivered: 'Entregado', cancelled: 'Cancelado', refunded: 'Reembolsado',
}
