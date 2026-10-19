import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configured = Boolean(url && key)

// Si faltan variables, la app arranca igual y muestra un aviso en lugar de romperse.
export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'missing-key')
