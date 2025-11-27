# PLAN DE MEJORAS - Cotizador FullColor

> **Documento generado:** 26 de noviembre de 2025  
> **Versión del análisis:** 1.0  
> **Rama analizada:** `feature/leads-and-accounts`

---

## 📌 INSTRUCCIONES PARA AGENTES DE IMPLEMENTACIÓN

**IMPORTANTE:** Si eres un agente trabajando en la implementación de este plan, DEBES seguir estas reglas:

### Reglas de Documentación Obligatorias

1. **Marcar tareas completadas:**
   - Cada vez que completes una tarea, actualiza su estado en este documento
   - Cambia el estado de `[ ]` a `[✓]` con la fecha de completación
   - Ejemplo: `[✓] 2025-11-27 - Tarea 1.1: Habilitar Protección de Contraseñas Filtradas`

2. **Documentar progreso y novedades:**
   - Al finalizar cualquier tarea (completada o parcial), AGREGA una nota al final de esa sección
   - Las notas deben incluir:
     * **Fecha y hora** de la implementación
     * **Resultado:** Completado / Parcial / Bloqueado
     * **Cambios realizados:** Archivos modificados, comandos ejecutados, decisiones tomadas
     * **Novedades/Problemas:** Cualquier hallazgo inesperado, error encontrado, o decisión que difiera del plan
     * **Próximos pasos:** Si la tarea queda incompleta, qué falta por hacer
   - Formato de nota:
   ```markdown
   **[NOTA DE PROGRESO - 2025-11-27 14:30]**
   - Resultado: Completado ✓
   - Cambios: Creada migración `20251127_add_email_logs_index.sql`, aplicada en Supabase
   - Novedades: El índice mejoró performance de consultas en ~40%
   - Verificación: Advisor de Supabase ya no muestra el warning
   ```

3. **Priorizar información crítica:**
   - Documenta SIEMPRE:
     * Cambios en base de datos (migraciones, policies, índices)
     * Modificaciones de seguridad (CORS, auth, validación)
     * Problemas encontrados que bloqueen otras tareas
     * Decisiones que difieren del plan original (con justificación)
   - Es opcional documentar:
     * Cambios triviales de formato o estilo
     * Correcciones de typos sin impacto funcional

4. **Mantener continuidad entre agentes:**
   - Antes de empezar, LEE todas las notas de progreso existentes
   - Si una tarea está marcada como "Parcial" o "Bloqueada", lee la nota para entender el contexto
   - No repitas trabajo ya hecho - verifica el estado actual antes de implementar

5. **Actualizar el índice de progreso:**
   - Mantén actualizada la sección "Estado de Implementación" (ver abajo)
   - Marca cada fase como: No iniciada / En progreso / Completada
   - Actualiza el porcentaje de completación general

### Estado de Implementación

| Fase | Estado | Progreso | Última actualización |
|------|--------|----------|---------------------|
| Fase 1 - CRÍTICO | ⏳ No iniciada | 0/3 tareas | - |
| Fase 2 - ALTA PRIORIDAD | ⏳ No iniciada | 0/4 tareas | - |
| Fase 3 - MEJORAS | ⏳ No iniciada | 0/5 tareas | - |

**Progreso General:** 0% (0/12 tareas completadas)

---

## Resumen Ejecutivo

El proyecto **Cotizador FullColor** presenta una arquitectura sólida basada en Next.js 15 con App Router, React 19, TypeScript y Supabase como backend. El código sigue en gran medida los principios definidos en `AGENTS.md` y `CLAUDE.md`, con una separación de responsabilidades razonablemente clara entre servicios, componentes y rutas.

**Fortalezas principales:**
- Buena configuración de seguridad HTTP (CSP, HSTS, X-Frame-Options) en `next.config.mjs`
- Sistema de rate limiting implementado en el middleware
- Edge Functions con validación de acceso privilegiado centralizada (`_shared/security.ts`)
- Uso consistente de shadcn/ui para componentes de UI
- Implementación de tokens de acceso para cotizaciones públicas

