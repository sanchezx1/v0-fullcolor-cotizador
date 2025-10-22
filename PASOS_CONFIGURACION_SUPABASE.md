# ✅ PASOS PARA CONFIGURAR SUPABASE (Admin Panel)

## 🎯 Objetivo
Configurar Storage en Supabase para que el Admin Panel pueda subir imágenes de productos.

---

## 📋 PASO 1: Crear Bucket "productos" (5 minutos)

### Instrucciones:

1. **Abre tu navegador** y ve a:
   ```
   https://supabase.com/dashboard/project/cxhjxponouukrnuxdhyz/storage/buckets
   ```

2. **Click en el botón verde** "New bucket" (esquina superior derecha)

3. **Llena el formulario:**
   ```
   Name: productos
   Public bucket: ✅ ACTIVAR (toggle en YES)
   File size limit: 5242880 (5MB)
   Allowed MIME types: image/jpeg,image/png,image/webp
   ```

4. **Click en "Create bucket"**

5. **Verifica:** Debes ver el bucket "productos" en la lista

---

## 📋 PASO 2: Configurar Políticas de Storage (2 minutos)

### Instrucciones:

1. **Ve al SQL Editor:**
   ```
   Dashboard → SQL Editor → New query
   ```

2. **Abre el archivo** en tu proyecto:
   ```
   database/setup_storage_admin.sql
   ```

3. **Copia TODO el contenido** del archivo

4. **Pega en el SQL Editor** de Supabase

5. **Click en "Run"** (botón esquina inferior derecha)

6. **Verifica el output:**
   ```
   ✅ STORAGE CONFIGURADO EXITOSAMENTE
   📦 Buckets configurados: productos, cotizaciones
   🔒 Políticas aplicadas
   ```

---

## 📋 PASO 3: Verificar Configuración (1 minuto)

### Opción A: Desde tu terminal

```bash
cd C:\Users\USUARIO\v0-fullcolor-cotizador-2
node scripts/verify-supabase-setup.js
```

**Resultado esperado:**
```
🎉 ¡PERFECTO! Todas las configuraciones están en su lugar.
✅ Tablas: OK
✅ Columnas: OK
✅ Vistas: OK
✅ Funciones: OK
✅ Storage: Verificado
```

### Opción B: Desde Supabase Dashboard

1. Ve a: **Storage → Buckets**
2. Verifica que existe: **productos** (con ícono de ojo = público)
3. Click en **productos** → Policies
4. Verifica que haya **4 políticas** (read, insert, update, delete)

---

## 📋 PASO 4: Probar el Admin Panel (2 minutos)

### Instrucciones:

1. **Inicia el servidor de desarrollo:**
   ```bash
   cd C:\Users\USUARIO\v0-fullcolor-cotizador-2
   npm run dev
   ```

2. **Abre el navegador:**
   ```
   http://localhost:3000/admin
   ```

3. **Navega a Productos:**
   ```
   Sidebar → Productos → Nuevo Producto
   ```

4. **Prueba subir una imagen:**
   - Arrastra una imagen al área de upload
   - O click para seleccionar archivo
   - Verifica que aparece la preview
   - Click "Guardar Producto"

5. **Verifica que funciona:**
   - La imagen se sube sin errores
   - Aparece en la lista de productos
   - La miniatura se ve correctamente

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada paso cuando lo completes:

- [ ] Bucket "productos" creado en Supabase
- [ ] SQL de políticas ejecutado sin errores
- [ ] Script de verificación pasó todas las pruebas
- [ ] Admin panel accesible en /admin
- [ ] Subir imagen de producto funciona
- [ ] Imagen se muestra en lista de productos

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Bucket productos not found"

**Causa:** No creaste el bucket o lo nombraste diferente

**Solución:**
1. Ve a Storage → Buckets
2. Verifica que existe "productos" (exactamente ese nombre)
3. Si no existe, créalo según Paso 1

---

### ❌ Error: "Policy violation" al subir imagen

**Causa:** Faltan políticas de storage

**Solución:**
1. Ejecuta `database/setup_storage_admin.sql` en SQL Editor
2. Verifica que las 4 políticas se crearon
3. Storage → Buckets → productos → Policies → Debes ver 4 políticas

---

### ❌ Error: "Script verification failed"

**Causa:** Migraciones no ejecutadas o campos faltantes

**Solución:**
1. Ve a SQL Editor
2. Ejecuta `database/migrations/002_admin_schema_REAL.sql`
3. Ejecuta `database/migrations/003_admin_missing_fields.sql`
4. Vuelve a ejecutar el script de verificación

---

### ❌ Error: "Cannot find module @supabase/supabase-js"

**Causa:** Dependencias no instaladas

**Solución:**
```bash
cd C:\Users\USUARIO\v0-fullcolor-cotizador-2
npm install
```

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona:

1. **Revisa los logs:**
   - Consola del navegador (F12)
   - Terminal donde corre `npm run dev`
   - Supabase Dashboard → Logs

2. **Copia el error exacto** y búscalo en los documentos

3. **Ejecuta el diagnóstico:**
   ```bash
   node scripts/verify-supabase-setup.js
   ```

4. **Reporta el problema** con:
   - El error exacto
   - El paso donde ocurrió
   - El output del script de verificación

---

## 🎉 CUANDO TODO FUNCIONE

¡Felicidades! Ya tienes:

- ✅ Base de datos completa
- ✅ Storage configurado
- ✅ Admin Panel funcional
- ✅ Subida de imágenes funcionando

**Próximos pasos:**
- Continuar implementando módulos faltantes
- Agregar autenticación (opcional)
- Configurar RLS para producción

---

**Última actualización:** 2025-10-21  
**Tiempo estimado total:** 10 minutos
