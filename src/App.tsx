import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import CartDrawer from './components/CartDrawer'
import CookieBanner from './components/CookieBanner'
import { RequireAdmin, RequireAuth } from './components/Guards'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import { CheckoutCancel, CheckoutOk } from './pages/CheckoutResult'
import { About, Contact, SizeGuide } from './pages/Static'
import Legal from './pages/Legal'
import { AccountLayout, AddressesTab, OrdersTab, ProfileTab } from './pages/Account'
import { AdminLayout, AdminOrders, AdminProductForm, AdminProducts } from './pages/Admin'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Saltar al contenido</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/producto/:slug" element={<Product />} />
          <Route path="/checkout/exito" element={<CheckoutOk />} />
          <Route path="/checkout/cancelado" element={<CheckoutCancel />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/guia-de-tallas" element={<SizeGuide />} />
          <Route path="/legal/:slug" element={<Legal />} />
          <Route path="/cuenta" element={<RequireAuth><AccountLayout /></RequireAuth>}>
            <Route index element={<OrdersTab />} />
            <Route path="perfil" element={<ProfileTab />} />
            <Route path="direcciones" element={<AddressesTab />} />
          </Route>
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminProducts />} />
            <Route path="producto/:id" element={<AdminProductForm />} />
            <Route path="pedidos" element={<AdminOrders />} />
          </Route>
          <Route path="*" element={<div className="wrap section center"><h1>Página no encontrada</h1></div>} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <AuthModal />
      <CookieBanner />
      <ScrollTop />
    </>
  )
}
