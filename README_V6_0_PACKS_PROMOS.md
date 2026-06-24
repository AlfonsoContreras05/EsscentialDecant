# Essential Decant V6.0 — Packs administrables, promociones separadas y catálogo paginado

## Archivos incluidos

- `index.html`
- `catalogo.html`
- `promociones.html`
- `admin.html`
- `index.js`
- `catalogo.js`
- `promociones.js`
- `admin.js`
- `supabase-api.js`
- `styles.css`
- `supabase/migration_v6_0_packs_promociones.sql`

## Cambios principales

- Se agrega página nueva `promociones.html` con packs primero y ofertas después.
- Los packs se crean desde el admin usando productos existentes, cantidad y formato 3ml/5ml/10ml.
- La sección packs de la portada ahora tiene un recuadro principal a todo el ancho y 4 recuadros debajo.
- Se elimina visualmente la numeración 01/02/03 de formatos.
- Se agrega banner alargado entre el menú y el carrusel de destacados.
- El título `Destacados` queda un poco más pequeño.
- Los filtros del catálogo muestran 5 al inicio y luego permiten “Ver más filtros”.
- El catálogo tiene paginación elegante de 20 productos por página.
- El acceso Admin queda en el footer con más espacio para que no lo tape WhatsApp.

## Paso importante en Supabase

Ejecutar una vez:

```sql
supabase/migration_v6_0_packs_promociones.sql
```

Si tu correo administrador no es `admin@essentialdecant.cl`, reemplázalo en la migración antes de ejecutar.
