# Índice de Agentes Claude Code - Cotizador FullColor

> Documento de referencia para los agentes diseñados según `docs/PLAN_MEJORAS.md`
> 
> **Última actualización:** 2025-11-27

---

## Resumen de Agentes

| Agente | Tareas del Plan | Fase | Modelo | Prioridad |
|--------|-----------------|------|--------|-----------|
| `security-auditor` | 1.1 | Fase 1 | opus | 🔴 Crítico |
| `supabase-rls-optimizer` | 1.2, 1.3, 2.1 | Fase 1-2 | opus | 🔴 Crítico |
| `edge-functions-security` | 2.2 | Fase 2 | opus | 🟠 Alta |
| `typescript-strict-typer` | 2.3, 3.1 | Fase 2-3 | sonnet | 🟠 Alta |
| `nextjs-optimizer` | 3.2, 3.3 | Fase 3 | sonnet | 🟡 Media |
| `admin-auth-hardener` | 3.4 | Fase 3 | sonnet | 🟡 Media |
| `accessibility-auditor` | 3.5 | Fase 3 | sonnet | 🟡 Media |

---

## Mapeo Tareas → Agentes

### Fase 1 - CRÍTICO

| Tarea | Descripción | Agente |
|-------|-------------|--------|
| 1.1 | Habilitar Protección de Contraseñas Filtradas | `security-auditor` |
| 1.2 | Crear Índice para FK en email_logs | `supabase-rls-optimizer` |
| 1.3 | Optimizar RLS Policies con (select auth.uid()) | `supabase-rls-optimizer` |

### Fase 2 - ALTA PRIORIDAD

| Tarea | Descripción | Agente |
|-------|-------------|--------|
| 2.1 | Consolidar Políticas RLS Permisivas | `supabase-rls-optimizer` |
| 2.2 | Restringir CORS en Edge Functions | `edge-functions-security` |
| 2.3 | Tipar Código con `any` | `typescript-strict-typer` |

### Fase 3 - MEJORAS

| Tarea | Descripción | Agente |
|-------|-------------|--------|
| 3.1 | Implementar Validación con Zod | `typescript-strict-typer` |
| 3.2 | Refactorizar Páginas a Server Components | `nextjs-optimizer` |
| 3.3 | Centralizar Funciones de Formato | `nextjs-optimizer` |
| 3.4 | Añadir Validación de Admin en Server Actions | `admin-auth-hardener` |
| 3.5 | Auditoría de Accesibilidad | `accessibility-auditor` |

---

## Detalle de Agentes

### 1. `security-auditor` 🔴

**Propósito:** Auditor de seguridad general del proyecto.

**Tareas:**
- ✅ Tarea 1.1: Protección de contraseñas filtradas (SEC-001)
- Auditorías generales de seguridad
- Verificación de headers HTTP
- Revisión de dependencias vulnerables

**Skills:**
- Verificar configuración de Supabase Auth
- Auditar headers de seguridad en next.config.mjs
- Buscar secrets hardcodeados
- Ejecutar `npm audit`
- Generar reportes de seguridad

**Cuándo usar:**
```
@security-auditor verifica la configuración de seguridad del proyecto
@security-auditor completa la tarea 1.1 del plan de mejoras
@security-auditor genera un reporte de auditoría de seguridad
```

---

### 2. `supabase-rls-optimizer` 🔴

**Propósito:** Especialista en optimización de RLS de Supabase.

**Tareas:**
- ✅ Tarea 1.2: Crear índice para FK en email_logs (SEC-002)
- ✅ Tarea 1.3: Optimizar RLS con (select auth.uid()) (PERF-001)
- ✅ Tarea 2.1: Consolidar políticas permisivas (PERF-002)

**Skills:**
- Crear migraciones SQL para índices
- Optimizar policies RLS para performance
- Consolidar policies redundantes
- Usar MCP de Supabase para inspección y aplicación
- Verificar advisors de Supabase

**Cuándo usar:**
```
@supabase-rls-optimizer crea el índice para email_logs (tarea 1.2)
@supabase-rls-optimizer optimiza las policies RLS con select auth.uid()
@supabase-rls-optimizer consolida las políticas permisivas de la tabla leads
```

---

### 3. `edge-functions-security` 🟠

**Propósito:** Asegurar Edge Functions de Supabase.

**Tareas:**
- ✅ Tarea 2.2: Restringir CORS (SEC-003)
- Fix SEC-004: Validación de acceso en send-email

**Skills:**
- Crear módulo compartido de CORS
- Actualizar Edge Functions para CORS restrictivo
- Validar tokens correctamente
- Desplegar funciones con MCP de Supabase