**Áreas de mejora críticas:**
- Las políticas RLS de Supabase necesitan optimización (múltiples políticas permisivas redundantes detectadas por el linter)
- Las funciones `auth.<function>()` en RLS se re-evalúan por cada fila (problema de performance)
- Uso excesivo de `any` en TypeScript que debilita el tipado estricto
- Falta de validación de esquemas (Zod) en algunos endpoints y servicios
- La protección contra contraseñas filtradas está deshabilitada en Supabase Auth

El proyecto está en buen estado para producción con ajustes prioritarios en las políticas RLS y la habilitación de protección de contraseñas. Las demás mejoras son optimizaciones que incrementarán la calidad y mantenibilidad del código.

---

## 🚨 CRÍTICO - Requiere Atención Inmediata

### SEC-001: Protección de Contraseñas Filtradas Deshabilitada
- **Ubicación:** Configuración de Supabase Auth
- **Descripción:** La protección contra contraseñas filtradas (HaveIBeenPwned) está deshabilitada
- **Riesgo:** Los usuarios pueden registrarse con contraseñas comprometidas conocidas
- **Remediación:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### SEC-002: Foreign Key sin Índice en `email_logs`
- **Ubicación:** Tabla `public.email_logs` - FK `email_logs_quote_id_fkey`
- **Descripción:** La clave foránea no tiene índice de cobertura
- **Riesgo:** Performance degradada en consultas que usen esta relación
- **Remediación:** Crear migración para añadir índice:
```sql
CREATE INDEX idx_email_logs_quote_id ON public.email_logs(quote_id);
```

### PERF-001: RLS Policies Re-evalúan `auth.<function>()` Por Cada Fila
- **Ubicación:** Tablas `leads`, `cotizaciones`, `items_cotizacion`, `email_logs`
- **Policies afectadas:**
  - `Users insert leads`
  - `Users read own leads`
  - `Users update own leads`
  - `Users insert cotizaciones`
  - `Users read own cotizaciones`
  - `Users insert items_cotizacion`
  - `Users read own items_cotizacion`
  - `Admins manage email_logs`
- **Riesgo:** Performance subóptima a escala, cada fila provoca una nueva evaluación de `auth.uid()`
- **Remediación:** Envolver llamadas a auth con `(select auth.uid())`:
```sql
-- En lugar de:
auth.uid() = user_id
-- Usar:
(select auth.uid()) = user_id
```

---

## ⚠️ IMPORTANTE - Prioridad Alta

### PERF-002: Múltiples Políticas Permisivas Redundantes
- **Ubicación:** Múltiples tablas en Supabase
- **Tablas afectadas:**
  - `cotizaciones` (INSERT, SELECT para `authenticated`)
  - `items_cotizacion` (INSERT, SELECT para `authenticated`)
  - `lead_actividades` (INSERT para `authenticated`)
  - `leads` (INSERT, SELECT, UPDATE para `authenticated`)
  - `precios_escalonados` (múltiples roles y acciones)
  - `productos` (múltiples roles y acciones)
  - `profiles` (SELECT, UPDATE para `authenticated`)
- **Riesgo:** Cada política permisiva se ejecuta secuencialmente, degradando performance
- **Remediación:** Consolidar políticas por rol/acción usando lógica OR dentro de una sola política

### SEC-003: CORS Permisivo en Edge Functions
- **Ubicación:** 
  - `supabase/functions/generate-pdf/index.ts`
  - `supabase/functions/send-email/index.ts`
  - `supabase/functions/upsert-lead/index.ts`
- **Código problemático:**
```typescript
'Access-Control-Allow-Origin': '*'
```
- **Riesgo:** Cualquier origen puede invocar las Edge Functions
- **Remediación:** Restringir a dominios conocidos:
```typescript
const ALLOWED_ORIGINS = [
  'https://tudominio.com',
  'https://www.tudominio.com',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean)

const origin = req.headers.get('origin')
const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
```

