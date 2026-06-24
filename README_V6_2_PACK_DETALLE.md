# Essential Decant V6.2 — Packs mejorados

## Qué cambia

- El admin ahora tiene botones con flecha para contraer paneles grandes.
- Los packs pueden tener imagen propia desde el admin.
- Los packs de promociones ahora se ven como tarjetas más comerciales.
- Al hacer click en un pack se abre `pack.html?id=...` con una ficha detallada.
- La ficha del pack muestra imagen grande, descripción, precio, productos incluidos y botón de WhatsApp.

## Archivos a reemplazar

- `admin.html`
- `admin.js`
- `promociones.html`
- `promociones.js`
- `pack.html`
- `pack.js`
- `supabase-api.js`
- `styles.css`
- `supabase/migration_v6_2_pack_detalle_imagen_admin.sql`

## Paso en Supabase

Ejecutar una vez:

```sql
supabase/migration_v6_2_pack_detalle_imagen_admin.sql
```

Esto agrega `image_url` a la tabla `packs` y deja las políticas para el correo:

```txt
decantessential@gmail.com
```

## Git

```bash
git status
git add .
git commit -m "Mejora packs con imagen detalle y paneles contraibles"
git push
```
