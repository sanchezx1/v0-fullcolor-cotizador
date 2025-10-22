# Fix: Ingresos Estimados - Suma Incorrecta

## 🐛 Problema Reportado

Usuario aprobó **1 sola cotización** pero el dashboard muestra **$994.00** en "Ingresos Estimados".

## 🔍 Análisis del Problema

### Ubicación del Error

**Archivo:** `database/migrations/002_admin_schema_REAL.sql` (líneas 172-177)

```sql
-- ❌ LÓGICA INCORRECTA
COALESCE((
  SELECT SUM(total) 
  FROM cotizaciones 
  WHERE estado IN ('aprobada', 'enviada')  -- ❌ Suma AMBOS estados
), 0) as ingresos_estimados
```

### Por qué está mal

La vista `estadisticas_dashboard` suma el total de cotizaciones con estado:
- ✅ `'aprobada'` - Venta confirmada por el cliente
- ❌ `'enviada'` - Solo enviada, **NO confirmada aún**

**Resultado:** El KPI "Ingresos Estimados" incluye cotizaciones que **NO son ventas reales**.

### Flujo de Estados de Cotización

```
borrador → enviada → aprobada ✅ (VENTA CONFIRMADA)
                  ↘ rechazada ❌ (NO es venta)
```

Solo las cotizaciones en estado `'aprobada'` representan **ingresos reales**.

## 📊 Ejemplo del Error

Si tienes:
- 1 cotización **aprobada** de $100
- 5 cotizaciones **enviadas** de $200 cada una

**Comportamiento actual (incorrecto):**
```
Ingresos = $100 + ($200 × 5) = $1,100
```

**Comportamiento correcto:**
```
Ingresos = $100 (solo aprobadas)
```

## ✅ Solución Implementada

### Migración SQL Creada

**Archivo:** `database/migrations/004_fix_ingresos_estimados.sql`

```sql
-- ✅ LÓGICA CORREGIDA
COALESCE((
  SELECT SUM(total) 
  FROM cotizaciones 
  WHERE estado = 'aprobada'  -- ✅ SOLO aprobadas
), 0) as ingresos_estimados
```

### Cambios Realizados

1. **Modificada vista `estadisticas_dashboard`**
   - Cambió filtro de `IN ('aprobada', 'enviada')` a `= 'aprobada'`
   - Ahora solo suma cotizaciones con ventas confirmadas

2. **Agregada columna `cotizaciones_borrador`**
   - Faltaba en la vista original
   - Ahora se puede ver cuántas están en borrador

## 🚀 Cómo Aplicar el Fix

### Opción A: Desde Supabase Dashboard (Recomendado)

1. Abrir **Supabase Dashboard** → Tu proyecto
2. Ir a **SQL Editor**
3. Copiar contenido de `database/migrations/004_fix_ingresos_estimados.sql`
4. Pegar y ejecutar
5. Verificar mensaje de confirmación en logs

### Opción B: Desde la Aplicación

Si tienes acceso a terminal con permisos:

```bash
cd v0-fullcolor-cotizador-2
psql $DATABASE_URL -f database/migrations/004_fix_ingresos_estimados.sql
```

## 🧪 Validación

Después de aplicar el fix:

1. Recargar página del dashboard (`/admin`)
2. Verificar que "Ingresos Estimados" muestre:
   - **Solo** el total de cotizaciones aprobadas
   - **NO** incluya cotizaciones enviadas

### Cálculo Manual

Para verificar manualmente:

```sql
-- Ver todas las cotizaciones aprobadas
SELECT numero, estado, total, created_at 
FROM cotizaciones 
WHERE estado = 'aprobada'
ORDER BY created_at DESC;

-- Ver total de ingresos (debe coincidir con dashboard)
SELECT 
  COUNT(*) as cotizaciones_aprobadas,
  COALESCE(SUM(total), 0) as ingresos_estimados
FROM cotizaciones 
WHERE estado = 'aprobada';
```

## 📝 Semántica de "Ingresos Estimados"

### Antes del Fix (Incorrecto)
- **Definición:** Suma de cotizaciones aprobadas + enviadas
- **Problema:** Incluye cotizaciones sin confirmación del cliente
- **Riesgo:** Proyección inflada, expectativas incorrectas

### Después del Fix (Correcto)
- **Definición:** Suma de cotizaciones aprobadas únicamente
- **Ventaja:** Refleja ventas reales confirmadas por clientes
- **Claridad:** "Ingresos estimados" = ventas cerradas pendientes de facturar

## 💡 Consideraciones Adicionales

### Si necesitas ver ingresos "potenciales"

Podrías agregar un **nuevo KPI separado**:

```typescript
{
  title: 'Pipeline de Ventas',
  value: '$X.XX',
  description: 'Cotizaciones enviadas (no confirmadas)',
  // Solo incluir estado 'enviada'
}
```

De esta forma tendrías:
1. **Ingresos Estimados** → Solo aprobadas (ventas confirmadas)
2. **Pipeline de Ventas** → Enviadas (oportunidades pendientes)

### Alternativa: Cambiar el nombre del KPI

Si prefieres mantener la lógica actual que suma ambos estados:

```typescript
{
  title: 'Ingresos + Pipeline', // Nombre más claro
  description: 'Aprobadas + Enviadas',
  // Mantener filtro IN ('aprobada', 'enviada')
}
```

## 🎯 Estado: FIX LISTO PARA APLICAR ✅

El archivo de migración está creado en:
```
database/migrations/004_fix_ingresos_estimados.sql
```

**Próximo paso:** Ejecutar la migración en Supabase.

## 📚 Archivos Relacionados

- ❌ Lógica incorrecta: `database/migrations/002_admin_schema_REAL.sql` (línea 176)
- ✅ Fix: `database/migrations/004_fix_ingresos_estimados.sql`
- 📊 Dashboard component: `components/admin/DashboardKPIs.tsx`
- 🔧 Service: `src/services/admin/dashboardService.ts`