### TYPE-001: Uso Excesivo de `any` en TypeScript
- **Ubicaciones principales:**
  - `src/services/quotes.ts` (líneas 155, 195, 230, 231, 298, 316)
  - `src/services/pdfQuoteService.ts` (líneas 93, 114, 146, 175, 256-264)
  - `src/hooks/useQuoteBuilder.ts` (líneas 45, 46, 215, 246, 373, 441, 587, 661)
  - `lib/admin-services.ts` (líneas 88, 100, 122, 165, 560, 639)
  - `middleware.ts` (línea 96)
- **Riesgo:** Pérdida de seguridad de tipos, posibles errores en runtime
- **Remediación:** Crear tipos específicos para cada caso de uso

### SEC-004: Validación de Acceso Mixta en send-email
- **Ubicación:** `supabase/functions/send-email/index.ts` (líneas 83-96)
- **Código problemático:**
```typescript
if (supabaseServiceKey && parsedToken === supabaseServiceKey) {
  console.log('⚠️ send-email: usando service key sin quoteToken');
  return;
}

if (supabaseAnonKey && parsedToken === supabaseAnonKey) {
  console.warn('⚠️ send-email: invocation anon sin quoteToken, se continuará con validación interna.');
```
- **Riesgo:** La función puede ser invocada con anon key sin quoteToken
- **Remediación:** Requerir siempre quoteToken para invocaciones anónimas o rechazar la solicitud

---

## 💡 RECOMENDACIONES - Mejoras Sugeridas

### ARCH-001: Páginas Principales Como Client Components
- **Ubicación:**
  - `app/cotizador/page.tsx` - "use client"
  - `app/catalogo/page.tsx` - "use client"
  - `app/mi-cuenta/page.tsx` - "use client"
  - `app/confirmacion/page.tsx` - "use client"
- **Observación:** Las páginas principales son client components completos
- **Mejora sugerida:** Extraer data fetching a Server Components para mejorar SEO y TTI:
```tsx
// app/catalogo/page.tsx (Server Component)
export default async function CatalogoPage() {
  const products = await getProductsFromServer()
  return <CatalogoClient initialProducts={products} />
}
```

### PERF-003: Cache Simple en Memoria para Productos
- **Ubicación:** `src/lib/data.ts` (líneas 5-9)
```typescript
let productsCache: Producto[] | null = null
let pricingCache: Map<number, PrecioEscalonado[]> = new Map()
let lastCacheUpdate: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
```
- **Observación:** Cache en memoria que no sobrevive a deploys/restarts
- **Mejora sugerida:** Usar React `cache()` o Next.js `unstable_cache()` para cache persistente

### PERF-004: Índices No Utilizados
- **Ubicación:** Base de datos Supabase
- **Índices no usados detectados:**
  - `idx_items_cotizacion_producto_id`
  - `idx_leads_updated_by`
  - `cotizaciones_user_id_idx`
  - `idx_productos_categoria`
  - `idx_productos_activo`
  - `idx_leads_estado`, `idx_leads_origen`, `idx_leads_prioridad`
  - `idx_leads_temperatura`, `idx_leads_score`, `idx_leads_proximo_seguimiento`
  - `idx_lead_actividades_tipo`
  - `idx_leads_ruc_cedula`
- **Mejora sugerida:** Evaluar si estos índices son necesarios para consultas futuras o eliminarlos para mejorar performance de escritura

### VALID-001: Falta Validación de Esquemas Consistente
- **Observación:** No se encontró uso de Zod u otra librería de validación de esquemas
- **Ubicaciones que se beneficiarían:**
  - Server actions en `app/admin/actions/`
  - API routes en `app/api/`
  - Edge Functions (validación de payload)
- **Mejora sugerida:** Implementar validación con Zod:
```typescript
import { z } from 'zod'

const LeadSchema = z.object({
  nombre: z.string().min(1).max(255),
  email: z.string().email(),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
})
```

