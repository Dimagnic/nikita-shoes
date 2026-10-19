import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type AuthMode } from '../context/AuthContext'
import { supabase, configured } from '../lib/supabase'
import { CloseIcon } from './Icons'

const TITLES: Record<AuthMode, string> = {
  login: 'Iniciar sesión', register: 'Crear cuenta', forgot: 'Recuperar contraseña', recovery: 'Nueva contraseña',
}

export default function AuthModal() {
  const { authOpen, authMode, openAuth, closeAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (authOpen && !d.open) d.showModal()
    if (!authOpen && d.open) d.close()
  }, [authOpen])
  useEffect(() => { setErr(''); setInfo('') }, [authMode, authOpen])

  const fail = (m: string) => setErr(
    /Invalid login/i.test(m) ? 'Correo o contraseña incorrectos.'
    : /already registered/i.test(m) ? 'Ese correo ya tiene una cuenta. Inicia sesión.'
    : /Email not confirmed/i.test(m) ? 'Confirma tu correo antes de iniciar sesión. Revisa tu bandeja.'
    : /rate limit/i.test(m) ? 'Demasiados intentos. Espera un momento.' : m)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setInfo('')
    if (!configured) return setErr('Falta configurar Supabase en las variables de entorno.')
    if (authMode !== 'forgot' && authMode !== 'login' && pass.length < 8) return setErr('La contraseña debe tener al menos 8 caracteres.')
    if (authMode === 'register' && !terms) return setErr('Debes aceptar los Términos y el Aviso de Privacidad.')
    setBusy(true)
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (error) return fail(error.message)
        closeAuth(); setPass('')
      } else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email, password: pass,
          options: { data: { full_name: name, accepted_terms: 'true' }, emailRedirectTo: window.location.origin },
        })
        if (error) return fail(error.message)
        if (data.session) closeAuth()
        else setInfo('Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve a iniciar sesión.')
      } else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
        if (error) return fail(error.message)
        setInfo('Si el correo existe, te enviamos un enlace para crear una contraseña nueva.')
      } else {
        const { error } = await supabase.auth.updateUser({ password: pass })
        if (error) return fail(error.message)
        setInfo('Contraseña actualizada.'); setTimeout(closeAuth, 1200)
      }
    } finally { setBusy(false) }
  }

  return (
    <dialog ref={ref} className="modal" onClose={closeAuth} onClick={(e) => { if (e.target === ref.current) closeAuth() }} aria-labelledby="auth-title">
      <div className="modal-body">
        <button className="icon-btn modal-x" aria-label="Cerrar" onClick={closeAuth}><CloseIcon /></button>
        <h2 id="auth-title">{TITLES[authMode]}</h2>

        {(authMode === 'login' || authMode === 'register') && (
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={authMode === 'login'} onClick={() => openAuth('login')}>Ya tengo cuenta</button>
            <button role="tab" aria-selected={authMode === 'register'} onClick={() => openAuth('register')}>Soy nueva</button>
          </div>
        )}

        <form onSubmit={submit} className="form">
          {authMode === 'register' && (
            <label>Nombre completo<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          )}
          {authMode !== 'recovery' && (
            <label>Correo electrónico<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          )}
          {authMode !== 'forgot' && (
            <label>{authMode === 'recovery' ? 'Nueva contraseña' : 'Contraseña'}
              <input type="password" required minLength={authMode === 'login' ? 1 : 8} value={pass} onChange={(e) => setPass(e.target.value)}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} />
            </label>
          )}
          {authMode === 'register' && (
            <label className="check">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>Acepto los <Link to="/legal/terminos" onClick={closeAuth}>Términos y Condiciones</Link> y he leído el <Link to="/legal/privacidad" onClick={closeAuth}>Aviso de Privacidad</Link>.</span>
            </label>
          )}
          {err && <p className="msg err" role="alert">{err}</p>}
          {info && <p className="msg ok" role="status">{info}</p>}
          <button className="btn dark" disabled={busy}>{busy ? 'Un momento…' : TITLES[authMode]}</button>
        </form>

        {authMode === 'login' && <button className="linkish center" onClick={() => openAuth('forgot')}>Olvidé mi contraseña</button>}
        {authMode === 'forgot' && <button className="linkish center" onClick={() => openAuth('login')}>Volver a iniciar sesión</button>}
      </div>
    </dialog>
  )
}
