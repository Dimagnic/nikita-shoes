import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function need(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Falta la variable de entorno ${name}`)
  return v
}

export const stripe = () => new Stripe(need('STRIPE_SECRET_KEY'))

// Cliente con service role: salta RLS. SOLO se usa en el servidor.
export const admin = () =>
  createClient(need('SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })

export const env = (name: string, fallback?: string) => process.env[name] ?? fallback
export const siteUrl = () => need('SITE_URL').replace(/\/$/, '')
