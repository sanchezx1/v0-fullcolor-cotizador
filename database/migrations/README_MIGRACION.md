# 🎯 MIGRACIÓN ADMIN PANEL - VERSIÓN FINAL

## ✅ Script Basado en TU Esquema Real

He analizado tu `schema.sql` y creado un script que coincide **exactamente** con tu base de datos:

### 📋 Nombres de Tablas Reales
```
✅ productos (no "productos")
✅ leads (no "leads")  
✅ cotizaciones (no "cotizaciones")
✅ items_cotizacion (no "items_cotizacion")
✅ eventos (no "eventos")
✅ precios_escalonados (no "precios_escalonados")
```

### 📋 Campos Que Existen en TU BD
```sql
-- eventos usa "tipo" (no "tipo_evento")
CHECK (tipo IN ('pdf_generado', 'email_enviado', ...))

-- items_cotizacion usa "precio_unitario_aplicado"
precio_unitario_aplicado NUMERIC(12,4) NOT NULL

-- cotizaciones tiene estos estados
CHECK (estado IN ('pendiente', 'enviada', 'aprobada', 'rechazada'))
```

## 🚀 EJECUTAR SCRIPT CORREGIDO

### Archivo a usar:
```
database/migrations/002_admin_schema_REAL.sql
```

### Pasos:
1. **Abre Supabase Dashboard** → SQL Editor
2. **Copia el contenido completo** de `002_admin_schema_REAL.sql`
3. **Pega y ejecuta**
4. **Verifica mensajes** (debe mostrar checkmarks ✓)

## 📊 ¿Qué hace este script?

### PASO 1: Limpia duplicados
- Busca emails duplicados en `leads`
- Elimina los más antiguos
- Mantiene el más reciente

### PASO 2: Productos
- ✅ Agrega columna `sku` VARCHAR(50)
- ✅ Genera SKUs automáticos: `PROD-0001`, `PROD-0002`, etc.
- ✅ Crea índice único: `idx_productos_sku`

### PASO 3: Leads
- ✅ Agrega `ruc_cedula` VARCHAR(13)
- ✅ Agrega `ciudad` VARCHAR(100)
- ✅ Agrega `direccion` TEXT
- ✅ Crea índice único en `email`

### PASO 4: Cotizaciones
- ✅ Agrega `subtotal` NUMERIC(12,4)
- ✅ Agrega `iva` NUMERIC(12,4)
- ✅ Agrega `numero` VARCHAR(50) - Ej: FC-2025-001
- ✅ Calcula subtotal/IVA de cotizaciones existentes

### PASO 5: Estados de Cotizaciones
- ✅ Actualiza constraint para incluir `'borrador'`
- ✅ Mantiene: pendiente, enviada, aprobada, rechazada

### PASO 6: Eventos
- ✅ Agrega tipos nuevos al constraint de `tipo`:
  - cotizacion_editada
  - estado_cambiado
  - producto_creado/editado/eliminado
  - lead_creado/editado
- ✅ Agrega columna `descripcion` TEXT

### PASO 7 y 8: Vistas
- ✅ `estadisticas_dashboard` - KPIs del admin
- ✅ `productos_top_cotizados` - Top 10 productos

### PASO 9: Función
- ✅ `generar_numero_cotizacion()` - Genera FC-2025-001, FC-2025-002, etc.

### PASO 10: Verificación
- ✅ Confirma que todos los productos tengan SKU
- ✅ Confirma que no haya emails duplicados
- ✅ Muestra resumen de éxito

## 🎯 Salida Esperada

Deberías ver algo así:

```
NOTICE: No se encontraron emails duplicados
NOTICE: Columna SKU agregada a productos
NOTICE: Índice único idx_productos_sku creado
NOTICE: Columna ruc_cedula agregada a leads
NOTICE: Columna ciudad agregada a leads
NOTICE: Columna direccion agregada a leads
NOTICE: Índice único idx_leads_email_unique creado
NOTICE: Columna subtotal agregada a cotizaciones
NOTICE: Columna iva agregada a cotizaciones
NOTICE: Constraint de estado actualizado
NOTICE: Constraint de tipo en eventos actualizado
NOTICE: ✓ Todos los productos tienen SKU
NOTICE: ✓ No hay emails duplicados en leads
NOTICE: 
NOTICE: ============================================
NOTICE: ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
NOTICE: ============================================
```

## ⚠️ Si hay errores

### "column already exists"
→ Normal, el script verifica antes de crear. Ignóralo.

### "constraint does not exist"
→ Normal, el script hace `IF EXISTS`. Ignóralo.

### "duplicate key value violates unique constraint"
→ Aún tienes emails duplicados. Ejecuta esto primero:

```sql
-- Ver qué emails están duplicados
SELECT email, COUNT(*) 
FROM leads 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Eliminar duplicados manualmente
WITH duplicados AS (
  SELECT id, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL
)
DELETE FROM leads
WHERE id IN (SELECT id FROM duplicados WHERE rn > 1);
```

## 🔍 Verificar que funcionó

### Verificar columnas nuevas:
```sql
-- Ver estructura de productos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- Ver estructura de leads
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- Ver estructura de cotizaciones
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;
```

### Verificar vistas:
```sql
-- Probar vista de dashboard
SELECT * FROM estadisticas_dashboard;

-- Probar vista de top productos
SELECT * FROM productos_top_cotizados;
```

### Verificar función:
```sql
-- Generar un número de cotización de prueba
SELECT generar_numero_cotizacion();
-- Debería devolver algo como: FC-2025-001
```

## ✅ Después de ejecutar exitosamente

1. **Navega a** `http://localhost:3000/admin`
2. **Verifica** que el dashboard cargue
3. **Revisa** los KPIs (deben mostrar datos reales)
4. **Confirma** que no hay errores en consola

---

## 🚀 ¿TODO OK?

Si la migración fue exitosa, responde **"OK"** y continúo con el **CRUD de Productos** 🎯

Si hubo algún error, copia el mensaje completo y lo resuelvo de inmediato.
