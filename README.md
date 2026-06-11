# Essential Decant V4 - App oficial liviana

Versión orientada a cliente local: no procesa pagos, no guarda datos sensibles y todo el cierre comercial ocurre por WhatsApp.

## Archivos principales

- `index.html`: landing pública.
- `catalogo.html`: catálogo público con carrito y pedido por WhatsApp.
- `admin.html`: administrador oculto.
- `styles.css`: estilos.
- `storage.js`: configuración, productos demo, localStorage y funciones comunes.
- `catalogo.js`: lógica del catálogo, filtros, carrito y WhatsApp.
- `admin.js`: login simple, crear, editar, eliminar, ordenar y destacar productos.
- `backup.js`: exportar e importar catálogo JSON.
- `/assets`: imágenes demo.

## Admin

Ruta manual:

```txt
admin.html
```

Clave inicial:

```txt
essential2026
```

Para cambiarla, editar en `storage.js`:

```js
const ADMIN_PASSWORD = "essential2026";
```

## WhatsApp

Número configurado en `storage.js`:

```js
const SELLER_PHONE = "56946317762";
```

Debe ir sin el signo `+`.

## Funciones del admin

- Agregar productos.
- Editar productos.
- Eliminar productos.
- Subir imagen.
- Comprimir imagen antes de guardar.
- Quitar imagen.
- Cambiar stock disponible/agostado.
- Marcar producto destacado.
- Ordenar productos con ↑ y ↓.
- Exportar catálogo a JSON.
- Importar catálogo desde JSON.
- Restaurar demo inicial.

## Importante sobre localStorage

Esta versión guarda el catálogo en el navegador del vendedor.  
Por eso es importante usar el botón **Exportar JSON** cada vez que se realicen cambios importantes.

Si se borra la caché, se cambia de navegador o se cambia de computador, el catálogo podría no aparecer hasta importar el respaldo.

## Cómo probar

1. Abrir `index.html`.
2. Entrar al catálogo desde “Ver catálogo”.
3. Abrir manualmente `admin.html`.
4. Ingresar con la clave `essential2026`.
5. Editar productos y exportar respaldo.

## Deploy recomendado

Funciona en:

- cPanel
- Netlify
- Vercel
- GitHub Pages

No requiere backend ni base de datos.


## Cambio V4.1

La landing principal ahora tiene acceso visible al administrador:

- Botón `Admin` en la navegación superior.
- Botón `Acceso administrador` en el bloque final de la landing.

El acceso sigue protegido con la clave configurada en `storage.js`.


## Cambio V4.2

Integración de marca real:

- Se agregó el logo real en la navegación.
- Se agregó logo real en pantalla de login/admin.
- Se agregó favicon.
- Se creó una versión `badge` premium del logo para fondos oscuros.
- Se agregó el logo como sello visual en la landing principal.
- El acceso Admin de V4.1 se mantiene visible y protegido por contraseña.


## Cambio V4.3

El administrador ahora permite gestionar clasificaciones dinámicas:

- Crear categorías nuevas.
- Renombrar categorías.
- Eliminar categorías que no estén en uso.
- Crear perfiles olfativos nuevos.
- Renombrar perfiles.
- Eliminar perfiles que no estén en uso.
- Ordenar categorías y perfiles.
- Los select del formulario de producto se alimentan desde esas listas.
- El catálogo público genera los filtros dinámicamente.
- El buscador también reconoce nombres de categoría y perfil.
- Exportar/importar JSON ahora respalda también categorías y perfiles.

Ejemplos útiles:

- Categorías: Árabe, Diseñador, Nicho, Mujer, Hombre, Unisex, Discovery Set.
- Perfiles: Fresco, Dulce, Cítrico, Intenso, Amaderado, Especiado, Acuático.


## Cambio V4.4

Corrección visual del módulo de categorías y perfiles:

- El bloque de taxonomías ya no hereda la grilla del panel de productos.
- Las tarjetas de categorías/perfiles se acomodan mejor en desktop y tablet.
- Cada fila ahora muestra el input en ancho completo.
- Los botones Guardar/Subir/Bajar/Eliminar quedan debajo del input para evitar que lo aplasten.
- Se agregaron ajustes responsive específicos para pantallas medianas y móviles.