### UX-001: Accesibilidad en Componentes
- **Observación positiva:** Se encontraron aria-labels en componentes clave
- **Mejora sugerida:** Auditar con herramienta automatizada (axe-core) y añadir:
  - `aria-live` para notificaciones dinámicas
  - Skip links para navegación por teclado
  - Mejor manejo de focus en modales

### CODE-001: Duplicación de Lógica de Formato
- **Ubicación:** Múltiples archivos definen formatters similares:
  - `app/mi-cuenta/page.tsx` - `formatCurrency`, `formatDate`
  - `app/confirmacion/page.tsx` - cálculos similares
  - `app/catalogo/page.tsx` - `currencyFormatter`
- **Mejora sugerida:** Centralizar en `src/lib/formatters.ts`:
```typescript
export const formatCurrency = (value: number) =>
  value.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
```

### CODE-002: Server Action Sin Validación de Permisos Explícita
- **Ubicación:** `app/admin/actions/revalidate.ts`
```typescript
'use server'

function ensureServerAccess(): void {
  if (!process.env.REVALIDATE_SECRET) {
    throw new Error('Missing REVALIDATE_SECRET environment variable')
  }
}
```
- **Observación:** Solo verifica variable de entorno, no permisos de usuario
- **Mejora sugerida:** Las server actions de admin deberían validar que el usuario sea admin:
```typescript
import { createServerClient } from '@supabase/ssr'

async function ensureAdminAccess() {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') throw new Error('Not authorized')
}
```

---

## ✅ PUNTOS FUERTES

### Seguridad
1. **Headers de seguridad bien configurados** en `next.config.mjs`:
   - Content-Security-Policy completo
   - Strict-Transport-Security con preload
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy restrictivo
   - Permissions-Policy deshabilitando cámara/micrófono/geolocalización

2. **Rate limiting implementado** en middleware con límites diferenciados:
   - 120 req/min para GET
   - 20 req/min para POST

3. **Función centralizada de seguridad** en Edge Functions (`_shared/security.ts`):
   - Validación de tokens
   - Verificación de roles de admin
   - Manejo correcto de errores HTTP

4. **Sistema de tokens de acceso** para cotizaciones públicas que permite acceso seguro sin autenticación

5. **Protección de rutas admin** en middleware con verificación de rol

### Arquitectura
1. **Separación de responsabilidades** clara:
   - `src/services/` para lógica de negocio
   - `src/hooks/` para estado de UI
   - `components/` para presentación
   - `src/lib/` para utilidades puras

2. **Uso de RPCs seguros** para operaciones sensibles:
   - `create_public_lead` - creación de leads con deduplicación
   - `create_public_quote` - creación de cotizaciones

3. **Normalización de datos** con funciones dedicadas (`normalizeProductFromSource`)

### UI/UX
1. **Uso consistente de shadcn/ui** para componentes
2. **aria-labels** implementados en componentes críticos
3. **Estados de carga** con skeletons y loaders
4. **Feedback visual** con sonner para notificaciones

### Performance
1. **Lazy loading** de componentes pesados en dashboard admin
2. **Image optimization** habilitada con formatos modernos (webp, avif)
3. **Bundle analyzer** configurado para análisis de tamaño

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1 - CRÍTICO 

#### [ ] Tarea 1.1: Habilitar Protección de Contraseñas Filtradas
- **Archivos afectados:** Configuración de Supabase (Dashboard)
- **Esfuerzo estimado:** 15 minutos
- **Pasos específicos:**
  1. Ir a Dashboard de Supabase > Authentication > Settings
  2. En "Password Requirements", habilitar "Leaked Password Protection"
  3. Verificar que la opción quede activa
  4. Documentar el cambio

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 1.2: Crear Índice para FK en email_logs
- **Archivos afectados:** Nueva migración SQL
- **Esfuerzo estimado:** 30 minutos
- **Pasos específicos:**
  1. Crear archivo `database/migrations/YYYYMMDD_add_email_logs_quote_id_index.sql`
  2. Contenido:
