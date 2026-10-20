import { Link } from 'react-router-dom'
import { BIZ } from '../config/business'
import { FacebookIcon, InstagramIcon } from './Icons'

const CHAT_URL = 'https://clienteai.site/chat/cn354t3cez023j2n'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="fcols">
          <div className="f-brand">
            <img src="/img/logo-light.png" alt="Nikita" height={96} />
            <p className="f-text">Zapatos de mujer con envío a todo México.</p>
            <p className="f-wa"><a href={`https://wa.me/${BIZ.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp: {BIZ.phone}</a></p>
            <div className="f-social">
              <a href={BIZ.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>
              <a href={BIZ.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>

          <div>
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/tienda">Novedades</Link></li>
              <li><Link to="/tienda?cat=alpargatas">Alpargatas</Link></li>
              <li><Link to="/tienda?cat=sandalias">Sandalias</Link></li>
              <li><Link to="/tienda?cat=tacones">Tacones</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4>Servicios</h4>
            <ul>
              <li><Link to="/legal/envios">Envíos a todo México</Link></li>
              <li><Link to="/legal/devoluciones">Cambios y devoluciones</Link></li>
              <li><Link to="/guia-de-tallas">Guía de tallas</Link></li>
              <li><Link to="/contacto">Facturación</Link></li>
              <li><a href={`https://wa.me/${BIZ.whatsapp}`} target="_blank" rel="noopener noreferrer">Atención por WhatsApp</a></li>
            </ul>
          </div>

          <div className="f-legal">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/legal/terminos">Términos y condiciones</Link></li>
              <li><Link to="/legal/privacidad">Aviso de privacidad</Link></li>
              <li><Link to="/legal/cookies">Política de cookies</Link></li>
              <li><Link to="/legal/aviso-legal">Datos del proveedor</Link></li>
            </ul>
            <p className="f-text small">Precios en pesos mexicanos (MXN), con IVA incluido. Sujetos a disponibilidad.</p>
            <p className="f-text small">{BIZ.legalName} · RFC {BIZ.rfc}<br />{BIZ.address}<br />{BIZ.hours}</p>
          </div>

          <div className="f-qr">
            <h4>Asistente virtual</h4>
            <a href={CHAT_URL} target="_blank" rel="noopener noreferrer" aria-label="Abrir el chat con el asistente virtual de Nikita">
              <img src="/img/qr-asistente.png" alt="Código QR para chatear con el asistente virtual de Nikita Shoes" width={190} height={222} loading="lazy" />
            </a>
            <p className="f-text">Escanea el código y chatea con nuestro asistente.</p>
          </div>
        </div>

        <div className="f-bar">
          <span>© {new Date().getFullYear()} {BIZ.brand}. Todos los derechos reservados.</span>
          <span className="f-by">Diseñado por <a className="f-logo" href="https://cero-new-generation-e19z.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Cero+ (abre su sitio en una pestaña nueva)"><img src="/img/cero-mas.png" alt="Cero+" /></a></span>
        </div>
      </div>
    </footer>
  )
}
