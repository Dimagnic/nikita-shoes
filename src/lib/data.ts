import { supabase } from './supabase'
import type { Product } from '../types'

const SEL = '*, product_variants(*)'

export async function listProducts(opts: { category?: string; featured?: boolean; limit?: number } = {}) {
  let q = supabase.from('products').select(SEL).eq('active', true).order('created_at', { ascending: false })
  if (opts.category) q = q.eq('category', opts.category)
  if (opts.featured) q = q.eq('featured', true)
  if (opts.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Product[]
}

export async function getProduct(slug: string) {
  const { data, error } = await supabase.from('products').select(SEL).eq('slug', slug).maybeSingle()
  if (error) throw error
  return data as Product | null
}

export const totalStock = (p: Product) => (p.product_variants ?? []).reduce((a, v) => a + v.stock, 0)
