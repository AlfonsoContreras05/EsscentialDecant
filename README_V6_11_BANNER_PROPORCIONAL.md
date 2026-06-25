# Essential Decant V6.11 — Banner proporcional sin perder imagen

## Archivos incluidos

- `styles.css`
- `index.js`

## Qué corrige

- El banner promocional ya no recorta la imagen subida por el cliente.
- La imagen principal usa `object-fit: contain` para verse completa.
- El banner sigue pareciendo banner porque el fondo usa la misma imagen difuminada en `cover`.
- Se adapta mejor a imágenes 2:1, como 6912 x 3456.
- La previsualización del admin también usa `contain`.

## No requiere Supabase

No hay SQL ni migraciones.

## Comandos sugeridos

```bash
git status
git add styles.css index.js
git commit -m "Ajusta banner promocional sin recorte"
git push
```
