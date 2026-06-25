# V6.5 — Pack con solo imagen propia

## Archivo incluido

- `supabase-api.js`

## Cambio

Los packs ahora usan solamente la imagen subida desde el admin del pack (`image_url`).
Ya no se rellenan las galerías con imágenes de los perfumes incluidos.

Esto deja la ficha `pack.html` más limpia y evita que aparezcan miniaturas de otros productos.

## No requiere Supabase

No hay migración SQL en esta versión.

## Subida sugerida

```bash
git status
git add supabase-api.js
git commit -m "Usa solo imagen propia en packs"
git push
```
