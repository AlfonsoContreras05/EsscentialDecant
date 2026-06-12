-- Essential Decant V5.1 — Supabase Lite
-- Ejecuta este archivo en Supabase Dashboard → SQL Editor.
--
-- IMPORTANTE:
-- 1) Crea primero el usuario admin en Authentication → Users.
-- 2) Reemplaza admin@essentialdecant.cl por el correo real del administrador.
-- 3) Ejecuta todo este SQL.
-- 4) Esta app no procesa pagos: solo catálogo, categorías, perfiles, portada e imágenes.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  order_index integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  order_index integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category_id uuid references public.categories(id) on delete restrict,
  profile_id uuid references public.profiles(id) on delete restrict,
  tag text not null default 'Fragancia',
  description text not null default 'Fragancia disponible en formato decant.',
  price_3ml integer not null default 0,
  price_5ml integer not null default 0,
  price_10ml integer not null default 0,
  stock text not null default 'Disponible' check (stock in ('Disponible', 'Agotado')),
  featured boolean not null default false,
  order_index integer not null default 999,
  image_url_1 text,
  image_url_2 text,
  image_url_3 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  hero_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read categories" on public.categories;
drop policy if exists "Admin can manage categories" on public.categories;
drop policy if exists "Public can read profiles" on public.profiles;
drop policy if exists "Admin can manage profiles" on public.profiles;
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Admin can manage products" on public.products;
drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Admin can manage site settings" on public.site_settings;

create policy "Public can read categories" on public.categories for select to anon, authenticated using (true);
create policy "Public can read profiles" on public.profiles for select to anon, authenticated using (true);
create policy "Public can read products" on public.products for select to anon, authenticated using (true);
create policy "Public can read site settings" on public.site_settings for select to anon, authenticated using (true);

-- Reemplaza admin@essentialdecant.cl por el correo real del admin.
create policy "Admin can manage categories" on public.categories for all to authenticated using ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl') with check ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');
create policy "Admin can manage profiles" on public.profiles for all to authenticated using ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl') with check ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');
create policy "Admin can manage products" on public.products for all to authenticated using ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl') with check ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');
create policy "Admin can manage site settings" on public.site_settings for all to authenticated using ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl') with check ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');

insert into public.site_settings (id, hero_image_url) values (1, null) on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Admin can upload product images" on storage.objects;
drop policy if exists "Admin can update product images" on storage.objects;
drop policy if exists "Admin can delete product images" on storage.objects;

create policy "Public can view product images" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "Admin can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');
create policy "Admin can update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'admin@essentialdecant.cl') with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');
create policy "Admin can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');

insert into public.categories (name, order_index) values ('Árabe', 1), ('Diseñador', 2) on conflict (name) do nothing;
insert into public.profiles (name, order_index) values ('Fresco', 1), ('Dulce', 2), ('Cítrico', 3), ('Intenso', 4), ('Amaderado', 5), ('Especiado', 6), ('Acuático', 7) on conflict (name) do nothing;

insert into public.products (name, brand, category_id, profile_id, tag, description, price_3ml, price_5ml, price_10ml, stock, featured, order_index)
select seed.name, seed.brand, c.id, p.id, seed.tag, seed.description, seed.price_3ml, seed.price_5ml, seed.price_10ml, seed.stock, seed.featured, seed.order_index
from (
  values
    ('Hawas Malibu', 'Rasasi', 'Árabe', 'Fresco', 'Tropical · Amaderado', 'Salida playera, limpia y tropical con sensación fresca de verano.', 3990, 5990, 9990, 'Disponible', true, 1),
    ('Hawas Tropical', 'Rasasi', 'Árabe', 'Fresco', 'Verde · Fresco', 'Perfil verde, jugoso y energético. Muy llamativo para uso diario.', 3990, 5990, 9990, 'Disponible', true, 2),
    ('Hawas Ice', 'Rasasi', 'Árabe', 'Cítrico', 'Limpio · Cítrico', 'Aroma limpio, frío y moderno. Buena opción para días de calor.', 4490, 6490, 10990, 'Disponible', true, 3),
    ('Jo Milano Bourbon', 'Jo Milano', 'Árabe', 'Dulce', 'Dulce · Verde', 'Dulzor moderno con presencia frutal y fondo elegante.', 3990, 5990, 9990, 'Disponible', false, 4),
    ('Jo Milano Full House', 'Jo Milano', 'Árabe', 'Cítrico', 'Cítrico · Fresco', 'Cítrico, versátil y fácil de usar. Ideal para descubrir algo distinto.', 3990, 5990, 9990, 'Disponible', false, 5),
    ('Versace Eros Energy', 'Versace', 'Diseñador', 'Cítrico', 'Cítrico · Brillante', 'Luminoso, chispeante y de vibra energética para destacar.', 4990, 7490, 12990, 'Disponible', true, 6),
    ('Versace Eros Flame', 'Versace', 'Diseñador', 'Dulce', 'Cálido · Intenso', 'Especiado, cálido y seductor. Mejor para tarde o noche.', 4990, 7490, 12990, 'Disponible', false, 7),
    ('Versace Eros', 'Versace', 'Diseñador', 'Fresco', 'Menta · Vainilla', 'Dulce fresco, reconocible y muy popular para salidas.', 4990, 7490, 12990, 'Disponible', false, 8),
    ('Versace Dylan Blue', 'Versace', 'Diseñador', 'Fresco', 'Azul · Aromático', 'Fresco, limpio y masculino. Muy usable para oficina y diario.', 4990, 7490, 12990, 'Disponible', false, 9)
) as seed(name, brand, category_name, profile_name, tag, description, price_3ml, price_5ml, price_10ml, stock, featured, order_index)
join public.categories c on c.name = seed.category_name
join public.profiles p on p.name = seed.profile_name
where not exists (select 1 from public.products existing where existing.name = seed.name and existing.brand = seed.brand);
