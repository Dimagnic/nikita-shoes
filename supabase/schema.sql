-- =====================================================================
-- Nikita Shoes · Esquema de Supabase. Ejecutar completo en SQL Editor.
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- Perfiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, accepted_terms_at)
  values (new.id, new.raw_user_meta_data->>'full_name',
          case when (new.raw_user_meta_data->>'accepted_terms') = 'true' then now() end);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Productos ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null default 'sandalias',
  price_cents integer not null check (price_cents >= 0),       -- precio final con IVA incluido
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= 0),
  color text,
  material text,
  heel_height_mm integer,
  details text[] not null default '{}',                         -- viñetas de características
  care text,
  images text[] not null default '{}',                          -- la primera es la principal
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  sku text,
  unique (product_id, size)
);

-- ---------- Direcciones ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'MX',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Pedidos ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'mxn',
  stripe_session_id text unique,
  stripe_payment_intent text,
  shipping_address jsonb,
  customer_name text,
  customer_phone text,
  tracking_number text,
  carrier text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  size text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  image text
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Descuenta inventario de un pedido pagado (solo la llama el servidor).
create or replace function public.decrement_stock(p_order_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.product_variants v
     set stock = greatest(v.stock - i.quantity, 0)
    from public.order_items i
   where i.order_id = p_order_id and i.variant_id = v.id;
$$;
revoke execute on function public.decrement_stock(uuid) from public, anon, authenticated;
grant execute on function public.decrement_stock(uuid) to service_role;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "perfil: ver propio o admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "perfil: editar propio sin cambiar rol" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());

create policy "productos: público ve activos" on public.products for select
  using (active or public.is_admin());
create policy "productos: admin escribe" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "variantes: público ve las de productos activos" on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
create policy "variantes: admin escribe" on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());

create policy "direcciones: dueño" on public.addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "pedidos: ver propios o admin" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "pedidos: admin actualiza" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "partidas: ver propias o admin" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

create policy "newsletter: cualquiera se suscribe" on public.newsletter_subscribers for insert
  with check (true);
create policy "newsletter: admin lee" on public.newsletter_subscribers for select
  using (public.is_admin());

-- ---------- Storage para fotos de productos ----------
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;
create policy "fotos: lectura pública" on storage.objects for select
  using (bucket_id = 'products');
create policy "fotos: admin sube" on storage.objects for insert
  with check (bucket_id = 'products' and public.is_admin());
create policy "fotos: admin edita" on storage.objects for update
  using (bucket_id = 'products' and public.is_admin());
create policy "fotos: admin borra" on storage.objects for delete
  using (bucket_id = 'products' and public.is_admin());

-- ---------- Productos de ejemplo (puedes borrarlos desde el panel) ----------
insert into public.products (slug, name, description, category, price_cents, color, material, heel_height_mm, details, care, images, featured)
values
('sandalia-tacon-arillos','Sandalia de tacón con arillos',
 'Sandalia de tacón ancho con tiras y arillos metálicos. Cómoda para todo el día.',
 'sandalias',189000,'Negro','Piel sintética texturizada',70,
 array['Tacón ancho de 7 cm','Cierre con arillos metálicos','Punta abierta','Suela antiderrapante'],
 'Limpia con un paño suave y seco. Evita la humedad.',array['/img/sand.jpg'],true),
('alpargata-cuna-liston','Alpargata de cuña con listón',
 'Alpargata con cuña de yute y listón para amarrar al tobillo.',
 'alpargatas',159000,'Beige tostado','Lona y yute',90,
 array['Cuña de yute de 9 cm','Listón ajustable al tobillo','Plantilla acolchada'],
 'Limpia con un paño húmedo. No sumergir en agua.',array['/img/espa.jpg'],true)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, size, stock)
select p.id, s, 5 from public.products p, unnest(array['22','23','24','25','26','27']) s
where p.slug in ('sandalia-tacon-arillos','alpargata-cuna-liston')
on conflict do nothing;
