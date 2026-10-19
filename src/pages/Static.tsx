import { BIZ } from '../config/business'
import { useTitle } from '../lib/useTitle'

export function About() {
  useTitle('Nosotros')
  return (
    <div className="wrap section narrow prose">
      <h1>Nosotros</h1>
      <p>Nikita Shoes nace para que cada mujer encuentre zapatos que se vean bien y se sientan mejor. Elegimos materiales y hormas pensando en caminar la ciudad todo el día.</p>
      <p>Cada colección es corta y cuidada. Si tienes dudas de talla o de estilo, escríbenos: te ayudamos a elegir.</p>
    </div>
  )
}

export function Contact() {
  useTitle('Contacto')
  return (
    <div className="wrap section narrow prose">
      <h1>Contáctanos</h1>
      <p>Horario de atención: {BIZ.hours}.</p>
      <ul>
        <li>Correo: <a href={`mailto:${BIZ.email}`}>{BIZ.email}</a></li>
        <li>WhatsApp: <a href={`https://wa.me/${BIZ.whatsapp}`} target="_blank" rel="noopener noreferrer">escríbenos</a></li>
        <li>Teléfono: {BIZ.phone}</li>
        <li>Domicilio: {BIZ.address}</li>
      </ul>
      <p>Para quejas o aclaraciones sobre tu compra, escríbenos a <a href={`mailto:${BIZ.email}`}>{BIZ.email}</a>. Respondemos en máximo 2 días hábiles.</p>
    </div>
  )
}

export function SizeGuide() {
  useTitle('Guía de tallas')
  const rows = [['22', '22.0 cm', '35'], ['23', '23.0 cm', '36'], ['24', '24.0 cm', '37–38'], ['25', '25.0 cm', '39'], ['26', '26.0 cm', '40'], ['27', '27.0 cm', '41']]
  return (
    <div className="wrap section narrow prose">
      <h1>Guía de tallas</h1>
      <p>Mide tu pie de talón a punta apoyado en una hoja y elige la talla que corresponda. Si estás entre dos, elige la mayor.</p>
      <div className="scroll-x"><table><thead><tr><th>Talla MX</th><th>Largo del pie</th><th>Equivalencia EU</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}</tbody></table></div>
      <p className="muted small">Equivalencias aproximadas. Ajusta con tus medidas reales.</p>
    </div>
  )
}
