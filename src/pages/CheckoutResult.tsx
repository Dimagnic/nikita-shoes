import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTitle } from '../lib/useTitle'

export function CheckoutOk() {
  const { clear } = useCart()
  useTitle('Pedido recibido')
  useEffect(() => { clear() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="wrap section center narrow">
      <h1>¡Gracias por tu compra!</h1>
      <p>Recibimos tu pago. Te enviaremos la confirmación por correo y podrás seguir tu pedido en tu cuenta.</p>
      <p className="muted">Si necesitas factura (CFDI), escríbenos dentro del mismo mes de tu compra.</p>
      <p><Link className="btn dark" to="/cuenta">Ver mis pedidos</Link> <Link className="btn" to="/tienda">Seguir comprando</Link></p>
    </div>
  )
}

export function CheckoutCancel() {
  useTitle('Pago cancelado')
  return (
    <div className="wrap section center narrow">
      <h1>Pago cancelado</h1>
      <p>No se hizo ningún cargo. Tu carrito sigue guardado.</p>
      <p><Link className="btn dark" to="/tienda">Volver a la tienda</Link></p>
    </div>
  )
}
