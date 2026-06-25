-- Essential Decant V6.4 — Banner promocional administrable + permisos admin real
-- Ejecutar una vez en Supabase SQL Editor.

alter table public.site_settings
  add column if not exists home_banner_image_url text;

-- Mantener lectura pública del sitio.
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- Permitir que el correo admin real edite portada y banner.
drop policy if exists "Admin can manage site settings" on public.site_settings;
create policy "Admin can manage site settings" on public.site_settings
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'decantessential@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'decantessential@gmail.com');

-- Reafirmar permisos de Storage para que el admin real pueda subir imágenes de productos, packs y banner.
drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Admin can upload product images" on storage.objects;
drop policy if exists "Admin can update product images" on storage.objects;
drop policy if exists "Admin can delete product images" on storage.objects;

create policy "Public can view product images" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admin can upload product images" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'decantessential@gmail.com');

create policy "Admin can update product images" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'decantessential@gmail.com')
  with check (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'decantessential@gmail.com');

create policy "Admin can delete product images" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images' and (auth.jwt() ->> 'email') = 'decantessential@gmail.com');
