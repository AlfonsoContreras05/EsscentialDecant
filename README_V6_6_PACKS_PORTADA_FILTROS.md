# Essential Decant V6.6 — Packs en portada + filtros de packs

## Archivos incluidos

- index.html
- index.js
- promociones.html
- promociones.js
- styles.css
- supabase-api.js

## Cambios

- Se ordena visualmente el bloque “Formato decant”.
- “Destacados” vuelve al mismo estilo/tamaño tipográfico del hero “Fragancias premium”.
- La sección Packs de portada queda con un bloque grande a todo el ancho y 4 cards debajo.
- Las 4 cards de portada muestran packs reales cargados desde Supabase cuando existen.
- La página promociones agrega filtros de packs por 3ml, 5ml y 10ml.
- Se mantiene el fix V6.5: los packs usan solo su imagen propia.

## Supabase

No requiere correr SQL.

## Git

```bash
git status
git add index.html index.js promociones.html promociones.js styles.css supabase-api.js README_V6_6_PACKS_PORTADA_FILTROS.md
git commit -m "Ajusta portada y filtros de packs"
git push
```
