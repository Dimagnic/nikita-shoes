# Nikita Shoes · Tienda en línea

React + TypeScript (Vite) · Supabase (auth, base de datos, fotos) · Stripe Checkout · Funciones Node en Vercel.

## 1. Supabase
1. Crea un proyecto en supabase.com.
2. **SQL Editor** → pega y ejecuta todo `supabase/schema.sql` (tablas, seguridad por filas, bucket de fotos y 2 productos de ejemplo).
3. **Authentication → URL Configuration**: en *Site URL* pon tu dominio; en *Redirect URLs* agrega `http://localhost:3000` y tu dominio.
4. **Authentication → Providers → Email**: deja activada la confirmación de correo.
5. Copia de **Project Settings → API**: `Project URL`, `anon key` y `service_role key`.
6. Regístrate en tu tienda y vuélvete administradora (SQL Editor):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'TU-CORREO');
   ```
   Entra a `/admin` para subir productos, fotos, tallas e inventario, y gestionar pedidos.

## 2. Local
```bash
cp .env.example .env      # llena las variables
npm install
npx vercel dev --listen 3000   # sirve el sitio y /api juntos
```
(`npm run dev` sirve solo el frontend, sin pagos.)

## 3. GitHub y Vercel
```bash
git init && git add . && git commit -m "Tienda Nikita"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/nikita-shoes.git
git push -u origin main
```
En vercel.com → *Add New Project* → importa el repo (Framework: Vite). Agrega **todas** las variables de `.env.example` en *Settings → Environment Variables* y despliega. Conecta tu dominio en *Settings → Domains* y actualiza `SITE_URL`.

## 4. Stripe: prueba y producción
**Prueba**
1. Dashboard de Stripe en *modo de prueba* → copia `sk_test_...` a `STRIPE_SECRET_KEY`.
2. *Developers → Webhooks → Add endpoint*: `https://TU-DOMINIO/api/stripe-webhook`. Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `charge.refunded`. Copia el `whsec_...` a `STRIPE_WEBHOOK_SECRET`.
3. Redeploy y paga con la tarjeta `4242 4242 4242 4242` (cualquier fecha futura y CVC).

**Producción**
1. Completa la activación de tu cuenta Stripe México (datos fiscales y cuenta bancaria).
2. Cambia a *modo real*, repite el endpoint del webhook (genera otro `whsec_`).
3. Reemplaza en Vercel `STRIPE_SECRET_KEY` por `sk_live_...` y `STRIPE_WEBHOOK_SECRET` por el real. Redeploy.
4. En *Settings → Emails* de Stripe activa los recibos automáticos al cliente.

Seguridad de pagos: los precios y existencias se leen en el servidor desde Supabase; el navegador solo envía qué talla y cuántos pares. El pedido pasa a *Pagado* únicamente cuando el webhook verifica la firma de Stripe.

## 5. Antes de vender (México)
- [ ] Completa `src/config/business.ts` (razón social, RFC, domicilio, correos, teléfono). Se refleja en el pie de página y en todas las páginas legales.
- [ ] Que un abogado revise las páginas de `/legal/*`. Son plantillas basadas en la LFPC (art. 76 bis y 56), la LFPDPPP y PROFECO, no asesoría legal.
- [ ] Da de alta tu negocio en el SAT y define cómo emitirás CFDI (el sitio indica a la clienta que lo solicite por correo).
- [ ] Crea los correos `contacto@` y `privacidad@` de tu dominio.
- [ ] Haz una compra de prueba completa y una devolución de prueba (reembolso desde Stripe → el pedido cambia a *Reembolsado*).
- [ ] Si agregas analítica o publicidad (Meta Pixel, Google Analytics), actualiza el aviso de cookies para pedir consentimiento.

## Estructura
```
api/                  Funciones Node (Stripe): crear sesión de pago y webhook
src/pages/            Inicio, tienda, producto, cuenta, admin, legales
src/components/       Encabezado, modal de acceso, carrito, pie, cookies
src/config/business.ts  Datos del negocio
supabase/schema.sql   Base de datos y seguridad
```
