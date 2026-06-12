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


## V5.2 Comercial

Incluye mejoras públicas solicitadas por cliente:

- Footer con redes sociales reales: Instagram, Facebook, TikTok y WhatsApp.
- Botón flotante de WhatsApp armónico con el diseño.
- Nueva vista individual de producto en `product.html?id=...`.
- Click en tarjeta del catálogo abre detalle del producto.
- Página de producto con galería, formatos 3ml/5ml/10ml, cantidad, carrito, consulta por WhatsApp y relacionados.

IMPORTANTE: si aplicas esta versión sobre una carpeta ya configurada, conserva tu `supabase-config.js` actual para no perder URL y publishable key.

## V5.3 Carrusel de destacados

Incluye ajuste de portada solicitado por cliente:

- Se elimina la imagen/tarjeta visual derecha del hero principal.
- Se agrega carrusel de productos destacados entre el nav y la sección principal.
- El carrusel usa productos marcados como destacados desde Supabase.
- Si faltan destacados, toma productos con imagen como respaldo.
- Click en la tarjeta central abre `product.html?id=...`.
- Las tarjetas laterales cambian el foco del carrusel.
- No requiere cambios en Supabase ni ejecutar SQL otra vez.

IMPORTANTE: esta versión no debe reemplazar `supabase-config.js` si el proyecto ya está configurado en producción.
