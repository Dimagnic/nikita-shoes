import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, openAuth } = useAuth()
  useEffect(() => { if (!loading && !user) openAuth('login') }, [loading, user, openAuth])
  if (loading) return <div className="wrap section center muted">Cargando…</div>
  if (!user) return (
    <div className="wrap section center"><h2>Inicia sesión para continuar</h2>
      <p className="muted">Necesitas una cuenta para ver esta página.</p>
      <button className="btn dark" onClick={() => openAuth('login')}>Iniciar sesión</button></div>
  )
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading, user } = useAuth()
  if (loading) return <div className="wrap section center muted">Cargando…</div>
  if (!user || !isAdmin) return (
    <RequireAuth><div className="wrap section center"><h2>Acceso restringido</h2>
      <p className="muted">Tu cuenta no tiene permisos de administración.</p></div></RequireAuth>
  )
  return <>{children}</>
}
