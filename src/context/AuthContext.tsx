import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export type AuthMode = 'login' | 'register' | 'forgot' | 'recovery'

type Ctx = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  authOpen: boolean
  authMode: AuthMode
  openAuth: (mode?: AuthMode) => void
  closeAuth: () => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const loadProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) return setProfile(null)
    const { data } = await supabase.from('profiles').select('id,full_name,phone,role').eq('id', uid).maybeSingle()
    setProfile((data as Profile | null) ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadProfile(data.session?.user.id).finally(() => setLoading(false))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      // Evita llamar a Supabase dentro del callback (bloqueo conocido): se difiere.
      setTimeout(() => loadProfile(s?.user.id), 0)
      if (event === 'PASSWORD_RECOVERY') { setAuthMode('recovery'); setAuthOpen(true) }
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value = useMemo<Ctx>(() => ({
    user: session?.user ?? null,
    session,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    authOpen,
    authMode,
    openAuth: (m = 'login') => { setAuthMode(m); setAuthOpen(true) },
    closeAuth: () => setAuthOpen(false),
    signOut: async () => { await supabase.auth.signOut() },
    refreshProfile: () => loadProfile(session?.user.id),
  }), [session, profile, loading, authOpen, authMode, loadProfile])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('useAuth fuera de AuthProvider')
  return c
}
