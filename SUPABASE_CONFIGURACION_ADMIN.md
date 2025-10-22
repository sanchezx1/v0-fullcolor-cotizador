# 🔧 CONFIGURACIÓN COMPLETA DE SUPABASE PARA ADMIN CRUD

## 📋 ÍNDICE
1. [Estado Actual](#estado-actual)
2. [Configuraciones Requeridas](#configuraciones-requeridas)
3. [Storage (Almacenamiento)](#1-storage-almacenamiento)
4. [Row Level Security (RLS)](#2-row-level-security-rls)
5. [Edge Functions](#3-edge-functions)
6. [Secrets](#4-secrets)
7. [Verificación Final](#verificación-final)

---

## ✅ ESTADO ACTUAL

### Migraciones Ejecutadas
- ✅ `002_admin_schema_REAL.sql` - Schema base + campos admin
- ✅ `003_admin_missing_fields.sql` - Campos faltantes (numero, descripcion)

### Tablas Creadas
- ✅ `productos` (con SKU, imagen_url, activo)
- ✅ `precios_escalonados` (precios por cantidad)
- ✅ `leads` (con ruc_cedula, ciudad, direccion)
- ✅ `cotizaciones` (con numero, subtotal, iva)
- ✅ `items_cotizacion` (items de cada cotización)
- ✅ `eventos` (con tipo, descripcion, metadata)

### Vistas Creadas
- ✅ `estadisticas_dashboard` (KPIs del dashboard)
- ✅ `productos_top_cotizados` (productos más cotizados)

### Funciones Creadas
- ✅ `generar_numero_cotizacion()` (genera FC-2025-001)
- ✅ `update_updated_at_column()` (actualiza timestamps)

---

## 🎯 CONFIGURACIONES REQUERIDAS

### ¿Qué falta configurar?

| Configuración | Estado | Urgencia | Descripción |
|--------------|--------|----------|-------------|
| Storage Bucket `productos` | ❌ Falta | 🔴 Alta | Para subir imágenes de productos |
| Storage Bucket `cotizaciones` | ❌ Falta | 🟡 Media | Para PDFs generados |
| RLS Policies | ⚠️ Parcial | 🟡 Media | Seguridad de acceso a datos |
| Edge Function `generate-pdf` | ✅ Existe | ✅ OK | Ya funciona |
| Edge Function `send-email` | ❌ Removido | ⚠️ N/A | Eliminado del proyecto |

---

## 1. STORAGE (ALMACENAMIENTO)

### 🎯 Bucket: `productos`
Para almacenar imágenes de productos.

#### Paso 1: Crear el bucket
```
1. Ve a: Supabase Dashboard → Storage
2. Click: "New bucket"
3. Configuración:
   - Name: productos
   - Public bucket: ✅ YES (las imágenes deben ser públicas)
   - File size limit: 5 MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
4. Click: "Create bucket"
```

#### Paso 2: Configurar políticas de acceso (RLS)

##### Política 1: Lectura pública (cualquiera puede ver imágenes)
```sql
-- Nombre: "Public read access for productos images"
-- Operación: SELECT
-- Bucket: productos

CREATE POLICY "Public read access for productos images"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');
```

##### Política 2: Upload solo para usuarios autenticados
```sql
-- Nombre: "Authenticated users can upload productos images"
-- Operación: INSERT
-- Bucket: productos

CREATE POLICY "Authenticated users can upload productos images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos');
```

##### Política 3: Actualizar imágenes (autenticados)
```sql
-- Nombre: "Authenticated users can update productos images"
-- Operación: UPDATE
-- Bucket: productos

CREATE POLICY "Authenticated users can update productos images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'productos')
WITH CHECK (bucket_id = 'productos');
```

##### Política 4: Eliminar imágenes (autenticados)
```sql
-- Nombre: "Authenticated users can delete productos images"
-- Operación: DELETE
-- Bucket: productos

CREATE POLICY "Authenticated users can delete productos images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'productos');
```

#### Paso 3: Ejecutar en SQL Editor
```bash
# Ve a: Supabase Dashboard → SQL Editor
# Copia el contenido del archivo:
database/setup_storage.sql

# O ejecuta este SQL directamente:
```

```sql
-- Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE name = 'productos';

-- Si NO existe, créalo desde el dashboard primero
-- Luego ejecuta las políticas de arriba
```

---

### 🎯 Bucket: `cotizaciones` (Opcional)
Para almacenar PDFs de cotizaciones.

#### Paso 1: Crear el bucket
```
1. Ve a: Supabase Dashboard → Storage
2. Click: "New bucket"
3. Configuración:
   - Name: cotizaciones
   - Public bucket: ✅ YES (los PDFs deben ser descargables)
   - File size limit: 10 MB
   - Allowed MIME types: application/pdf
4. Click: "Create bucket"
```

#### Paso 2: Configurar políticas de acceso

```sql
-- Lectura pública
CREATE POLICY "Public read access for cotizaciones PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cotizaciones');

-- Upload autenticado
CREATE POLICY "Authenticated users can upload cotizaciones PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cotizaciones');

-- Actualizar autenticado
CREATE POLICY "Authenticated users can update cotizaciones PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cotizaciones')
WITH CHECK (bucket_id = 'cotizaciones');

-- Eliminar autenticado
CREATE POLICY "Authenticated users can delete cotizaciones PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cotizaciones');
```

---

## 2. ROW LEVEL SECURITY (RLS)

### ⚠️ Estado actual de RLS

Por defecto, todas tus tablas tienen RLS **deshabilitado**, lo que significa:
- ✅ Cualquiera puede leer/escribir (útil para desarrollo)
- ❌ NO es seguro para producción

### 🔒 Opciones de seguridad

#### Opción A: Mantener RLS deshabilitado (SOLO DESARROLLO)
```
✅ Ventajas:
- No hay problemas de permisos
- Desarrollo más rápido
- No necesitas configurar auth

❌ Desventajas:
- INSEGURO para producción
- Cualquiera con las credenciales puede modificar todo
```

#### Opción B: Habilitar RLS (RECOMENDADO PARA PRODUCCIÓN)
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_escalonados ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Crear política "todo público" TEMPORAL (para desarrollo)
CREATE POLICY "Allow all operations" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON precios_escalonados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON cotizaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON items_cotizacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON eventos FOR ALL USING (true) WITH CHECK (true);
```

**Archivo completo:** `database/rls_policies.sql`

### 🎯 Políticas de seguridad recomendadas (cuando implementes auth)

```sql
-- Solo usuarios autenticados pueden acceder al admin
CREATE POLICY "Authenticated users full access to productos"
ON productos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- El frontend público solo puede leer productos activos
CREATE POLICY "Public can read active productos"
ON productos FOR SELECT
TO anon
USING (activo = true);

-- Similar para otras tablas...
```

**Estado recomendado:**
- **Desarrollo:** RLS deshabilitado o políticas permisivas
- **Producción:** RLS habilitado con políticas específicas

---

## 3. EDGE FUNCTIONS

### ✅ `generate-pdf` (Ya existe)

Esta función ya está implementada y funciona.

**Ubicación:** `supabase/functions/generate-pdf/index.ts`

**No necesitas configurar nada.**

---

### ❌ `send-email` (Eliminado del proyecto)

Esta función fue eliminada porque el proyecto decidió NO implementar envío de emails.

**Estado:** No requiere configuración.

---

### 🚀 Cómo verificar Edge Functions

```bash
# Listar funciones desplegadas
supabase functions list

# Invocar función manualmente (desde tu local)
supabase functions invoke generate-pdf \
  --method POST \
  --body '{"quoteId": 1}'
```

---

## 4. SECRETS (VARIABLES DE ENTORNO)

### 🔐 Configurar secretos en Supabase

Los Edge Functions necesitan acceso a credenciales. Debes configurarlas en Supabase Dashboard.

#### Paso 1: Ir a configuración de secretos
```
Supabase Dashboard → Settings → Edge Functions → Secrets
```

#### Paso 2: Agregar los siguientes secretos

| Secret Name | Valor | Uso |
|-------------|-------|-----|
| `SUPABASE_URL` | `https://cxhjxponouukrnuxdhyz.supabase.co` | URL de tu proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (tu service role key) | Autenticación en edge functions |

**NOTA:** SendGrid no se necesita porque eliminamos el feature de email.

#### Paso 3: Verificar secretos

```bash
# Listar secretos configurados (desde tu local)
supabase secrets list
```

---

## ✅ VERIFICACIÓN FINAL

### Script de verificación automática

He creado un script que verifica TODO automáticamente:

```bash
cd v0-fullcolor-cotizador-2
node scripts/verify-supabase-setup.js
```

Este script verifica:
- ✅ Tablas existen
- ✅ Columnas correctas
- ✅ Vistas funcionan
- ✅ Funciones disponibles
- ✅ Storage buckets existen
- ✅ Políticas de storage configuradas

---

## 📝 CHECKLIST DE CONFIGURACIÓN

Marca las configuraciones que completes:

### Migraciones de Base de Datos
- [✅] Ejecutar `002_admin_schema_REAL.sql`
- [✅] Ejecutar `003_admin_missing_fields.sql`
- [✅] Verificar tablas creadas
- [✅] Verificar vistas creadas
- [✅] Verificar funciones creadas

### Storage
- [ ] Crear bucket `productos`
- [ ] Configurar políticas de storage para `productos`
- [ ] *(Opcional)* Crear bucket `cotizaciones`
- [ ] *(Opcional)* Configurar políticas de storage para `cotizaciones`

### Row Level Security
- [ ] Decidir: RLS habilitado o deshabilitado
- [ ] Si habilitado: Ejecutar `rls_policies.sql`
- [ ] Verificar políticas funcionan

### Edge Functions
- [✅] `generate-pdf` ya desplegado
- [ ] Verificar que funciona (invocar manualmente)

### Secrets
- [ ] Configurar `SUPABASE_URL`
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verificar con `supabase secrets list`

### Verificación Final
- [ ] Ejecutar `node scripts/verify-supabase-setup.js`
- [ ] Todas las verificaciones pasan ✅
- [ ] Panel admin accesible en `/admin`

---

## 🚀 PRÓXIMOS PASOS

Una vez que completes estas configuraciones:

1. **Reinicia tu servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Prueba el panel admin**
   ```
   http://localhost:3000/admin
   ```

3. **Prueba cada módulo:**
   - Dashboard: Ver KPIs y gráfica
   - Productos: Crear, editar, subir imagen
   - Cotizaciones: Ver lista y detalle
   - Precios Escalonados: Configurar tramos

4. **Reporta cualquier error**
   - Si algo no funciona, revisa la consola del navegador
   - Verifica logs de Supabase Dashboard

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ "Failed to upload image"
**Causa:** Bucket `productos` no existe o no tiene políticas
**Solución:** Crear bucket y ejecutar políticas de storage

### ❌ "Error: relation does not exist"
**Causa:** Migraciones no ejecutadas o tabla faltante
**Solución:** Ejecutar migraciones en orden

### ❌ "Permission denied"
**Causa:** RLS habilitado sin políticas adecuadas
**Solución:** Deshabilitar RLS o agregar políticas permisivas

### ❌ "Edge function not found"
**Causa:** Función no desplegada
**Solución:** `supabase functions deploy generate-pdf`

---

## 📞 CONTACTO Y SOPORTE

Si necesitas ayuda:
1. Revisa los logs en Supabase Dashboard
2. Verifica la consola del navegador (F12)
3. Ejecuta el script de verificación
4. Reporta el error con el mensaje exacto

---

**Última actualización:** 2025-10-21  
**Versión del Admin Panel:** 0.6.0 (Productos 100%, Cotizaciones 60%)
