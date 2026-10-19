import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type CartLine = {
  variantId: string; productId: string; slug: string; name: string; size: string
  price_cents: number; image: string | null; quantity: number; maxStock: number
}

type Ctx = {
  lines: CartLine[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (o: boolean) => void
  add: (l: Omit<CartLine, 'quantity'>, qty?: number) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
}

const KEY = 'nikita_cart_v1'
const CartCtx = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartLine[] } catch { return [] }
  })
  const [open, setOpen] = useState(false)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(lines)) } catch { /* modo privado */ } }, [lines])

  const value = useMemo<Ctx>(() => ({
    lines,
    count: lines.reduce((a, l) => a + l.quantity, 0),
    subtotal: lines.reduce((a, l) => a + l.quantity * l.price_cents, 0),
    open,
    setOpen,
    add: (l, qty = 1) => setLines((cur) => {
      const f = cur.find((x) => x.variantId === l.variantId)
      if (f) return cur.map((x) => x.variantId === l.variantId ? { ...x, quantity: Math.min(x.quantity + qty, l.maxStock, 10) } : x)
      return [...cur, { ...l, quantity: Math.min(qty, l.maxStock, 10) }]
    }),
    setQty: (id, qty) => setLines((cur) => cur.flatMap((x) => {
      if (x.variantId !== id) return [x]
      return qty < 1 ? [] : [{ ...x, quantity: Math.min(qty, x.maxStock, 10) }]
    })),
    remove: (id) => setLines((cur) => cur.filter((x) => x.variantId !== id)),
    clear: () => setLines([]),
  }), [lines, open])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const c = useContext(CartCtx)
  if (!c) throw new Error('useCart fuera de CartProvider')
  return c
}