**Cuándo usar:**
```
@edge-functions-security implementa CORS restrictivo (tarea 2.2)
@edge-functions-security corrige la validación de tokens en send-email
```

---

### 4. `typescript-strict-typer` 🟠

**Propósito:** Eliminar `any` y añadir validación con Zod.

**Tareas:**
- ✅ Tarea 2.3: Tipar código con `any` (TYPE-001)
- ✅ Tarea 3.1: Implementar validación con Zod (VALID-001)

**Skills:**
- Crear tipos TypeScript específicos
- Reemplazar `any` por tipos correctos
- Crear esquemas Zod para validación
- Integrar validación en services y API routes

**Cuándo usar:**
```
@typescript-strict-typer elimina los any de src/services/quotes.ts
@typescript-strict-typer crea esquemas Zod para validación de leads
@typescript-strict-typer tipa el archivo middleware.ts
```

---

### 5. `nextjs-optimizer` 🟡

**Propósito:** Optimizar páginas Next.js App Router.

**Tareas:**
- ✅ Tarea 3.2: Refactorizar a Server Components (ARCH-001)
- ✅ Tarea 3.3: Centralizar formatters (CODE-001)

**Skills:**
- Convertir client components a server components
- Extraer lógica client a componentes separados
- Crear formatters centralizados
- Mejorar SSR y SEO

**Cuándo usar:**
```
@nextjs-optimizer refactoriza app/catalogo/page.tsx a server component
@nextjs-optimizer centraliza los formatters del proyecto
```

---

### 6. `admin-auth-hardener` 🟡

**Propósito:** Fortalecer autenticación en server actions de admin.

**Tareas:**
- ✅ Tarea 3.4: Validación de admin en server actions (CODE-002)

**Skills:**
- Crear helper de autenticación admin
- Implementar verificación de rol en server actions
- Manejar errores de autenticación

**Cuándo usar:**
```
@admin-auth-hardener implementa validación de admin en server actions
@admin-auth-hardener crea el helper requireAdmin()
```

---

### 7. `accessibility-auditor` 🟡

**Propósito:** Auditar y mejorar accesibilidad web.

**Tareas:**
- ✅ Tarea 3.5: Auditoría de accesibilidad (UX-001)

**Skills:**
- Crear tests E2E con axe-core
- Implementar skip links
- Verificar aria-live en notificaciones
- Corregir violaciones WCAG

**Cuándo usar:**
```
@accessibility-auditor crea tests de accesibilidad con axe-core
@accessibility-auditor implementa skip link en el layout
@accessibility-auditor audita la página de catálogo
```

---

## Flujo de Trabajo Recomendado

### Orden de Ejecución

```
1. @security-auditor → Tarea 1.1 (requiere acción manual en Dashboard)
2. @supabase-rls-optimizer → Tareas 1.2, 1.3
3. @supabase-rls-optimizer → Tarea 2.1
4. @edge-functions-security → Tarea 2.2
5. @typescript-strict-typer → Tarea 2.3
6. @typescript-strict-typer → Tarea 3.1
7. @nextjs-optimizer → Tareas 3.2, 3.3
8. @admin-auth-hardener → Tarea 3.4
9. @accessibility-auditor → Tarea 3.5
```

### Ejemplo de Sesión

```bash
# Empezar Fase 1
@supabase-rls-optimizer ejecuta la tarea 1.2 del plan de mejoras

# El agente:
# 1. Lee PLAN_MEJORAS.md
# 2. Usa MCP Supabase para ver estado actual
# 3. Crea migración
# 4. Aplica migración
# 5. Verifica con advisors
# 6. Actualiza PLAN_MEJORAS.md con nota de progreso
```

---

## Reglas Globales para Todos los Agentes

1. **Siempre leer** `docs/PLAN_MEJORAS.md` antes de empezar
2. **Documentar progreso** en PLAN_MEJORAS.md al completar cada tarea
3. **Usar MCP de Supabase** para cualquier operación de BD
4. **Verificar** cambios antes de marcar como completado
5. **No repetir** trabajo ya documentado como hecho

---

## Archivos de Agentes

```
.claude/
├── agents/
│   ├── security-auditor.md          # Seguridad general
│   ├── supabase-rls-optimizer.md    # RLS y performance BD
│   ├── edge-functions-security.md   # CORS y Edge Functions
│   ├── typescript-strict-typer.md   # Tipado y Zod
│   ├── nextjs-optimizer.md          # Server components y formatters
│   ├── admin-auth-hardener.md       # Auth en server actions
│   └── accessibility-auditor.md     # Accesibilidad WCAG
├── CLAUDE.md                        # Instrucciones globales
└── settings.local.json              # Configuración local
```

---

_Fin del índice de agentes_