```sql
-- Añadir índice para FK email_logs_quote_id_fkey
CREATE INDEX IF NOT EXISTS idx_email_logs_quote_id ON public.email_logs(quote_id);
```
  3. Aplicar migración en Supabase
  4. Verificar con el advisor que el warning desaparece

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 1.3: Optimizar RLS Policies con (select auth.uid())
- **Archivos afectados:** Múltiples policies en Supabase
- **Esfuerzo estimado:** 2-3 horas
- **Pasos específicos:**
  1. Crear migración para actualizar policies
  2. Para cada policy afectada, cambiar:
```sql
-- De:
USING (auth.uid() = user_id)
-- A:
USING ((select auth.uid()) = user_id)
```
  3. Policies a actualizar:
     - `leads`: Users insert/read/update
     - `cotizaciones`: Users insert/read
     - `items_cotizacion`: Users insert/read
     - `email_logs`: Admins manage
  4. Aplicar migración
  5. Verificar que los advisors de performance no muestren warnings

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

### Fase 2 - ALTA PRIORIDAD 

#### [ ] Tarea 2.1: Consolidar Políticas RLS Permisivas
- **Archivos afectados:** Policies de Supabase para todas las tablas afectadas
- **Esfuerzo estimado:** 4-6 horas
- **Pasos específicos:**
  1. Auditar todas las políticas existentes por tabla
  2. Crear nueva política unificada por acción/rol
  3. Ejemplo para `cotizaciones`:
```sql
-- Eliminar políticas redundantes
DROP POLICY IF EXISTS "Admins manage cotizaciones" ON public.cotizaciones;
DROP POLICY IF EXISTS "Users insert cotizaciones" ON public.cotizaciones;

-- Crear política unificada
CREATE POLICY "Authenticated can insert cotizaciones" ON public.cotizaciones
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
```
  4. Repetir para cada tabla afectada
  5. Ejecutar tests para verificar que los permisos funcionan correctamente

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 2.2: Restringir CORS en Edge Functions
- **Archivos afectados:**
  - `supabase/functions/generate-pdf/index.ts`
  - `supabase/functions/send-email/index.ts`
  - `supabase/functions/upsert-lead/index.ts`
- **Esfuerzo estimado:** 2 horas
- **Pasos específicos:**
  1. Crear archivo compartido `supabase/functions/_shared/cors.ts`:
```typescript
const ALLOWED_ORIGINS = [
  'https://fullcolor.com.ec',
  'https://www.fullcolor.com.ec',
  Deno.env.get('ALLOWED_ORIGIN'),
].filter(Boolean) as string[]

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin')
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin ?? '') 
    ? origin 
    : ALLOWED_ORIGINS[0]
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }
}
```
  2. Actualizar cada Edge Function para usar `getCorsHeaders(req)`
  3. Añadir variable de entorno `ALLOWED_ORIGIN` para desarrollo local
  4. Deploy y verificar que funciona desde el frontend

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 2.3: Tipar Código con `any`
- **Archivos afectados:** Múltiples archivos listados en TYPE-001
- **Esfuerzo estimado:** 4-6 horas
- **Pasos específicos:**
  1. Crear tipos en `src/types/`:
```typescript
// src/types/quotes.ts
export interface QuoteUpdateData {
  estado: EstadoCotizacion
  notas?: string
  updated_at?: string
}

export interface ItemWithProduct extends ItemCotizacion {
  producto: Producto
}
```
  2. Reemplazar `any` por tipos específicos archivo por archivo
  3. Ejecutar `npm run lint` y `npm run build` después de cada archivo
  4. Priorizar archivos de servicios críticos primero

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

### Fase 3 - MEJORAS 

#### [ ] Tarea 3.1: Implementar Validación con Zod
- **Archivos afectados:**
  - `app/admin/actions/*.ts`
  - `app/api/**/*.ts`
  - `src/services/*.ts`
- **Esfuerzo estimado:** 1-2 días
- **Pasos específicos:**
  1. Instalar Zod: `npm install zod`
  2. Crear esquemas en `src/schemas/`:
