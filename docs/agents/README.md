# Sistema QA - FullColor Cotizador# Arquitectura de Agentes QA - FullColor Cotizador# README — Agentes de QA para FullColor Cotizador



> **Documentación QA 100% basada en análisis real del repositorio**  

> **Última actualización:** 2025-11-03  

> **Rama:** `feature/qa-fixes-and-optimization`  > **Documentación basada en análisis real del repositorio**  > **Propósito:** Guía maestra para trabajar con los agentes especializados de QA. Este documento describe la arquitectura de agentes, sus responsabilidades, flujos de trabajo y cómo colaboran para garantizar la calidad en producción.

> **Estado:** ✅ Production Ready

> Fecha: 2025-11-03 | Versión: 1.0.0

---

---

## 📊 Estado Actual del Proyecto

---

### ✅ Baseline Verificado (2025-11-03 18:00 UTC-5)

## 📋 Tabla de Contenidos

| Métrica | Estado | Detalles |

|---------|---------|----------|## 📋 Resumen Ejecutivo

| **Build** | ✅ **PASSING** | Production optimized, 22 rutas, 264KB max bundle |

| **Tests Unitarios** | ✅ **73/73 PASSING** | 1.679s, 3 suites (validations, pricing, quote-calculations) |1. [Introducción](#introducción)

| **TypeScript** | ✅ **0 ERRORS** | Strict mode activo, validación en build habilitada |

| **ESLint** | ✅ **ACTIVE** | Validación en build habilitada (ignoreDuringBuilds: false) |**Base sólida existente:**2. [Arquitectura de Agentes](#arquitectura-de-agentes)

| **Vulnerabilidades** | ⚠️ **3 MODERATE** | Next.js (3) - fix disponible con `npm audit fix --force` |

| **Coverage** | 🟡 **Threshold 50%** | Configurado en jest.config.ts, ejecutar con `npm run test:coverage` |- ✅ **73 tests unitarios** pasando en 14.1s (Jest 29.7.0)3. [Principios Fundamentales](#principios-fundamentales)

| **E2E Tests** | ✅ **Configurados** | Playwright 6 proyectos, 2 specs (cotizador-flow, accessibility) |

- ✅ **Tests E2E + a11y** implementados (Playwright 1.40.0, 6 navegadores)4. [Agentes Disponibles](#agentes-disponibles)

---

- ✅ **3 GitHub Actions workflows** activos5. [Sintaxis de Invocación](#sintaxis-de-invocación)

## 🎯 Stack Tecnológico Actual

- ✅ **Coverage threshold 50%** configurado6. [Flujo de Trabajo QA](#flujo-de-trabajo-qa)

### Framework & Runtime

- **Next.js**: `15.2.4` (App Router, RSC, Middleware)7. [Restricciones Absolutas](#restricciones-absolutas)

- **React**: `19.0.0` (RC with RSC support)

- **TypeScript**: `5.9.3` (target: ES2018, strict mode)**Issues críticos identificados:**8. [Integración con CI/CD](#integración-con-cicd)

- **Node.js**: Compatible con 18.x, 20.x (verificado en CI)

- ❌ **Build falla** en `/auth/login` (suspense boundary requerido)9. [Troubleshooting](#troubleshooting)

### Testing

- **Jest**: `29.7.0` + `@testing-library/react` `15.0.0`- ⚠️ **3 vulnerabilidades moderate** (tar 7.5.1 en supabase CLI)

- **Playwright**: `1.40.0` (6 proyectos: Chrome, Firefox, Safari, Mobile)

- **Accessibility**: `axe-core` `4.8.2` + `axe-playwright` `1.2.3`- ⚠️ **TypeScript/ESLint ignorados** en build---

- **Coverage**: v8 provider, threshold 50%



### Backend & Database

- **Supabase**: `@supabase/supabase-js` `2.75.0` + `@supabase/ssr` `0.7.0`---## Introducción

- **Auth**: Supabase Auth (JWT, RLS policies activas)

- **Storage**: Supabase Storage con RLS



### UI & Styling## 🎯 Los 3 Agentes**FullColor Cotizador** es un sistema de cotización para servicios gráficos digitales construido con:

- **Tailwind CSS**: `4.1.15` (@tailwindcss/postcss)

- **Radix UI**: Componentes accesibles (Dialog, Dropdown, Select, etc.)- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS v4

- **Shadcn/ui**: Sistema de diseño base

- **Lucide React**: `0.454.0` (iconos)### 1️⃣ Testing Agent 🧪- **Backend:** Supabase (PostgreSQL + Storage + Edge Functions)

- **Geist**: `1.3.1` (tipografía Vercel)

**Scripts reales:**- **Deploy:** Vercel

### Forms & Validation

- **React Hook Form**: `7.65.0````bash- **Testing:** Jest (unit/integration) + Playwright (E2E) + axe-core (a11y)

- **Zod**: `3.25.76` (schema validation)

- **@hookform/resolvers**: `3.10.0`npm run test:unit          # ✅ 73 tests pasando



### Analytics & Monitoringnpm run test:integration   # ✅ 1 suite (placeholder)Este documento coordina **tres agentes especializados** que garantizan calidad, performance y seguridad antes de producción.

- **Vercel Analytics**: `1.3.1`

npm run test:e2e           # ⚠️ Requiere build funcionando

---

npm run test:accessibility # ✅ Tests @a11y---

## 📁 Estructura del Proyecto

npm run test:coverage      # ✅ Coverage > 50%

```

v0-fullcolor-cotizador-2/```## Arquitectura de Agentes

├── app/                          # Next.js 15 App Router

│   ├── page.tsx                  # Homepage (12.8 KB)📄 **[Ver testing.md](./testing.md)**

│   ├── auth/login/               # Login con Suspense boundary ✅

│   ├── admin/                    # Panel admin (102 KB)```

│   │   ├── page.tsx              # Dashboard principal

│   │   ├── cotizaciones/         # Gestión de cotizaciones---┌─────────────────────────────────────────────────────────────┐

│   │   ├── leads/                # Gestión de leads

│   │   ├── productos/            # Gestión de productos│                    Arquitecto de QA                         │

│   │   └── configuracion/        # Settings

│   ├── catalogo/                 # Catálogo público### 2️⃣ Performance Agent ⚡│                   (Coordinador Global)                      │

│   ├── cotizador/                # Cotizador web

│   ├── producto/[id]/            # Detalle de producto**Scripts reales:**└─────────────────┬───────────────┬───────────────────────────┘

│   └── confirmacion/             # Página de confirmación

│```bash                  │               │

├── components/                   # Componentes React reutilizables

│   ├── ui/                       # Componentes base (shadcn/ui)npm run build   # ❌ Falla en /auth/login        ┌─────────┴─────┐  ┌──────┴──────┐  ┌──────────────┐

│   ├── admin/                    # Componentes específicos de admin

│   ├── header.tsx                # Header globalnpm run dev     # ✅ Funciona        │  🧪 Testing   │  │ ⚡ Performance│  │ 🔒 Security  │

│   ├── footer.tsx                # Footer global

│   └── whatsapp-help.tsx         # Widget de WhatsApp```        │    Agent      │  │    Agent      │  │    Agent     │

│

├── lib/                          # Lógica de negocio y servicios📄 **[Ver performance.md](./performance.md)**        └───────────────┘  └───────────────┘  └──────────────┘

│   ├── supabase-client.ts        # Cliente Supabase (SSR-ready)

│   ├── admin-services.ts         # Servicios del panel admin             │                    │                   │

│   ├── admin-types.ts            # Tipos TypeScript (Lead, Cotizacion, Producto)

│   ├── types.ts                  # Tipos globales---        ┌────┴────┐         ┌─────┴─────┐      ┌─────┴─────┐

│   └── utils.ts                  # Utilidades (cn, formatters)

│        │ Unit    │         │ Lighthouse│      │ npm audit │

├── tests/                        # Tests unitarios e integración

│   ├── unit/                     # 73 tests unitarios ✅### 3️⃣ Security Agent 🔒        │ E2E     │         │ Bundle    │      │ CodeQL    │

│   │   ├── validations.test.ts   # 30 tests (teléfono, RUC, SKU, cálculos)

│   │   ├── pricing.test.ts       # 28 tests (precios escalonados)**Scripts reales:**        │ A11y    │         │ Core Web  │      │ RLS Check │

│   │   └── quote-calculations.test.ts # 15 tests (cotizaciones)

│   ├── integration/              # Tests de integración```bash        └─────────┘         └───────────┘      └───────────┘

│   │   └── quote-flow.test.ts    # Flujo completo de cotización

│   └── setup/                    # Configuración de testsnpm audit                # ⚠️ 3 moderate```

│       └── jest.setup.ts

│npm audit fix            # Auto-fix parcial

├── e2e/                          # Tests E2E con Playwright

│   ├── specs/npx tsc --noEmit         # ✅ TypeScript check### Relación entre Agentes

│   │   ├── cotizador-flow.spec.ts    # Flujo de cotización completo

│   │   └── accessibility.spec.ts     # Tests de accesibilidad (WCAG 2.1 AA)npm run lint             # ✅ ESLint

│   └── fixtures/

│```- **Testing Agent:** Garantiza que todo funciona como se espera (funcional + accesibilidad)

├── database/                     # Migraciones y scripts SQL

│   ├── migrations/               # Migraciones versionadas📄 **[Ver security.md](./security.md)**- **Performance Agent:** Optimiza velocidad, bundle size y Core Web Vitals

│   └── archive/                  # Scripts antiguos

│- **Security Agent:** Protege contra vulnerabilidades, XSS, SQL injection y expone secretos

├── .github/workflows/            # CI/CD con GitHub Actions

│   ├── tests-unit.yml            # Tests unitarios (Node 18, 20)---

│   ├── tests-e2e.yml             # Tests E2E (6 navegadores)

│   └── security-audit.yml        # Audit + CodeQL + dependency-reviewLos tres agentes **trabajan en paralelo** pero se coordinan en **gates de CI/CD**.

│

└── docs/                         # Documentación QA## 🚦 Gates de Calidad

    ├── agents/                   # Documentación de agentes QA

    │   ├── README.md             # Este archivo---

    │   ├── testing.md            # Estrategia de testing

    │   ├── performance.md        # Performance y optimización| Gate | Threshold | Actual | Bloquea |

    │   └── security.md           # Seguridad y compliance

    └── ci/|------|-----------|--------|---------|## Principios Fundamentales

        └── workflows.md          # Documentación de workflows

```| Tests unitarios | 100% passing | ✅ 73/73 | ✅ Sí |



**Estadísticas:**| Tests E2E | 100% passing | ⚠️ Por verificar | ✅ Sí |### ✅ NO Negociables

- **79 archivos** TypeScript/React (app, components, lib)

- **502 KB** de código fuente| Coverage | ≥50% | ✅ Configurado | ❌ No |

- **6 specs** de tests (4 unit/integration, 2 E2E)

- **22 rutas** Next.js (18 estáticas, 4 dinámicas)| Build | Exitoso | ❌ Falla | ✅ Sí |1. **Supabase es la única fuente de verdad**



---| Audit high/critical | 0 | ✅ 0 | ✅ Sí |   - No modificar esquema, RLS ni políticas de seguridad



## 🎯 Gates de Calidad| Audit moderate | 0 | ⚠️ 3 | ❌ No |   - No duplicar datos fuera de BD



| Gate | Criterio | Estado Actual | Acción |

|------|----------|---------------|---------|

| **🔴 BLOCKER** | Build debe pasar sin errores | ✅ PASSING | ✅ Cumple |---2. **Contratos de API inmutables**

| **🔴 BLOCKER** | Tests unitarios > 70 passing | ✅ 73/73 (100%) | ✅ Cumple |

| **🔴 BLOCKER** | TypeScript 0 errors | ✅ 0 errors | ✅ Cumple |   - No cambiar endpoints ni estructuras de respuesta

| **🟡 WARNING** | Vulnerabilidades high/critical = 0 | ✅ 0 high/critical | ✅ Cumple |

| **🟡 WARNING** | Vulnerabilidades moderate ≤ 5 | ⚠️ 3 moderate | ✅ Cumple |## 🚀 Plan de Acción (Prioritario)   - Mantener retrocompatibilidad

| **🟢 OPTIONAL** | Coverage ≥ 50% | 🟡 No medido aún | Ejecutar `npm run test:coverage` |

| **🟢 OPTIONAL** | E2E tests passing | 🟡 No ejecutados | Ejecutar `npm run test:e2e` |

| **🟢 OPTIONAL** | Lighthouse Score ≥ 90 | 🟡 No medido | Configurar Lighthouse CI |

### Fase 1: Fix Build (CRÍTICO - 2h)3. **Backend intocable**

---

```tsx   - Solo frontend, tooling, tests y CI/CD

## 🚀 Quick Commands (Verificados)

// app/auth/login/page.tsx - Wrap con Suspense   - Edge Functions solo si no alteran contratos

### Development

```bashimport { Suspense } from 'react'

npm run dev              # Dev server en http://localhost:3000

npm run build            # Build production ✅ PASSING (1.5-2 min)export default function LoginPage() {4. **CI debe pasar siempre**

npm run start            # Start production server

npm run lint             # ESLint ✅ ACTIVE  return <Suspense fallback={<div>Loading...</div>}>   - Todos los tests deben pasar antes de merge

```

    <LoginForm />   - Coverage mínimo: 50% (objetivo: 80%)

### Testing

```bash  </Suspense>   - Lighthouse score mínimo: 90

npm run test:unit        # 73 tests ✅ PASSING (1.7s)

npm run test:integration # Integration tests}   - Zero vulnerabilidades críticas

npm run test:coverage    # Coverage report (threshold 50%)

npm run test:e2e         # Playwright E2E (6 navegadores)```

npm run test:e2e:ui      # Playwright con UI interactiva

npm run test:accessibility # Tests de accesibilidad (axe-core)---

npm run test:all         # Todos los tests (unit + E2E)

```### Fase 2: Security (2h)



### Security & Audit1. `npm audit fix` para tar## Agentes Disponibles

```bash

npm audit                     # Audit completo2. Configurar security headers en `next.config.mjs`

npm audit --audit-level=high  # Solo high/critical ✅ 0 found

npm audit fix                 # Fix automático (safe)3. Habilitar TypeScript/ESLint en build### 🧪 Testing Agent

npm audit fix --force         # Fix forzado (puede romper)

npx tsc --noEmit             # Verificar TypeScript ✅ 0 errors**Archivo:** [`testing.md`](./testing.md)

```

### Fase 3: Validación (1h)

---

```bash**Responsabilidades:**

## 📋 Plan de Acción Priorizado

npm run build       # ✅ Debe pasar- Tests unitarios (Jest + Testing Library)

### 🎯 Fase 1: Consolidación (COMPLETADA ✅)

npm run test:all    # ✅ Debe pasar- Tests de integración (API + Supabase)

**Objetivo:** Asegurar que el proyecto sea deployable y estable

npm audit           # ✅ 0 moderate- Tests E2E (Playwright multi-browser)

- [x] ✅ **Fix Suspense boundary** en `app/auth/login/page.tsx`

- [x] ✅ **Habilitar TypeScript checks** en `next.config.mjs````- Tests de accesibilidad (axe-core + WCAG 2.1 AA)

- [x] ✅ **Habilitar ESLint checks** en `next.config.mjs`

- [x] ✅ **Corregir 38 errores TypeScript** en app, components, lib- Visual regression (opcional)

- [x] ✅ **Fix tipos** (Lead, CotizacionConRelaciones, GalleryItemState)

- [x] ✅ **Fix error handling** (unknown → Error instance check)---

- [x] ✅ **Fix accessibility tests** (null → undefined)

- [x] ✅ **Verificar build** → ✅ PASSING**Cobertura mínima:**

- [x] ✅ **Verificar tests** → ✅ 73/73 PASSING

## ✅ Checklist Pre-Deploy- Servicios críticos: 80%

**Tiempo invertido:** ~2 horas  

**Estado:** ✅ **COMPLETADO**- Componentes UI: 60%



---```markdown- Utilidades: 90%



### 🎯 Fase 2: Security & Dependencies (SIGUIENTE)### Tests



**Objetivo:** Eliminar vulnerabilidades y actualizar dependencias- [ ] npm run test:unit → ✅ 73/73---



**Prioridad:** 🟡 ALTA (no bloqueante)- [ ] npm run test:e2e → ✅ passing



#### 2.1. Vulnerabilidades Next.js (3 moderate)- [ ] npm run test:coverage → ✅ ≥50%### ⚡ Performance Agent



```bash**Archivo:** [`performance.md`](./performance.md)

# Verificar detalles

npm audit### Build



# Opción 1: Fix safe (recomendado)- [ ] npm run build → ✅ exitoso**Responsabilidades:**

npm audit fix

- [ ] npx tsc --noEmit → ✅ 0 errors- Optimización de bundle size (< 200KB inicial)

# Opción 2: Fix forzado (puede romper)

npm audit fix --force  # Actualiza Next.js 15.2.4 → 15.5.6- [ ] npm run lint → ✅ 0 errors- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

npm run build          # Verificar que no rompió nada

npm run test:all       # Verificar tests- Lighthouse CI (score > 90)

```

### Security- Lazy loading de imágenes y componentes

**Vulnerabilidades actuales:**

1. **Next.js Cache Key Confusion** (GHSA-g5qg-72qw-gw5v) - Moderate- [ ] npm audit --audit-level=high → ✅ 0- Code splitting estratégico

2. **Next.js Content Injection** (GHSA-xv57-4mr9-wg8v) - Moderate

3. **Next.js SSRF in Middleware** (GHSA-4342-x723-ch2f) - Moderate- [ ] GitHub Actions: all green → ✅- Monitoreo con Vercel Analytics



**Riesgo:** BAJO (requiere condiciones específicas)  

**Fix:** `npm audit fix --force` instala Next.js 15.5.6

### Env Vars (Vercel)**Métricas objetivo:**

#### 2.2. Security Headers

- [ ] NEXT_PUBLIC_SUPABASE_URL → ✅- First Contentful Paint: < 1.8s

Agregar headers de seguridad en `next.config.mjs`:

- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY → ✅- Time to Interactive: < 3.5s

```javascript

// next.config.mjs```- Total Blocking Time: < 300ms

const nextConfig = {

  // ... config existente ...

  

  async headers() {------

    return [

      {

        source: '/:path*',

        headers: [## 📚 Documentación Completa### 🔒 Security Agent

          {

            key: 'Strict-Transport-Security',**Archivo:** [`security.md`](./security.md)

            value: 'max-age=63072000; includeSubDomains; preload'

          },| Archivo | Contenido | Tiempo |

          {

            key: 'X-Frame-Options',|---------|-----------|--------|**Responsabilidades:**

            value: 'SAMEORIGIN'

          },| [testing.md](./testing.md) | Tests: unit, E2E, a11y, coverage | 20 min |- Auditoría de dependencias (npm audit)

          {

            key: 'X-Content-Type-Options',| [performance.md](./performance.md) | Build, bundle, optimización | 25 min |- Análisis estático (CodeQL + ESLint security plugins)

            value: 'nosniff'

          },| [security.md](./security.md) | Audit, headers, secrets, RLS | 30 min |- Validación de RLS policies (sin modificar)

          {

            key: 'X-XSS-Protection',| [../ci/workflows.md](../ci/workflows.md) | GitHub Actions workflows | 15 min |- Detección de secretos expuestos

            value: '1; mode=block'

          },- Headers de seguridad (CSP, HSTS, X-Frame-Options)

          {

            key: 'Referrer-Policy',**Total lectura:** ~90 minutos- Rate limiting en APIs

            value: 'origin-when-cross-origin'

          },- Sanitización de inputs

          {

            key: 'Permissions-Policy',---

            value: 'camera=(), microphone=(), geolocation=()'

          },**Niveles de severidad:**

        ],

      },## 🆘 Troubleshooting Rápido- **Critical/High:** Bloquea CI ❌

    ]

  },- **Moderate:** Warning con ticket ⚠️

}

```### Build falla con suspense boundary- **Low:** Info, no bloquea ✅



**Verificación:**```tsx

```bash

npm run buildimport { Suspense } from 'react'---

npm run start

curl -I http://localhost:3000 | grep "X-Frame-Options"// Wrap componentes con useSearchParams/useRouter

```

```## Sintaxis de Invocación

#### 2.3. Secrets Scanning



```bash

# Instalar gitleaks### Tests E2E con ERR_CONNECTION_REFUSED### Asignar tarea a un agente específico

# Windows (PowerShell como admin)

$url = "https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_windows_x64.zip"```bash

Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\gitleaks.zip"

Expand-Archive -Path "$env:TEMP\gitleaks.zip" -DestinationPath "$env:USERPROFILE\bin"npm run dev  # Terminal 1```markdown



# Ejecutar scannpm run test:e2e  # Terminal 2@agent [nombre-agente]: [descripción de la tarea]

gitleaks detect --source . --verbose

``````

# Configurar pre-commit hook

npm install -D husky

npx husky install

npx husky add .husky/pre-commit "gitleaks protect --staged --verbose"### Coverage bajo### Ejemplos

```

```bash

**Tiempo estimado:** 3-4 horas  

**Beneficios:**npm run test:coverage```markdown

- ✅ 0 vulnerabilidades moderate+

- ✅ Security headers activosopen coverage/lcov-report/index.html@agent Testing: Crear tests E2E para flujo completo de cotización

- ✅ Secrets scanning automático

```@agent Performance: Optimizar bundle de página de catálogo

---

@agent Security: Auditar endpoint de creación de PDF para XSS

### 🎯 Fase 3: Testing Expansion (OPCIONAL)

---```

**Objetivo:** Aumentar coverage y confianza



**Prioridad:** 🟢 MEDIA (mejora continua)

## 📈 Métricas### Coordinar múltiples agentes

#### 3.1. Medir Coverage Actual



```bash

npm run test:coverage### Baseline Actual```markdown



# Ver reporte HTML- Tests: **73 passing** (100%)@agent Testing, Performance, Security: Validar feature de export CSV

open coverage/lcov-report/index.html  # Mac/Linux

start coverage/lcov-report/index.html # Windows- Build: **❌ Falla**```

```

- Vulnerabilities: **3 moderate**

**Meta:** ≥ 60% coverage (actualmente threshold 50%)

### Invocar checklist completo pre-release

#### 3.2. Ejecutar E2E Tests

### Objetivo Production

```bash

# Asegurarse que .env.local esté configurado- Tests: **100% passing + ≥60% coverage**```markdown

npm run build

npm run start &  # Background- Build: **✅ <3min**@QA: Ejecutar checklist completo de producción



# Ejecutar E2E- Vulnerabilities: **0 moderate/high/critical**```

npm run test:e2e

- Lighthouse: **≥90**

# Con UI interactiva

npm run test:e2e:ui---



# Solo accessibility---

npm run test:accessibility

```## Flujo de Trabajo QA



#### 3.3. Agregar Tests Faltantes**Última actualización:** 2025-11-03  



**Prioridades:****Estado:** Documentación basada en repo real### 1. Feature Development (Developer)

1. **Admin Services** (`lib/admin-services.ts`) - 0% coverage

2. **Supabase Client** (`lib/supabase-client.ts`) - 0% coverage

3. **Componentes Admin** (`components/admin/*`) - 0% coverage```

Developer implementa feature

**Ejemplo: Test de admin-services.ts**    ↓

```typescriptEjecuta tests locales

// tests/unit/admin-services.test.ts    ↓

import { getProductos, createProducto } from '@/lib/admin-services'Crea PR

```

describe('Admin Services - Productos', () => {

  test('debe retornar lista de productos', async () => {### 2. CI Automation (GitHub Actions)

    // Mock Supabase client

    const productos = await getProductos()```

    expect(productos.data).toBeDefined()PR abierto

    expect(Array.isArray(productos.data)).toBe(true)    ↓

  })┌─────────────────────────────────────┐

})│  Tests Unit/Integration (parallel)  │

```│  Tests E2E (Playwright)             │

│  Lighthouse CI                      │

**Tiempo estimado:** 5-8 horas  │  Security Audit (npm + CodeQL)      │

**Beneficios:**└─────────────────────────────────────┘

- ✅ Coverage 60%+    ↓

- ✅ Mayor confianza en refactors¿Todos pasaron? → NO → Bloquea merge ❌

- ✅ Documentación viva del código    ↓ SÍ

Review manual (opcional)

---    ↓

Merge a main ✅

### 🎯 Fase 4: Performance Optimization (OPCIONAL)```



**Objetivo:** Optimizar bundle size y Web Vitals### 3. Post-Merge Validation



**Prioridad:** 🟢 BAJA (nice to have)```

Deploy a Vercel Preview

#### 4.1. Bundle Analysis    ↓

Smoke tests en ambiente real

```bash    ↓

npm install -D @next/bundle-analyzerMonitoreo 24h (Analytics + Sentry)

    ↓

# next.config.mjsDeploy a producción

import bundleAnalyzer from '@next/bundle-analyzer'```



const withBundleAnalyzer = bundleAnalyzer({---

  enabled: process.env.ANALYZE === 'true',

})## Restricciones Absolutas



export default withBundleAnalyzer(nextConfig)### ❌ NO Permitido



# Analizar- Modificar esquema de Supabase o RLS policies

ANALYZE=true npm run build- Cambiar contratos de API o endpoints existentes

```- Alterar estructura de datos en BD

- Exponer secretos en código o logs

**Meta:** Reducir largest bundle de 264KB a < 200KB- Romper funcionalidad existente sin plan de migración

- Bajar umbrales de coverage sin aprobación

#### 4.2. Lighthouse CI- Merges sin que CI pase



```bash### ✅ SÍ Permitido

# Instalar Lighthouse CI

npm install -D @lhci/cli- Crear nuevos tests (unit, integration, E2E)

- Optimizar queries y bundle size

# Ejecutar- Agregar headers de seguridad

lhci autorun --config=lighthouserc.json- Refactorizar código con tests de regresión

```- Mejorar logging y observabilidad

- Automatizar checks de QA en CI

**Meta:** Score ≥ 90 en Performance, Accessibility, Best Practices- Agregar mocks/fixtures para tests



**Tiempo estimado:** 4-6 horas  ---

**Beneficios:**

- ✅ Mejor UX (carga más rápida)## Integración con CI/CD

- ✅ Mejor SEO

- ✅ Menor consumo de datos### Workflows Actuales



---```

.github/workflows/

## 🤝 Flujo de Trabajo├── tests-unit.yml         → Unit + Integration (Node 18, 20)

├── tests-e2e.yml          → Playwright multi-browser

### Para Desarrolladores└── security-audit.yml     → npm audit + CodeQL

```

1. **Branch desde main actualizada**

   ```bash### Gates de Calidad

   git checkout main

   git pull origin main| Gate               | Tool              | Umbral         | Bloquea CI |

   git checkout -b feature/mi-feature|--------------------|-------------------|----------------|------------|

   ```| Unit Tests         | Jest              | Coverage > 50% | ✅ SÍ      |

| E2E Tests          | Playwright        | 100% pass      | ✅ SÍ      |

2. **Desarrollo con validaciones**| Accessibility      | axe-core          | 0 violations   | ✅ SÍ      |

   ```bash| Bundle Size        | Next.js           | < 200KB        | ⚠️ Warning |

   npm run dev            # Desarrollar| Lighthouse         | Lighthouse CI     | Score > 90     | ⚠️ Warning |

   npm run lint           # Validar ESLint| Dependencies       | npm audit         | 0 high/critical| ✅ SÍ      |

   npx tsc --noEmit       # Validar TypeScript| Code Analysis      | CodeQL            | 0 high/critical| ✅ SÍ      |

   npm run test:unit      # Ejecutar tests

   ```### Crear nuevo workflow



3. **Pre-commit checklist**Ver: [`docs/ci/workflows.md`](../ci/workflows.md) para sintaxis completa.

   - [ ] `npm run build` → ✅ PASSING

   - [ ] `npm run test:unit` → ✅ 73+ tests passing---

   - [ ] `npx tsc --noEmit` → ✅ 0 errors

   - [ ] `npm run lint` → ✅ 0 errors## Troubleshooting

   - [ ] Commit con mensaje descriptivo

### Tests fallan localmente pero pasan en CI

4. **Push y PR**

   ```bash```bash

   git push -u origin feature/mi-feature# Limpiar cache de Jest

   # Crear PR en GitHubnpm run test -- --clearCache

   # Esperar checks de CI (tests-unit, tests-e2e, security-audit)

   ```# Verificar versión de Node (debe ser 18 o 20)

node --version

### Para QA

# Reinstalar dependencias

1. **Validar rama**rm -rf node_modules package-lock.json

   ```bashnpm install

   git checkout feature/rama-a-validar```

   npm install

   npm run build           # Debe pasar### E2E tests timeout

   npm run test:all        # Debe pasar

   ``````typescript

// Aumentar timeout en playwright.config.ts

2. **Tests manuales**timeout: 60 * 1000, // 60 segundos

   - Flujo de cotización completo

   - Login/logout// O específico por test

   - CRUD de productos/leadstest('flujo largo', async ({ page }) => {

   - Responsiveness (mobile, tablet, desktop)  test.setTimeout(120000); // 2 minutos

  // ...

3. **Reportar issues**});

   - Crear issue en GitHub con:```

     - Pasos para reproducir

     - Comportamiento esperado vs actual### Coverage no alcanza umbral

     - Screenshots/videos

     - Navegador y versión```bash

# Ver reporte detallado

---npm run test:coverage



## 📚 Recursos Adicionales# Abrir reporte HTML

open coverage/lcov-report/index.html

### Documentación Detallada```



- **[Testing Strategy](./testing.md)** - Inventario completo de 73 tests### Lighthouse score bajo

- **[Performance Guide](./performance.md)** - Build optimization y bundle analysis

- **[Security Guide](./security.md)** - Vulnerabilidades y hardening```bash

- **[CI/CD Workflows](../ci/workflows.md)** - GitHub Actions workflows# Ejecutar análisis local

npx lighthouse http://localhost:3000 --view

### Links Externos

# Ver recomendaciones específicas

- **[Next.js 15 Docs](https://nextjs.org/docs)** - App Router, RSC, Middlewarenpx lighthouse http://localhost:3000 --output=json

- **[Supabase Docs](https://supabase.com/docs)** - Auth, Database, Storage```

- **[Playwright Docs](https://playwright.dev)** - E2E testing

- **[Jest Docs](https://jestjs.io)** - Unit testing### Vulnerabilidades en dependencias

- **[Tailwind CSS Docs](https://tailwindcss.com/docs)** - Styling

```bash

---# Ver detalles de vulnerabilidades

npm audit

## 📞 Soporte

# Intentar fix automático (solo patches/minor)

**Problemas técnicos:**npm audit fix

- Revisar documentación en `docs/`

- Buscar en issues de GitHub# Fix con breaking changes (cuidado)

- Crear issue con template correspondientenpm audit fix --force



**Emergencias de producción:**# Si no se puede actualizar, agregar a ignore (justificado)

1. Verificar status de servicios (Vercel, Supabase)# Ver docs/agents/security.md

2. Revisar logs de aplicación```

3. Rollback a última versión estable si es necesario

---

---

## Checklist Pre-Release (Copiar/Pegar)

**Última revisión:** 2025-11-03 18:00 UTC-5  

**Próxima revisión:** Después de Fase 2 (Security & Dependencies)  ### 🧪 Testing

**Responsable:** QA Team  - [ ] Tests unitarios pasan (cobertura > 50%)

**Estado:** ✅ **PRODUCTION READY** (con 3 moderate vulnerabilities pendientes)- [ ] Tests de integración pasan

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
