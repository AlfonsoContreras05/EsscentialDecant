# Essential Decant V5.1 — Supabase + Netlify

Esta versión deja el catálogo centralizado:

- Netlify publica la web.
- Supabase guarda productos, categorías, perfiles, portada e imágenes.
- El admin inicia sesión con Supabase Auth.
- Los productos pueden tener hasta 3 imágenes.
- La portada de la landing se elige desde el admin.
- El logo fue quitado de la tarjeta visual principal de la landing.
- El pedido se envía por WhatsApp al número oficial: +56 9 3459 9409.

---

## 1. Crear proyecto en Supabase

1. Entra a Supabase.
2. Crea un proyecto nuevo.
3. Nombre sugerido: `essential-decant`.
4. Espera a que el proyecto esté listo.

---

## 2. Crear usuario administrador

1. En Supabase entra a **Authentication**.
2. Entra a **Users**.
3. Crea un usuario nuevo.
4. Usa el correo real del administrador, por ejemplo:

```txt
essentialdecant@gmail.com
```

5. Define una contraseña segura.

Ese correo y contraseña serán los datos para entrar a:

```txt
admin.html
```

---

## 3. Editar el SQL antes de ejecutarlo

Abre:

```txt
supabase/schema.sql
```

Busca todas las apariciones de:

```txt
admin@essentialdecant.cl
```

Reemplázalas por el correo real del admin creado en Supabase.

Ejemplo:

```txt
essentialdecant@gmail.com
```

Este paso es clave: las políticas de seguridad solo permiten editar al correo indicado.

---

## 4. Ejecutar SQL en Supabase

1. En Supabase entra a **SQL Editor**.
2. Crea una nueva query.
3. Copia todo el contenido de:

```txt
supabase/schema.sql
```

4. Pégalo en SQL Editor.
5. Ejecuta.

Esto crea:

- `categories`
- `profiles`
- `products`
- `site_settings`
- bucket `product-images`
- políticas RLS
- políticas de Storage
- productos demo iniciales

---

## 5. Copiar datos de API

En Supabase:

```txt
Project Settings → API
```

Copia:

```txt
Project URL
```

y:

```txt
anon public key
```

---

## 6. Configurar la web

Abre:

```txt
supabase-config.js
```

Reemplaza:

```js
const SUPABASE_URL = "PEGA_AQUI_TU_SUPABASE_URL";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_SUPABASE_ANON_KEY";
```

por tus valores reales.

Ejemplo:

```js
const SUPABASE_URL = "https://xxxxxxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIs...";
```

Importante:

```txt
NO uses service_role key en frontend.
```

---

## 7. WhatsApp oficial

El número oficial ya quedó configurado en:

```txt
supabase-config.js
```

Así:

```js
const SELLER_PHONE = "56934599409";
```

Corresponde a:

```txt
+56 9 3459 9409
```

---

## 8. Probar localmente

Abre:

```txt
index.html
catalogo.html
admin.html
```

En `admin.html` inicia sesión con:

```txt
correo admin creado en Supabase
contraseña creada en Supabase
```

Prueba:

- Crear categoría.
- Crear perfil.
- Crear producto.
- Subir imagen 1.
- Subir imagen 2.
- Subir imagen 3.
- Guardar portada landing.
- Ver catálogo público.
- Agregar al carrito.
- Enviar WhatsApp.

---

## 9. Subir a GitHub

En la carpeta del proyecto:

```bash
git status
git add .
git commit -m "Actualiza Essential Decant V5.1 con Supabase"
git push
```

Netlify debería desplegar automáticamente.

---

## 10. Configuración Netlify

Como la web sigue siendo HTML/CSS/JS puro:

```txt
Build command: vacío
Publish directory: .
```

---

## 11. Qué hacer si el catálogo no carga

Revisa:

1. Que `supabase-config.js` tenga URL y anon key reales.
2. Que ejecutaste `schema.sql`.
3. Que las tablas tienen datos.
4. Que no pegaste `service_role key`.
5. Que el navegador no muestra errores de credenciales en consola.

---

## 12. Qué hacer si el admin entra pero no puede guardar

Casi siempre es porque:

1. El correo del usuario no coincide con el correo que pusiste en `schema.sql`.
2. No reemplazaste todas las apariciones de `admin@essentialdecant.cl`.
3. Ejecutaste el SQL antes de cambiar el correo.
4. Estás entrando con otro usuario.

Solución:

- Revisa el correo del usuario en Supabase Auth.
- Reemplaza el correo en `schema.sql`.
- Ejecuta nuevamente el SQL completo.

---

## 13. Qué hacer si las imágenes no suben

Revisa:

1. Que exista el bucket `product-images`.
2. Que el bucket esté público.
3. Que las políticas de Storage estén creadas.
4. Que el correo admin coincida con las políticas.
5. Que la imagen pese menos de 5MB antes de comprimirse.

---

## 14. Flujo final del cliente

```txt
Admin entra a admin.html
↓
Inicia sesión
↓
Agrega producto con hasta 3 imágenes
↓
Elige imagen de portada
↓
Guarda
↓
Todos los visitantes ven los cambios
```
