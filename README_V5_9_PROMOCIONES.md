# Essential Decant V5.9 — Promociones y ofertas

## Archivos incluidos

- `index.html`
- `catalogo.html`
- `product.html`
- `admin.html`
- `index.js`
- `catalogo.js`
- `product.js`
- `admin.js`
- `supabase-api.js`
- `styles.css`
- `supabase/schema.sql`
- `supabase/migration_v5_9_promociones.sql`
- `assets/icons/*.svg`

## Cambios principales

- Se elimina el botón **Admin** del header público.
- Se deja un único acceso **Admin** discreto en el footer.
- Donde estaba Admin en la portada, ahora aparece **Packs**.
- Se agrega sección **Promociones y ofertas** en `catalogo.html`.
- En admin se agrega:
  - **Producto activo / visible en catálogo**.
  - **Descuento oferta (%)** de 0 a 25%.
  - Botón **Apagar / Activar** en la lista de productos.
- Los productos apagados no aparecen en catálogo, destacados, ofertas ni ficha pública.
- Los productos con descuento aparecen automáticamente en la sección de ofertas.
- El precio con descuento se usa también para el carrito y WhatsApp.

## Paso obligatorio en Supabase

Antes de usar descuento/apagar producto, ejecuta una vez en Supabase SQL Editor:

```sql
supabase/migration_v5_9_promociones.sql
```

Esto agrega las columnas:

- `is_active`
- `discount_percent`

## Subida a GitHub

```bash
git status
git add .
git commit -m "Agrega promociones ofertas y apagado de productos"
git push
```

## Nota

No se incluye ni se debe reemplazar `supabase-config.js`.
