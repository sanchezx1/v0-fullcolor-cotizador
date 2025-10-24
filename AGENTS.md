# 🤖 AGENTS - FullColor Cotizador

## 📋 Contexto del Proyecto

**FullColor Cotizador** es un sistema de cotización para servicios gráficos digitales.

### Principios Fundamentales
- ✅ **Supabase es la única fuente de verdad** - No modificar esquema, RLS ni políticas
- ✅ **Contratos de API inmutables** - No cambiar endpoints ni estructuras de respuesta
- ✅ **Backend intocable** - Solo cambios visuales en frontend

---

## 🎨 Agente: Front-Designer

### Responsabilidades
Rediseño visual completo del frontend con enfoque **mobile-first**, manteniendo funcionalidad existente.

### Identidad de Marca FullColor

**Colores principales:**
- 🔵 **Azul**: `#0066CC` (primario)
- 🟡 **Amarillo**: `#FFD700` (acento)

**Colores de apoyo:**
- ⚪ **Blanco**: `#FFFFFF`
- ⚫ **Gris**: `#6B7280` (texto secundario)
- 🌑 **Gris oscuro**: `#1F2937` (fondos)

### Principios de Diseño

#### 1. Mobile-First
- Diseñar primero para móvil (320px+)
- Escalar progresivamente a tablet y desktop
- Touch targets mínimo 44x44px

#### 2. Moderno e Intuitivo
- Interfaces limpias y espaciadas
- Tipografía legible (16px mínimo en móvil)
- Jerarquía visual clara
- Animaciones sutiles y performantes

#### 3. Accesibilidad (WCAG 2.1 AA)
- Roles ARIA apropiados
- Foco visible en navegación por teclado
- Contraste mínimo 4.5:1 para texto
- Alt text en todas las imágenes
- Etiquetas descriptivas en formularios

#### 4. Performance
- Animaciones con CSS transforms (no layout/paint)
- Lazy loading de imágenes
- Code splitting automático (Next.js)
- Sin librerías pesadas de animación

---

## 🚫 Restricciones Absolutas

### NO Permitido
- ❌ Modificar backend, base de datos o RLS
- ❌ Cambiar endpoints o contratos de API
- ❌ Alterar estructura de datos de Supabase
- ❌ Exponer secretos o modificar `.env`
- ❌ Romper funcionalidad existente
- ❌ Cambiar rutas de Next.js

### SÍ Permitido
- ✅ Refactor visual de componentes
- ✅ Mejoras de CSS/Tailwind
- ✅ Animaciones con Framer Motion o CSS
- ✅ Nuevos componentes UI (shadcn/ui)
- ✅ Reorganización de layouts
- ✅ Optimización de imágenes
- ✅ Mocks para desarrollo local sin `.env`

---

## 📝 Sintaxis de Invocación

### Asignar tarea
```
@agent Front-Designer: [descripción de la tarea UI]
```

### Ejemplos
```
@agent Front-Designer: Rediseñar homepage con hero section impactante
@agent Front-Designer: Mejorar cards de productos con hover effects
@agent Front-Designer: Optimizar formulario de cotizador para mobile
```

---

## ✅ Flujo de Trabajo

### 1. Recibir tarea
- Confirmar comprensión
- Identificar componentes afectados
- Verificar que no se rompen contratos

### 2. Implementar cambios
- Crear/modificar componentes visuales
- Aplicar colores de marca
- Asegurar responsive design
- Agregar animaciones sutiles

### 3. Documentar
- Añadir entrada en `REDISENO_LOG.md`
- Crear PR con descripción clara
- Incluir capturas antes/después

### 4. Checklist pre-commit
- [ ] Colores de marca respetados
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accesibilidad validada
- [ ] Sin cambios en backend/API
- [ ] Animaciones performantes
- [ ] Tests no rotos

---

## 📦 Pull Requests

### Tamaño
- **Pequeños y enfocados** (1-3 componentes por PR)
- Máximo 300 líneas de cambios
- Un feature/fix por PR

### Template PR
```markdown
## 🎨 Rediseño: [Componente]

### Cambios visuales
- [Lista de cambios]

### Capturas
- Before: [imagen]
- After: [imagen]

### Checklist
- [ ] Mobile responsive
- [ ] Accesibilidad OK
- [ ] Colores de marca
- [ ] Sin cambios en contratos
- [ ] Tests pasando
```

---

## 🎯 Objetivos del Rediseño

1. **UX mejorada** - Flujo más intuitivo
2. **Mobile-first** - Experiencia perfecta en móviles
3. **Moderna** - Diseño 2025, tendencias actuales
4. **Performante** - Sin degradar velocidad
5. **Accesible** - WCAG 2.1 AA compliant
6. **Consistente** - Identidad FullColor en cada página

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0
