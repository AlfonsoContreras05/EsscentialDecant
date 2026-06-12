# Essential Decant V5.1 — Supabase Lite

Aplicación web estática para Essential Decant conectada a Supabase.

## Cambios V5.1

- Productos con hasta 3 imágenes.
- Catálogo con selector visual de imágenes por producto.
- Admin con 3 cargas de imagen por producto.
- Imagen principal de la landing configurable desde admin.
- Logo quitado de la tarjeta visual principal de la landing.
- Número oficial actualizado a +56 9 3459 9409.
- Supabase guarda productos, categorías, perfiles, portada e imágenes.
- Netlify sigue funcionando como hosting estático.

## Archivos clave

```txt
index.html
catalogo.html
admin.html
styles.css
supabase-config.js
supabase-api.js
index.js
catalogo.js
admin.js
supabase/schema.sql
supabase/INSTRUCCIONES_SUPABASE.md
```

## Configuración rápida

1. Crear proyecto en Supabase.
2. Crear usuario admin en Authentication.
3. Reemplazar el correo admin en `supabase/schema.sql`.
4. Ejecutar `supabase/schema.sql`.
5. Copiar Project URL y anon key.
6. Pegarlos en `supabase-config.js`.
7. Subir cambios a GitHub.
8. Netlify despliega automáticamente.

## WhatsApp

```js
const SELLER_PHONE = "56934599409";
```

Este número corresponde a:

```txt
+56 9 3459 9409
```

## Importante

No uses `service_role key` en frontend.
