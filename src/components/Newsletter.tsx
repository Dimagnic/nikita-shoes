import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState('')
  const [consent, setConsent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('newsletter_subscribers').insert({ email })
    if (error && error.code !== '23505') return setOk('No pudimos suscribirte. Intenta de nuevo.')
    setOk('Listo, ya estás suscrita.'); setEmail(''); setConsent(false)
  }
  return (
    <section className="news">
      <div className="wrap center">
        <h2>Entérate primero de lo nuevo</h2>
        <p className="muted">Recibe lanzamientos y ofertas en tu correo.</p>
        <form onSubmit={submit} className="news-form">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo electrónico" aria-label="Correo electrónico" />
          <button className="btn dark" disabled={!consent}>Suscribirme</button>
        </form>
        <label className="check news-check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>Acepto recibir correos de Nikita y el <Link to="/legal/privacidad">Aviso de Privacidad</Link>. Puedo cancelar cuando quiera.</span>
        </label>
        <p role="status" className="muted">{ok}</p>
      </div>
    </section>
  )
}