```typescript
// src/schemas/lead.ts
import { z } from 'zod'

export const LeadSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(255),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  ruc_cedula: z.string().optional(),
  ciudad: z.string().optional(),
  notas: z.string().optional(),
})

export type LeadInput = z.infer<typeof LeadSchema>
```
  3. Integrar validación en servicios y API routes
  4. Añadir manejo de errores de validación en UI

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 3.2: Refactorizar Páginas a Server Components
- **Archivos afectados:**
  - `app/catalogo/page.tsx`
  - `app/cotizador/page.tsx`
  - `app/confirmacion/page.tsx`
  - `app/mi-cuenta/page.tsx`
- **Esfuerzo estimado:** 3-4 días
- **Pasos específicos:**
  1. Para cada página, crear versión server:
```tsx
// app/catalogo/page.tsx (Server Component)
import { Suspense } from 'react'
import { listProducts } from '@/src/lib/data-server'
import CatalogoClient from './catalogo-client'
import CatalogoSkeleton from './catalogo-skeleton'

export default async function CatalogoPage() {
  const products = await listProducts()
  
  return (
    <Suspense fallback={<CatalogoSkeleton />}>
      <CatalogoClient initialProducts={products} />
    </Suspense>
  )
}
```
  2. Extraer lógica client a componente separado
  3. Crear versiones server de funciones de data fetching
  4. Verificar SSR y SEO

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 3.3: Centralizar Funciones de Formato
- **Archivos afectados:** Múltiples páginas y componentes
- **Esfuerzo estimado:** 2-3 horas
- **Pasos específicos:**
  1. Crear `src/lib/formatters.ts`:
```typescript
export const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    ...options
  }).format(value)

export const formatDate = (value: string | Date, options?: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  })

export const formatQuantity = (value: number) =>
  new Intl.NumberFormat('es-EC').format(value)
```
  2. Reemplazar instancias en todo el código
  3. Añadir tests unitarios

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 3.4: Añadir Validación de Admin en Server Actions
- **Archivos afectados:** `app/admin/actions/*.ts`
- **Esfuerzo estimado:** 2-3 horas
- **Pasos específicos:**
  1. Crear helper `src/lib/server-auth.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') throw new Error('Not authorized')
  
  return { user, supabase }
}
```
  2. Usar en todas las server actions de admin
  3. Añadir tests

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

#### [ ] Tarea 3.5: Auditoría de Accesibilidad
- **Archivos afectados:** Componentes de UI
- **Esfuerzo estimado:** 2-3 días
- **Pasos específicos:**
  1. Instalar axe-core para tests: `npm install -D @axe-core/playwright`
  2. Añadir test E2E de accesibilidad:
```typescript
// e2e/specs/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('home page passes accessibility checks', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
```
  3. Ejecutar y corregir violaciones encontradas
  4. Añadir skip links y mejorar focus management

---
**DOCUMENTAR AQUÍ AL COMPLETAR:**
```
[NOTA DE PROGRESO - YYYY-MM-DD HH:MM]
- Resultado: [Completado ✓ / Parcial / Bloqueado]
- Cambios realizados: [Descripción de archivos modificados, comandos ejecutados]
- Novedades/Problemas: [Hallazgos inesperados, errores, decisiones que difieren del plan]
- Próximos pasos: [Si queda incompleto, qué falta]
- Verificación: [Cómo se confirmó que funciona]
```
---

---

## Notas Importantes

1. **Antes de aplicar cambios en RLS:** Hacer backup de las policies actuales y probar exhaustivamente en desarrollo
2. **Sobre índices no usados:** Evaluar caso por caso antes de eliminar - pueden ser necesarios para consultas futuras o reportes
3. **Migraciones de Supabase:** Usar siempre el MCP de Supabase para verificar el estado actual antes de aplicar cambios
4. **Tests:** Ejecutar suite completa después de cada fase (`npm run test && npm run test:e2e`)

---

## Recursos de Referencia

- [Supabase RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Zod Documentation](https://zod.dev/)
- [axe-core for Accessibility](https://github.com/dequelabs/axe-core)

---

_Fin del Plan de Mejoras_
