# Refactorización: Supabase como Única Fuente de Verdad

## Resumen de Cambios

Este refactor elimina todas las inconsistencias de datos hardcodeados y establece Supabase como la única fuente de verdad para productos y precios.

## Arquitectura de Datos

### Capa de Acceso a Datos
**Archivo:** `src/lib/data.ts`

Esta es la **única capa** para acceder a productos y precios desde Supabase.

#### Funciones Principales:
- `listProducts()` - Obtiene todos los productos activos
- `getProductWithTiers(id)` - Obtiene un producto con sus escalas de precio
- `searchProducts(term)` - Busca productos por término
- `getProductsByCategory(category)` - Filtra por categoría
- `calculatePriceForProduct(productId, quantity)` - Calcula precio para un producto

#### Cache:
- Cache en memoria con duración de 5 minutos
- Revalidación manual mediante `revalidateCache()`
- Sin realtime - solo cache + revalidación manual

### Función Única de Cálculo de Precio
**Función:** `priceForQuantity(tiers, quantity)`

Esta función es **reutilizada** en:
- UI de productos (`app/producto/[id]/page.tsx`)
- Generador de PDF (cuando se implemente)
- Cualquier cálculo de precios

#### Regla de Negocio:
```
escala = max( escalas where cantidad_min <= cantidad )
if escala existe:
  precio = escala.precio_unitario
  subtotal = cantidad * precio
else:
  precio = null
  subtotal = 0
  avisar: "por debajo del mínimo"
```

## Revalidación Manual

### Endpoint de Revalidación
**Archivo:** `app/api/revalidate/route.ts`

- **POST** `/api/revalidate` con Authorization header
- **GET** `/api/revalidate?secret=xxx` para testing
- Protegido con `REVALIDATE_SECRET`

### Panel de Admin
**Archivo:** `app/admin/page.tsx`

- Botón "Publicar Cambios" que llama al endpoint
- Estado visual de la última actualización
- Información del sistema y cache

### Componente de Revalidación
**Archivo:** `components/admin/revalidate-button.tsx`

- Botón reutilizable para revalidar cache
- Estados de loading, éxito y error
- Timestamp de última actualización

## Archivos Eliminados

### Datos Hardcodeados:
- ❌ `lib/mock-data.ts` - Productos mock
- ❌ `src/hooks/useProducts.ts` - Hook duplicado
- ❌ `src/services/pricing.ts` - Servicio duplicado

### Datos Hardcodeados en Componentes:
- ❌ `app/producto/[id]/page.tsx` - Array `productsData`
- ❌ `app/catalogo/page.tsx` - Array `allProducts`
- ❌ `app/page.tsx` - Array `featuredProducts`
- ❌ `components/featured-cards.tsx` - Array `featuredProducts`

## Archivos Refactorizados

### UI Components:
- ✅ `app/producto/[id]/page.tsx` - Ahora usa `getProductWithTiers()`
- ✅ `app/catalogo/page.tsx` - Ahora usa `listProducts()`
- ✅ `app/page.tsx` - Ahora usa `listProducts()`
- ✅ `components/featured-cards.tsx` - Ahora usa `listProducts()`

### Tipos:
- ✅ `lib/types.ts` - Limpiado, tipos principales en `src/lib/data.ts`

## Configuración

### Variables de Entorno Requeridas:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui

# Revalidación (opcional, default: 'dev-secret')
REVALIDATE_SECRET=tu_secret_aqui
NEXT_PUBLIC_REVALIDATE_SECRET=tu_secret_aqui
```

## Testing Manual

### Validación de Precios:
Para probar que los precios funcionan correctamente:

1. Ir a `/producto/1` (Tarjetas de Presentación)
2. Probar cantidades:
   - **100** → $0.25/unidad
   - **500** → $0.18/unidad  
   - **1000** → $0.12/unidad
   - **2500** → $0.08/unidad

### Revalidación:
1. Ir a `/admin`
2. Hacer cambios en Supabase
3. Hacer clic en "Publicar Cambios"
4. Verificar que los cambios se reflejan

## Beneficios del Refactor

### ✅ Consistencia:
- Una sola fuente de verdad (Supabase)
- Misma función de cálculo en UI y PDF
- Sin duplicación de datos

### ✅ Mantenibilidad:
- Cambios de precios solo en Supabase
- Revalidación manual controlada
- Código más limpio y organizado

### ✅ Escalabilidad:
- Cache eficiente sin realtime
- Fácil agregar nuevos productos
- Panel de admin integrado

## Próximos Pasos

1. **Implementar generador PDF** usando `priceForQuantity()`
2. **Agregar tests unitarios** para la función de cálculo
3. **Implementar panel de admin completo** para CRUD de productos
4. **Optimizar cache** con estrategias más avanzadas si es necesario
