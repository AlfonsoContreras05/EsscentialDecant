# Essential Decant V6.7 — Packs con imagen y formatos propios

Cambios incluidos:

- Los 4 cuadros de packs de portada ahora cargan packs reales con imagen propia.
- Se elimina visualmente la sección 3ml / 5ml / 10ml de portada para ganar espacio.
- Se elimina el filtro global de packs por ml.
- Cada pack ahora puede tener precio propio para 3ml, 5ml y 10ml.
- En promociones y en la ficha del pack aparece selector 3ml / 5ml / 10ml.
- Al agregar pack al carrito se guarda el formato elegido.
- En el admin, el pack se edita con tres precios: 3ml, 5ml y 10ml.

## Supabase

Ejecutar una vez:

```sql
supabase/migration_v6_7_pack_formatos.sql
```

## Subir cambios

```bash
git status
git add .
git commit -m "Ajusta packs con imagen y formatos propios"
git push
```
