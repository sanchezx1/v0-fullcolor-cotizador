# Fix: TypeError Cannot read properties of undefined (reading 'toFixed')

## 🐛 Problema Detectado

Al visualizar el detalle de una cotización (`/admin/cotizaciones/[id]`), se producía el error:

```
TypeError: Cannot read properties of undefined (reading 'toFixed')
at eval (webpack-internal:///(app-pages-browser)/./app/admin/cotizaciones/[id]/page.tsx:772:98)
```

## 🔍 Causa Raíz

**Desajuste entre schema de base de datos y código TypeScript:**

### En la Base de Datos (schema.sql):
```sql
CREATE TABLE items_cotizacion (
    precio_unitario_aplicado NUMERIC(12,4) NOT NULL,
    subtotal NUMERIC(12,4) NOT NULL
    -- NO hay columna "iva"
    -- NO hay columna "precio_unitario"
);
```

### En el Código TypeScript:
```typescript
// admin-types.ts esperaba:
interface ItemCotizacion {
  precio_unitario: number  // ❌ No existe en BD
  iva: number              // ❌ No existe en BD
  subtotal: number         // ✅ Existe
}
```

El código intentaba acceder a `item.precio_unitario` e `item.iva` que eran `undefined`, causando el error al llamar `.toFixed()`.

## ✅ Solución Implementada

### 1. **Mapeo en el servicio** (`lib/admin-services.ts`)

Agregamos mapeo de campos al obtener cotización:

```typescript
export async function getCotizacion(id: number) {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`*, lead:leads(*), items:items_cotizacion(*, producto:productos(*))`)
    .eq('id', id)
    .single()

  // ✅ Mapear campos de BD a estructura esperada
  const mapped = {
    ...data,
    items: data.items?.map((item: any) => ({
      ...item,
      precio_unitario: item.precio_unitario_aplicado || 0, // Mapear nombre
      iva: (item.subtotal || 0) * 0.15 // Calcular dinámicamente
    })) || []
  }
  
  return mapped
}
```

### 2. **Protección en el frontend** (`app/admin/cotizaciones/[id]/page.tsx`)

Agregamos cálculos seguros y valores por defecto:

```typescript
{cotizacion.items.map((item) => {
  // Calcular valores seguros con fallbacks
  const precioUnitario = item.precio_unitario || 0
  const subtotal = item.subtotal || 0
  const ivaCalculado = subtotal * 0.15
  
  return (
    <TableRow key={item.id}>
      <TableCell>${precioUnitario.toFixed(2)}</TableCell>
      <TableCell>${subtotal.toFixed(2)}</TableCell>
      <TableCell>${ivaCalculado.toFixed(2)}</TableCell>
    </TableRow>
  )
})}
```

También protegimos los totales generales:
```typescript
<span>${(cotizacion.subtotal || 0).toFixed(2)}</span>
<span>${(cotizacion.iva || 0).toFixed(2)}</span>
<span>${(cotizacion.total || 0).toFixed(2)}</span>
```

### 3. **Inserción correcta en BD** (`lib/admin-services.ts`)

Corregimos las funciones de creación/actualización para usar nombres correctos:

```typescript
// Al crear items - ANTES (❌ incorrecto):
const items = cotizacion.items.map(item => ({
  precio_unitario: item.precio_unitario,  // ❌ Columna no existe
  iva: item.cantidad * item.precio_unitario * 0.15  // ❌ Columna no existe
}))

// Al crear items - DESPUÉS (✅ correcto):
const items = cotizacion.items.map(item => ({
  precio_unitario_aplicado: item.precio_unitario,  // ✅ Nombre correcto
  subtotal: item.cantidad * item.precio_unitario
  // No incluir iva - no existe en la tabla
}))
```

## 📁 Archivos Modificados

1. ✅ `lib/admin-services.ts` - Líneas 395-420, 458-465, 519-528
2. ✅ `app/admin/cotizaciones/[id]/page.tsx` - Líneas 340-378, 383-395
3. ✅ `app/admin/cotizaciones/page.tsx` - Línea 326

## 🧪 Validación

Para validar que el fix funciona:

1. Navegar a `/admin/cotizaciones`
2. Click en cualquier cotización existente
3. Verificar que se muestra correctamente:
   - Tabla de productos con precios
   - Subtotal, IVA y Total sin errores
   - No más errores de `.toFixed()` en consola

## 📝 Recomendaciones Futuras

### Opción A: Agregar columnas faltantes a la BD
```sql
ALTER TABLE items_cotizacion 
  ADD COLUMN iva NUMERIC(12,4) DEFAULT 0;
  
ALTER TABLE items_cotizacion 
  RENAME COLUMN precio_unitario_aplicado TO precio_unitario;
```

### Opción B: Mantener cálculo dinámico (actual)
- ✅ Menos redundancia de datos
- ✅ IVA siempre sincronizado con subtotal
- ⚠️ Requiere cálculo en cada lectura

## 🎯 Estado: RESUELTO ✅

El error ha sido corregido y ahora las cotizaciones se visualizan correctamente sin errores de `undefined`.
