import { useEffect, useState } from 'react'
import { BIZ } from '../config/business'
import { ArrowUpIcon, WhatsAppIcon } from './Icons'

// Botón flotante de WhatsApp (arriba del widget del asistente) y botón para volver arriba.
export default function FloatingActions() {
  const [top, setTop] = useState(false)
  useEffect(() => {
    const f = () => setTop(window.scrollY > 600)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const msg = encodeURIComponent('Hola, quiero información sobre Nikita Shoes.')
  return (
    <>
      <a className="fab fab-wa" href={`https://wa.me/${BIZ.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">
        <WhatsAppIcon />
      </a>
      <button className={`fab fab-top ${top ? 'on' : ''}`} aria-label="Volver arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ArrowUpIcon />
      </button>
    </>
  )
}
