# 🎯 Plan de Implementación: Panel Admin CRUD Completo

## 📊 Estimación
- **Archivos a crear:** ~45 archivos
- **Componentes UI faltantes:** 8-10 componentes shadcn/ui
- **Servicios:** 5 servicios principales
- **Páginas:** 15+ páginas/rutas

## 🏗️ Estructura del Proyecto

```
app/
├── admin/
│   ├── layout.tsx                    ← Layout con sidebar
│   ├── page.tsx                       ← Dashboard principal
│   ├── productos/
│   │   ├── page.tsx                   ← Lista de productos
│   │   ├── nuevo/page.tsx             ← Crear producto
│   │   ├── [id]/
│   │   │   ├── page.tsx               ← Editar producto
│   │   │   └── precios/page.tsx       ← Gestión de precios
│   ├── cotizaciones/
│   │   ├── page.tsx                   ← Lista de cotizaciones
│   │   ├── [id]/
│   │   │   ├── page.tsx               ← Detalle de cotización
│   │   │   └── editar/page.tsx        ← Editar cotización
│   ├── leads/
│   │   ├── page.tsx                   ← Lista de leads
│   │   ├── nuevo/page.tsx             ← Crear lead
│   │   ├── [id]/
│   │   │   ├── page.tsx               ← Detalle de lead
│   │   │   └── editar/page.tsx        ← Editar lead
│   ├── eventos/
│   │   └── page.tsx                   ← Logs/eventos
│   └── configuracion/
│       └── page.tsx                   ← Configuración

components/
├── admin/
│   ├── AdminLayout.tsx
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   ├── DashboardKPIs.tsx
│   ├── DashboardChart.tsx
│   ├── ProductForm.tsx
│   ├── ProductList.tsx
│   ├── PricesTiersManager.tsx
│   ├── QuoteForm.tsx
│   ├── QuoteDetail.tsx
│   ├── QuoteTimeline.tsx
│   ├── LeadForm.tsx
│   ├── LeadDetail.tsx
│   ├── EventsTable.tsx
│   ├── ImageUpload.tsx
│   ├── SearchFilter.tsx
│   └── ConfirmDialog.tsx
├── ui/ (shadcn/ui - completar faltantes)
│   ├── dialog.tsx                     ← NUEVO
│   ├── dropdown-menu.tsx              ← NUEVO
│   ├── toast.tsx / sonner.tsx         ← NUEVO
│   ├── switch.tsx                     ← NUEVO
│   ├── checkbox.tsx                   ← NUEVO
│   ├── calendar.tsx                   ← NUEVO
│   ├── popover.tsx                    ← NUEVO
│   └── command.tsx                    ← NUEVO

src/
├── services/
│   ├── admin/
│   │   ├── productService.ts
│   │   ├── quoteService.ts
│   │   ├── leadService.ts
│   │   ├── eventService.ts
│   │   └── dashboardService.ts
│   └── uploadService.ts               ← Nuevo (Supabase Storage)
├── types/
│   └── admin.ts                       ← Tipos TypeScript
└── lib/
    ├── utils.ts                       ← Ya existe
    └── validations.ts                 ← Nuevo (esquemas Zod)

database/
└── migrations/
    └── add_sku_ruc_direccion.sql      ← Actualizar schema
```

## 🎯 Fases de Implementación

### Fase 1: Fundamentos (CRÍTICO)
- [  ] Actualizar schema de BD (agregar campos faltantes)
- [  ] Crear tipos TypeScript completos
- [  ] Instalar componentes shadcn/ui faltantes
- [  ] Crear servicios base (CRUD genérico)
- [  ] Crear layout admin con sidebar

### Fase 2: Dashboard
- [  ] Página dashboard
- [  ] KPIs (total cotizaciones, del mes, etc.)
- [  ] Gráfica con Recharts
- [  ] Tabla de productos top

### Fase 3: Productos
- [  ] Lista de productos (tabla, filtros, búsqueda)
- [  ] Crear producto (formulario completo)
- [  ] Editar producto
- [  ] Eliminar producto (con confirmación)
- [  ] Upload de imágenes a Supabase Storage
- [  ] Gestión de precios escalonados

### Fase 4: Cotizaciones
- [  ] Lista de cotizaciones (tabla, filtros)
- [  ] Detalle de cotización
- [  ] Timeline de eventos
- [  ] Editar cotización
- [  ] Clonar cotización
- [  ] Acciones (regenerar PDF, reenviar email)
- [  ] Eliminar cotización

### Fase 5: Leads
- [  ] Lista de leads
- [  ] Detalle de lead con historial
- [  ] Crear/editar lead
- [  ] Eliminar lead

### Fase 6: Eventos y Configuración
- [  ] Tabla de eventos/logs
- [  ] Página de configuración

### Fase 7: Testing y Refinamiento
- [  ] Testing de flujos completos
- [  ] Ajustes de UX
- [  ] Documentación

## ⚠️ DECISIÓN IMPORTANTE

Este es un proyecto MASIVO que requiere:
- **~45 archivos nuevos**
- **~3000-4000 líneas de código**
- **Múltiples componentes UI**

Tengo 3 opciones:

### Opción A: Implementación Completa (Recomendada)
Implemento TODO el sistema en múltiples respuestas, módulo por módulo. Empiezo con:
1. Fundamentos + Schema
2. Dashboard
3. Productos (completo)
4. Cotizaciones (completo)
5. Leads + Eventos

**Estimado:** 5-8 respuestas

### Opción B: MVP Funcional
Implemento versión reducida pero funcional:
- Layout admin básico
- CRUD Productos completo
- CRUD Cotizaciones básico
- Dashboard con KPIs simples

**Estimado:** 2-3 respuestas

### Opción C: Guía de Implementación
Te entrego:
- Estructura completa de carpetas
- Código de componentes clave (ejemplos)
- Servicios base
- Instrucciones detalladas para completar

**Estimado:** 1 respuesta

---

## 🤔 ¿Qué prefieres?

Responde con:
- **"Opción A"** - Implementación completa, iré módulo por módulo
- **"Opción B"** - MVP funcional para empezar rápido
- **"Opción C"** - Guía de implementación

O si prefieres que empiece con un módulo específico (ej: "Empieza con Productos completo"), dímelo.

**Mi recomendación:** Opción A, empezando con Fundamentos + Productos completo, ya que es el módulo más crítico y complejo. Luego puedo continuar con Cotizaciones.

¿Cómo quieres proceder?
