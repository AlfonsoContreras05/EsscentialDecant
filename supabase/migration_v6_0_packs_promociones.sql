-- Essential Decant V6.0 — Packs administrables + promociones separadas
-- Ejecuta este archivo UNA VEZ en Supabase Dashboard → SQL Editor.
-- Si tu correo admin NO es admin@essentialdecant.cl, reemplázalo antes de ejecutar.

create table if not exists public.packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text,
  description text,
  price integer not null default 0,
  is_active boolean not null default true,
  featured boolean not null default false,
  order_index integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  size_ml integer not null default 5,
  quantity integer not null default 1,
  order_index integer not null default 999,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'packs_price_non_negative'
      and conrelid = 'public.packs'::regclass
  ) then
    alter table public.packs
      add constraint packs_price_non_negative check (price >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'pack_items_size_allowed'
      and conrelid = 'public.pack_items'::regclass
  ) then
    alter table public.pack_items
      add constraint pack_items_size_allowed check (size_ml in (3, 5, 10));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'pack_items_quantity_positive'
      and conrelid = 'public.pack_items'::regclass
  ) then
    alter table public.pack_items
      add constraint pack_items_quantity_positive check (quantity > 0);
  end if;
end $$;

drop trigger if exists packs_set_updated_at on public.packs;
create trigger packs_set_updated_at before update on public.packs for each row execute function public.set_updated_at();

alter table public.packs enable row level security;
alter table public.pack_items enable row level security;

drop policy if exists "Public can read packs" on public.packs;
drop policy if exists "Admin can manage packs" on public.packs;
drop policy if exists "Public can read pack items" on public.pack_items;
drop policy if exists "Admin can manage pack items" on public.pack_items;

create policy "Public can read packs" on public.packs
  for select to anon, authenticated
  using (true);

create policy "Public can read pack items" on public.pack_items
  for select to anon, authenticated
  using (true);

create policy "Admin can manage packs" on public.packs
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl')
  with check ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');

create policy "Admin can manage pack items" on public.pack_items
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl')
  with check ((auth.jwt() ->> 'email') = 'admin@essentialdecant.cl');

create index if not exists packs_order_index_idx on public.packs(order_index, name);
create index if not exists pack_items_pack_id_idx on public.pack_items(pack_id, order_index);
create index if not exists pack_items_product_id_idx on public.pack_items(product_id);
