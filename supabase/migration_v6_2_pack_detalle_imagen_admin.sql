-- Essential Decant V6.2 — Imagen en packs + políticas admin reales
-- Ejecuta este archivo UNA VEZ en Supabase Dashboard → SQL Editor.
-- Admin autorizado: decantessential@gmail.com

alter table public.packs
  add column if not exists image_url text;

-- Mantener lectura pública para packs y sus items.
drop policy if exists "Public can read packs" on public.packs;
drop policy if exists "Public can read pack items" on public.pack_items;

create policy "Public can read packs" on public.packs
  for select to anon, authenticated
  using (true);

create policy "Public can read pack items" on public.pack_items
  for select to anon, authenticated
  using (true);

-- Permisos de administración amarrados al correo real del cliente.
drop policy if exists "Admin can manage packs" on public.packs;
drop policy if exists "Admin can manage pack items" on public.pack_items;

create policy "Admin can manage packs" on public.packs
  for all to authenticated
  using (auth.email() = 'decantessential@gmail.com')
  with check (auth.email() = 'decantessential@gmail.com');

create policy "Admin can manage pack items" on public.pack_items
  for all to authenticated
  using (auth.email() = 'decantessential@gmail.com')
  with check (auth.email() = 'decantessential@gmail.com');
