import { Link } from 'react-router-dom'
import { BIZ } from '../config/business'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div><img src="/img/logo-light.png" alt="Nikita" height={96} />
            <p className="foot-addr">{BIZ.legalName}<br />RFC {BIZ.rfc}<br />{BIZ.address}</p></div>
          <div><h4>Servicio al cliente</h4><ul>
            <li><Link to="/contacto">Contáctanos</Link></li>
            <li><Link to="/legal/envios">Envíos y entregas</Link></li>
            <li><Link to="/legal/devoluciones">Cambios y devoluciones</Link></li>
            <li><Link to="/guia-de-tallas">Guía de tallas</Link></li></ul></div>
          <div><h4>Información legal</h4><ul>
            <li><Link to="/legal/terminos">Términos y condiciones</Link></li>
            <li><Link to="/legal/privacidad">Aviso de privacidad</Link></li>
            <li><Link to="/legal/cookies">Política de cookies</Link></li>
            <li><Link to="/legal/aviso-legal">Datos del proveedor</Link></li></ul></div>
          <div><h4>Síguenos</h4><ul>
            <li><a href={BIZ.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href={BIZ.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href={BIZ.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a></li>
            <li><a href={`https://wa.me/${BIZ.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li></ul></div>
        </div>
        <div className="legal-line">
          <span>© {new Date().getFullYear()} {BIZ.brand}. Todos los derechos reservados. Precios en MXN con IVA incluido.</span>
          <span>Pagos seguros con Stripe</span>
        </div>
      </div>
    </footer>
  )
}
