import { Link, useParams } from 'react-router-dom'
import { BIZ as B } from '../config/business'
import { useTitle } from '../lib/useTitle'
import { money } from '../lib/format'

type Doc = { title: string; sections: [string, string[]][] }

const DOCS: Record<string, Doc> = {
  privacidad: {
    title: 'Aviso de Privacidad Integral',
    sections: [
      ['1. Responsable', [`${B.legalName} (“${B.brand}”), con domicilio en ${B.address}, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.`]],
      ['2. Datos que recabamos', ['Identificación y contacto: nombre, correo electrónico, teléfono. Entrega: domicilio de envío. Compra: productos, importes y estado del pedido. Cuenta: contraseña (almacenada cifrada). Navegación: datos técnicos mínimos necesarios para el funcionamiento del sitio.', 'No almacenamos los datos de tu tarjeta: el pago lo procesa Stripe directamente. No recabamos datos personales sensibles.']],
      ['3. Finalidades', ['Necesarias: crear y administrar tu cuenta, procesar y entregar tus pedidos, atender cambios, garantías y aclaraciones, emitir comprobantes y cumplir obligaciones fiscales.', 'Opcionales (puedes negarte sin afectar tu compra): enviarte promociones y novedades por correo. Puedes darte de baja en cualquier momento escribiendo a ' + B.privacyEmail + ' o con el enlace de cancelación.']],
      ['4. Transferencias y encargados', ['Compartimos datos únicamente con proveedores necesarios para operar: Stripe (pagos), Supabase (alojamiento de base de datos y autenticación), Vercel (alojamiento del sitio) y paqueterías (entrega). Estos terceros tratan los datos por cuenta nuestra. No vendemos tus datos. Fuera de lo anterior, solo los transferiremos cuando lo exija una autoridad competente.']],
      ['5. Derechos ARCO', [`Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos, y a revocar tu consentimiento. Envía tu solicitud a ${B.privacyEmail} indicando tu nombre, correo de tu cuenta, el derecho que ejerces y una descripción clara de tu petición. Responderemos en un máximo de 20 días hábiles. También puedes corregir tus datos desde tu cuenta.`]],
      ['6. Cookies y tecnologías', ['Consulta nuestra Política de Cookies.']],
      ['7. Cambios al aviso', [`Cualquier cambio se publicará en esta página. Última actualización: ${B.updated}.`]],
    ],
  },
  terminos: {
    title: 'Términos y Condiciones de Venta',
    sections: [
      ['1. Proveedor', [`Este sitio es operado por ${B.legalName}, RFC ${B.rfc}, con domicilio en ${B.address}. Contacto: ${B.email}, ${B.phone}.`]],
      ['2. Aceptación', ['Al crear una cuenta o realizar una compra declaras ser mayor de edad, tener capacidad legal y aceptar estos términos, el Aviso de Privacidad y la política de cambios.']],
      ['3. Precios y pago', ['Todos los precios están en pesos mexicanos (MXN) e incluyen IVA. El costo de envío se muestra antes de pagar. El pago se realiza con tarjeta a través de Stripe, una plataforma certificada PCI-DSS. El pedido se confirma cuando recibimos el pago.', 'Si un precio estuviera publicado con un error evidente, te lo notificaremos antes de enviar y podrás confirmar el pedido o recibir un reembolso total.']],
      ['4. Disponibilidad', ['Los productos están sujetos a existencias. Si después de tu pago algún artículo no pudiera surtirse, te ofreceremos un cambio o el reembolso del importe por el mismo medio de pago.']],
      ['5. Envíos', ['Consulta la página de Envíos y entregas.']],
      ['6. Cambios, devoluciones y garantía', ['Consulta la política de Cambios y devoluciones. Los productos cuentan con garantía por defectos de fabricación conforme a la Ley Federal de Protección al Consumidor.']],
      ['7. Propiedad intelectual', [`Las marcas, logotipos, fotografías y textos del sitio son propiedad de ${B.legalName} o se usan con autorización. No pueden reproducirse sin permiso por escrito.`]],
      ['8. Quejas', [`Para quejas o aclaraciones escribe a ${B.email}. También puedes acudir a la Procuraduría Federal del Consumidor (PROFECO): www.profeco.gob.mx, teléfono 55 5568 8722.`]],
      ['9. Ley aplicable', ['Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para su interpretación, las partes se someten a la jurisdicción de los tribunales competentes, sin perjuicio del derecho del consumidor de acudir ante PROFECO o ante la autoridad que corresponda.']],
      ['', [`Última actualización: ${B.updated}.`]],
    ],
  },
  devoluciones: {
    title: 'Cambios y devoluciones',
    sections: [
      ['Plazo', [`Tienes ${B.returnDays} días naturales desde que recibes tu pedido para solicitar un cambio de talla o modelo, o una devolución.`]],
      ['Condiciones', ['El producto debe estar sin uso, con su caja y etiquetas originales, y sin señales de desgaste en la suela. Prueba el calzado sobre una superficie limpia y suave.']],
      ['Cómo solicitarlo', [`Escríbenos a ${B.email} con tu número de pedido y el motivo. Te enviaremos las instrucciones. El primer cambio de talla no tiene costo de envío.`]],
      ['Reembolsos', ['Si procede la devolución, reembolsamos el importe del producto al mismo método de pago en un máximo de 10 días hábiles después de recibir y revisar el producto. El banco puede tardar días adicionales en reflejarlo.']],
      ['Productos con defecto', [`Si tu producto llega con defecto de fabricación o distinto al pedido, lo cambiamos o reembolsamos íntegramente, incluido el envío, conforme a la Ley Federal de Protección al Consumidor. Avísanos dentro de los ${B.returnDays} días siguientes a la entrega con fotografías.`]],
      ['Revocación de la compra', ['Conforme al artículo 56 de la LFPC, puedes revocar tu compra a distancia dentro de los 5 días hábiles posteriores a la entrega, sin responsabilidad, devolviendo el producto en las condiciones indicadas.']],
    ],
  },
  envios: {
    title: 'Envíos y entregas',
    sections: [
      ['Cobertura', ['Enviamos a toda la República Mexicana mediante paquetería.']],
      ['Costos', [`Envío estándar: ${money(B.shippingFlatCents)}. Envío gratis en compras desde ${money(B.freeShippingMinCents)}.`]],
      ['Tiempos', [`Preparamos tu pedido en 1 a 2 días hábiles. La entrega tarda ${B.deliveryDays} contados desde la confirmación del pago. Te enviaremos tu número de guía por correo y lo verás en tu cuenta.`]],
      ['Entrega', ['Verifica que la caja llegue en buen estado. Si hay daños visibles, rechaza el paquete o repórtalo de inmediato a ' + B.email + '.']],
    ],
  },
  cookies: {
    title: 'Política de Cookies y almacenamiento',
    sections: [
      ['Qué usamos', ['Usamos únicamente almacenamiento local esencial: mantener tu sesión iniciada, guardar tu carrito y recordar que viste este aviso. Sin ellos el sitio no funciona.']],
      ['Qué no usamos', ['No usamos cookies de publicidad ni de seguimiento entre sitios. Si en el futuro agregamos analítica o publicidad, pediremos tu consentimiento previo.']],
      ['Cómo borrarlas', ['Puedes borrar los datos del sitio desde la configuración de tu navegador. Tu carrito y sesión se reiniciarán.']],
      ['Terceros', ['Stripe puede usar sus propias cookies en su página de pago para prevenir fraude. Consulta su política en stripe.com/mx/privacy.']],
    ],
  },
  'aviso-legal': {
    title: 'Datos del proveedor',
    sections: [
      ['Identificación', [`Razón social / titular: ${B.legalName}`, `RFC: ${B.rfc}`, `Domicilio: ${B.address}`, `Correo: ${B.email}`, `Teléfono: ${B.phone}`, `Horario de atención: ${B.hours}`]],
      ['Medios para quejas y aclaraciones', [`${B.email}. También puedes acudir a PROFECO (www.profeco.gob.mx).`]],
    ],
  },
}

export default function Legal() {
  const { slug = '' } = useParams()
  const d = DOCS[slug]
  useTitle(d?.title ?? 'No encontrado')
  if (!d) return <div className="wrap section center"><h1>Página no encontrada</h1><Link to="/">Ir al inicio</Link></div>
  return (
    <article className="wrap section narrow prose">
      <h1>{d.title}</h1>
      {d.sections.map(([h, ps]) => (
        <section key={h || 'x'}>{h && <h2>{h}</h2>}{ps.map((p, i) => <p key={i}>{p}</p>)}</section>
      ))}
    </article>
  )
}
