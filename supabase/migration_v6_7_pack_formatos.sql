-- Essential Decant V6.7
-- Packs con precios propios por formato 3ml / 5ml / 10ml.
-- Ejecutar una sola vez en Supabase SQL Editor.

alter table public.packs
  add column if not exists price_3ml integer default 0,
  add column if not exists price_5ml integer default 0,
  add column if not exists price_10ml integer default 0;

-- Mantiene compatibilidad con packs ya creados: si existía price, lo copia como base.
update public.packs
set
  price_3ml = coalesce(nullif(price_3ml, 0), price, 0),
  price_5ml = coalesce(nullif(price_5ml, 0), price, 0),
  price_10ml = coalesce(nullif(price_10ml, 0), price, 0),
  price = coalesce(nullif(price, 0), nullif(price_5ml, 0), nullif(price_3ml, 0), nullif(price_10ml, 0), 0)
where true;
