# Arquitectura de Agentes QA - FullColor Cotizador# README — Agentes de QA para FullColor Cotizador



> **Documentación basada en análisis real del repositorio**  > **Propósito:** Guía maestra para trabajar con los agentes especializados de QA. Este documento describe la arquitectura de agentes, sus responsabilidades, flujos de trabajo y cómo colaboran para garantizar la calidad en producción.

> Fecha: 2025-11-03 | Versión: 1.0.0

---

---

## 📋 Tabla de Contenidos

## 📋 Resumen Ejecutivo

1. [Introducción](#introducción)

**Base sólida existente:**2. [Arquitectura de Agentes](#arquitectura-de-agentes)

- ✅ **73 tests unitarios** pasando en 14.1s (Jest 29.7.0)3. [Principios Fundamentales](#principios-fundamentales)

- ✅ **Tests E2E + a11y** implementados (Playwright 1.40.0, 6 navegadores)4. [Agentes Disponibles](#agentes-disponibles)

- ✅ **3 GitHub Actions workflows** activos5. [Sintaxis de Invocación](#sintaxis-de-invocación)

- ✅ **Coverage threshold 50%** configurado6. [Flujo de Trabajo QA](#flujo-de-trabajo-qa)

7. [Restricciones Absolutas](#restricciones-absolutas)

**Issues críticos identificados:**8. [Integración con CI/CD](#integración-con-cicd)

- ❌ **Build falla** en `/auth/login` (suspense boundary requerido)9. [Troubleshooting](#troubleshooting)

- ⚠️ **3 vulnerabilidades moderate** (tar 7.5.1 en supabase CLI)

- ⚠️ **TypeScript/ESLint ignorados** en build---



---## Introducción



## 🎯 Los 3 Agentes**FullColor Cotizador** es un sistema de cotización para servicios gráficos digitales construido con:

- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS v4

### 1️⃣ Testing Agent 🧪- **Backend:** Supabase (PostgreSQL + Storage + Edge Functions)

**Scripts reales:**- **Deploy:** Vercel

```bash- **Testing:** Jest (unit/integration) + Playwright (E2E) + axe-core (a11y)

npm run test:unit          # ✅ 73 tests pasando

npm run test:integration   # ✅ 1 suite (placeholder)Este documento coordina **tres agentes especializados** que garantizan calidad, performance y seguridad antes de producción.

npm run test:e2e           # ⚠️ Requiere build funcionando

npm run test:accessibility # ✅ Tests @a11y---

npm run test:coverage      # ✅ Coverage > 50%

```## Arquitectura de Agentes

📄 **[Ver testing.md](./testing.md)**

```

---┌─────────────────────────────────────────────────────────────┐

│                    Arquitecto de QA                         │

### 2️⃣ Performance Agent ⚡│                   (Coordinador Global)                      │

**Scripts reales:**└─────────────────┬───────────────┬───────────────────────────┘

```bash                  │               │

npm run build   # ❌ Falla en /auth/login        ┌─────────┴─────┐  ┌──────┴──────┐  ┌──────────────┐

npm run dev     # ✅ Funciona        │  🧪 Testing   │  │ ⚡ Performance│  │ 🔒 Security  │

```        │    Agent      │  │    Agent      │  │    Agent     │

📄 **[Ver performance.md](./performance.md)**        └───────────────┘  └───────────────┘  └──────────────┘

             │                    │                   │

---        ┌────┴────┐         ┌─────┴─────┐      ┌─────┴─────┐

        │ Unit    │         │ Lighthouse│      │ npm audit │

### 3️⃣ Security Agent 🔒        │ E2E     │         │ Bundle    │      │ CodeQL    │

**Scripts reales:**        │ A11y    │         │ Core Web  │      │ RLS Check │

```bash        └─────────┘         └───────────┘      └───────────┘

npm audit                # ⚠️ 3 moderate```

npm audit fix            # Auto-fix parcial

npx tsc --noEmit         # ✅ TypeScript check### Relación entre Agentes

npm run lint             # ✅ ESLint

```- **Testing Agent:** Garantiza que todo funciona como se espera (funcional + accesibilidad)

📄 **[Ver security.md](./security.md)**- **Performance Agent:** Optimiza velocidad, bundle size y Core Web Vitals

- **Security Agent:** Protege contra vulnerabilidades, XSS, SQL injection y expone secretos

---

Los tres agentes **trabajan en paralelo** pero se coordinan en **gates de CI/CD**.

## 🚦 Gates de Calidad

---

| Gate | Threshold | Actual | Bloquea |

|------|-----------|--------|---------|## Principios Fundamentales

| Tests unitarios | 100% passing | ✅ 73/73 | ✅ Sí |

| Tests E2E | 100% passing | ⚠️ Por verificar | ✅ Sí |### ✅ NO Negociables

| Coverage | ≥50% | ✅ Configurado | ❌ No |

| Build | Exitoso | ❌ Falla | ✅ Sí |1. **Supabase es la única fuente de verdad**

| Audit high/critical | 0 | ✅ 0 | ✅ Sí |   - No modificar esquema, RLS ni políticas de seguridad

| Audit moderate | 0 | ⚠️ 3 | ❌ No |   - No duplicar datos fuera de BD



---2. **Contratos de API inmutables**

   - No cambiar endpoints ni estructuras de respuesta

## 🚀 Plan de Acción (Prioritario)   - Mantener retrocompatibilidad



### Fase 1: Fix Build (CRÍTICO - 2h)3. **Backend intocable**

```tsx   - Solo frontend, tooling, tests y CI/CD

// app/auth/login/page.tsx - Wrap con Suspense   - Edge Functions solo si no alteran contratos

import { Suspense } from 'react'

export default function LoginPage() {4. **CI debe pasar siempre**

  return <Suspense fallback={<div>Loading...</div>}>   - Todos los tests deben pasar antes de merge

    <LoginForm />   - Coverage mínimo: 50% (objetivo: 80%)

  </Suspense>   - Lighthouse score mínimo: 90

}   - Zero vulnerabilidades críticas

```

---

### Fase 2: Security (2h)

1. `npm audit fix` para tar## Agentes Disponibles

2. Configurar security headers en `next.config.mjs`

3. Habilitar TypeScript/ESLint en build### 🧪 Testing Agent

**Archivo:** [`testing.md`](./testing.md)

### Fase 3: Validación (1h)

```bash**Responsabilidades:**

npm run build       # ✅ Debe pasar- Tests unitarios (Jest + Testing Library)

npm run test:all    # ✅ Debe pasar- Tests de integración (API + Supabase)

npm audit           # ✅ 0 moderate- Tests E2E (Playwright multi-browser)

```- Tests de accesibilidad (axe-core + WCAG 2.1 AA)

- Visual regression (opcional)

---

**Cobertura mínima:**

## ✅ Checklist Pre-Deploy- Servicios críticos: 80%

- Componentes UI: 60%

```markdown- Utilidades: 90%

### Tests

- [ ] npm run test:unit → ✅ 73/73---

- [ ] npm run test:e2e → ✅ passing

- [ ] npm run test:coverage → ✅ ≥50%### ⚡ Performance Agent

**Archivo:** [`performance.md`](./performance.md)

### Build

- [ ] npm run build → ✅ exitoso**Responsabilidades:**

- [ ] npx tsc --noEmit → ✅ 0 errors- Optimización de bundle size (< 200KB inicial)

- [ ] npm run lint → ✅ 0 errors- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

- Lighthouse CI (score > 90)

### Security- Lazy loading de imágenes y componentes

- [ ] npm audit --audit-level=high → ✅ 0- Code splitting estratégico

- [ ] GitHub Actions: all green → ✅- Monitoreo con Vercel Analytics



### Env Vars (Vercel)**Métricas objetivo:**

- [ ] NEXT_PUBLIC_SUPABASE_URL → ✅- First Contentful Paint: < 1.8s

- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY → ✅- Time to Interactive: < 3.5s

```- Total Blocking Time: < 300ms



------



## 📚 Documentación Completa### 🔒 Security Agent

**Archivo:** [`security.md`](./security.md)

| Archivo | Contenido | Tiempo |

|---------|-----------|--------|**Responsabilidades:**

| [testing.md](./testing.md) | Tests: unit, E2E, a11y, coverage | 20 min |- Auditoría de dependencias (npm audit)

| [performance.md](./performance.md) | Build, bundle, optimización | 25 min |- Análisis estático (CodeQL + ESLint security plugins)

| [security.md](./security.md) | Audit, headers, secrets, RLS | 30 min |- Validación de RLS policies (sin modificar)

| [../ci/workflows.md](../ci/workflows.md) | GitHub Actions workflows | 15 min |- Detección de secretos expuestos

- Headers de seguridad (CSP, HSTS, X-Frame-Options)

**Total lectura:** ~90 minutos- Rate limiting en APIs

- Sanitización de inputs

---

**Niveles de severidad:**

## 🆘 Troubleshooting Rápido- **Critical/High:** Bloquea CI ❌

- **Moderate:** Warning con ticket ⚠️

### Build falla con suspense boundary- **Low:** Info, no bloquea ✅

```tsx

import { Suspense } from 'react'---

// Wrap componentes con useSearchParams/useRouter

```## Sintaxis de Invocación



### Tests E2E con ERR_CONNECTION_REFUSED### Asignar tarea a un agente específico

```bash

npm run dev  # Terminal 1```markdown

npm run test:e2e  # Terminal 2@agent [nombre-agente]: [descripción de la tarea]

``````



### Coverage bajo### Ejemplos

```bash

npm run test:coverage```markdown

open coverage/lcov-report/index.html@agent Testing: Crear tests E2E para flujo completo de cotización

```@agent Performance: Optimizar bundle de página de catálogo

@agent Security: Auditar endpoint de creación de PDF para XSS

---```



## 📈 Métricas### Coordinar múltiples agentes



### Baseline Actual```markdown

- Tests: **73 passing** (100%)@agent Testing, Performance, Security: Validar feature de export CSV

- Build: **❌ Falla**```

- Vulnerabilities: **3 moderate**

### Invocar checklist completo pre-release

### Objetivo Production

- Tests: **100% passing + ≥60% coverage**```markdown

- Build: **✅ <3min**@QA: Ejecutar checklist completo de producción

- Vulnerabilities: **0 moderate/high/critical**```

- Lighthouse: **≥90**

---

---

## Flujo de Trabajo QA

**Última actualización:** 2025-11-03  

**Estado:** Documentación basada en repo real### 1. Feature Development (Developer)


```
Developer implementa feature
    ↓
Ejecuta tests locales
    ↓
Crea PR
```

### 2. CI Automation (GitHub Actions)

```
PR abierto
    ↓
┌─────────────────────────────────────┐
│  Tests Unit/Integration (parallel)  │
│  Tests E2E (Playwright)             │
│  Lighthouse CI                      │
│  Security Audit (npm + CodeQL)      │
└─────────────────────────────────────┘
    ↓
¿Todos pasaron? → NO → Bloquea merge ❌
    ↓ SÍ
Review manual (opcional)
    ↓
Merge a main ✅
```

### 3. Post-Merge Validation

```
Deploy a Vercel Preview
    ↓
Smoke tests en ambiente real
    ↓
Monitoreo 24h (Analytics + Sentry)
    ↓
Deploy a producción
```

---

## Restricciones Absolutas

### ❌ NO Permitido

- Modificar esquema de Supabase o RLS policies
- Cambiar contratos de API o endpoints existentes
- Alterar estructura de datos en BD
- Exponer secretos en código o logs
- Romper funcionalidad existente sin plan de migración
- Bajar umbrales de coverage sin aprobación
- Merges sin que CI pase

### ✅ SÍ Permitido

- Crear nuevos tests (unit, integration, E2E)
- Optimizar queries y bundle size
- Agregar headers de seguridad
- Refactorizar código con tests de regresión
- Mejorar logging y observabilidad
- Automatizar checks de QA en CI
- Agregar mocks/fixtures para tests

---

## Integración con CI/CD

### Workflows Actuales

```
.github/workflows/
├── tests-unit.yml         → Unit + Integration (Node 18, 20)
├── tests-e2e.yml          → Playwright multi-browser
└── security-audit.yml     → npm audit + CodeQL
```

### Gates de Calidad

| Gate               | Tool              | Umbral         | Bloquea CI |
|--------------------|-------------------|----------------|------------|
| Unit Tests         | Jest              | Coverage > 50% | ✅ SÍ      |
| E2E Tests          | Playwright        | 100% pass      | ✅ SÍ      |
| Accessibility      | axe-core          | 0 violations   | ✅ SÍ      |
| Bundle Size        | Next.js           | < 200KB        | ⚠️ Warning |
| Lighthouse         | Lighthouse CI     | Score > 90     | ⚠️ Warning |
| Dependencies       | npm audit         | 0 high/critical| ✅ SÍ      |
| Code Analysis      | CodeQL            | 0 high/critical| ✅ SÍ      |

### Crear nuevo workflow

Ver: [`docs/ci/workflows.md`](../ci/workflows.md) para sintaxis completa.

---

## Troubleshooting

### Tests fallan localmente pero pasan en CI

```bash
# Limpiar cache de Jest
npm run test -- --clearCache

# Verificar versión de Node (debe ser 18 o 20)
node --version

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### E2E tests timeout

```typescript
// Aumentar timeout en playwright.config.ts
timeout: 60 * 1000, // 60 segundos

// O específico por test
test('flujo largo', async ({ page }) => {
  test.setTimeout(120000); // 2 minutos
  // ...
});
```

### Coverage no alcanza umbral

```bash
# Ver reporte detallado
npm run test:coverage

# Abrir reporte HTML
open coverage/lcov-report/index.html
```

### Lighthouse score bajo

```bash
# Ejecutar análisis local
npx lighthouse http://localhost:3000 --view

# Ver recomendaciones específicas
npx lighthouse http://localhost:3000 --output=json
```

### Vulnerabilidades en dependencias

```bash
# Ver detalles de vulnerabilidades
npm audit

# Intentar fix automático (solo patches/minor)
npm audit fix

# Fix con breaking changes (cuidado)
npm audit fix --force

# Si no se puede actualizar, agregar a ignore (justificado)
# Ver docs/agents/security.md
```

---

## Checklist Pre-Release (Copiar/Pegar)

### 🧪 Testing
- [ ] Tests unitarios pasan (cobertura > 50%)
- [ ] Tests de integración pasan
- [ ] Tests E2E pasan en todos los navegadores (Chrome, Firefox, Safari)
- [ ] Tests de accesibilidad sin violaciones (WCAG 2.1 AA)
- [ ] Tests en mobile responsive (viewport 375px mínimo)

### ⚡ Performance
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle inicial < 200KB (gzipped)
- [ ] Imágenes optimizadas (WebP/AVIF + lazy loading)

### 🔒 Security
- [ ] npm audit sin vulnerabilidades high/critical
- [ ] CodeQL sin alertas critical/high
- [ ] No hay secretos expuestos en código
- [ ] RLS policies validadas (sin modificar)
- [ ] Headers de seguridad configurados (CSP, HSTS)
- [ ] Inputs sanitizados (XSS, SQL injection)
- [ ] Rate limiting en endpoints sensibles

### 📦 Build & Deploy
- [ ] `npm run build` exitoso sin warnings críticos
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy preview funcional
- [ ] Smoke tests en preview passed
- [ ] Rollback plan documentado

### 📊 Monitoring
- [ ] Vercel Analytics configurado
- [ ] <PLACEHOLDER: Error tracking tool (Sentry/LogRocket)> [PENDIENTE]
- [ ] Alertas configuradas para errores críticos
- [ ] Dashboard de métricas accesible

---

## Siguientes Pasos

1. ✅ **[Leer]** `testing.md` - Estrategia completa de testing
2. ✅ **[Leer]** `performance.md` - Optimizaciones y métricas
3. ✅ **[Leer]** `security.md` - Auditoría y hardening
4. ✅ **[Leer]** `../ci/workflows.md` - Configuración de GitHub Actions

5. **[Ejecutar]** Checklist pre-release completo
6. **[Validar]** Todos los workflows de CI pasan
7. **[Documentar]** Resultados en `REDISENO_LOG.md` o crear `QA_REPORT.md`

---

## Recursos Adicionales

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Última actualización:** 2025-11-03  
**Versión:** 1.0.0  
**Mantenido por:** Arquitecto de QA
