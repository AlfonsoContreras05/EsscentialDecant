# Essential Decant V6.4 — Ajustes finales de jornada

## Archivos que reemplaza

- `index.html`
- `catalogo.html`
- `product.html`
- `promociones.html`
- `pack.html`
- `admin.html`
- `index.js`
- `catalogo.js`
- `product.js`
- `promociones.js`
- `pack.js`
- `admin.js`
- `supabase-api.js`
- `styles.css`
- `supabase/migration_v6_4_banner_carrito_packs.sql`

## Cambios incluidos

- Footer con íconos de redes solamente, sin nombres.
- Crédito: `Desarrollado con ❤ por Orfheres` bajo la marca.
- Título `Destacados` reducido aproximadamente al 50%.
- Banner promocional entre menú y destacados ahora se puede subir desde el admin.
- Packs pueden agregarse al carrito desde promociones y desde el detalle del pack.
- Carrito reconoce productos normales y packs sin mostrar `packml`.

## Paso en Supabase

Ejecutar una vez en Supabase SQL Editor:

```sql
supabase/migration_v6_4_banner_carrito_packs.sql
```

Esto agrega la columna `home_banner_image_url` en `site_settings` y reafirma permisos para el admin real:

```txt
decantessential@gmail.com
```

## Subida a Git

```bash
git status
git add .
git commit -m "Ajustes finales banner footer y carrito de packs"
git push
```
