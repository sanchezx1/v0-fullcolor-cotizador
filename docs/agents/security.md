# Security Agent 🔒 - FullColor Cotizador

> **Agente especializado en seguridad: Auditoría, Headers, Secrets, RLS**  
> **Estado:** ⚠️ 3 vulnerabilidades moderadas | Headers faltantes | Gitleaks pendiente  
> **Última verificación:** feature/qa-fixes-and-optimization (Nov 2025)

---

## 📊 Estado Actual (VERIFICADO)

```bash
$ npm audit --audit-level=moderate

⚠️ 3 moderate severity vulnerabilities

Package: next
Patched versions: >=15.5.6
Current: 15.2.4

Vulnerabilities:
1. GHSA-g5qg-72qw-gw5v - Cache Key Confusion in Next.js
2. GHSA-xv57-4mr9-wg8v - Content Injection in Next.js Server Actions
3. GHSA-4342-x723-ch2f - SSRF in Next.js Middleware

Fix available:
  npm audit fix --force
  (Will update Next.js 15.2.4 → 15.5.6)
```

**Baseline verificado:**
- ⚠️ **Vulnerabilidades:** 3 MODERATE en Next.js (0 high/critical)
- ✅ **Build:** PASSING con validaciones activas
- ✅ **RLS Policies:** Activas en Supabase (no modificables per RULES.md)
- ❌ **Security headers:** No configurados en middleware
- ❌ **Secrets scan:** Gitleaks no implementado
- ❌ **Rate limiting:** No implementado
- ⚠️ **Dependabot:** Habilitado en GitHub (auto-PRs)

---\n\n> Nota (2025-11-04): Next.js se actualizó a 15.5.6, los headers de seguridad están activos y el rate limiting básico ya corre en middleware. Las secciones históricas siguientes se conservan como referencia para futuros agentes.\n\n## 🎯 Objetivo

Implementar **postura de seguridad robusta** sin romper contratos:

1. ✅ **Zero vulns críticas/altas** - Actualmente cumplido (solo 3 moderate)
2. 🔄 **OWASP Top 10** - Parcialmente cubierto (XSS, CSRF protegidos por Next.js)
3. ✅ **RLS Policies** - Activas en Supabase (validar, no modificar)
4. ❌ **Security headers** - CSP, HSTS, X-Frame-Options faltantes
5. 🟡 **Secrets management** - `.env.local` no commitido, pero sin escaneo
6. ✅ **Rate limiting** - Middleware básico activo (auth/api/admin)
7. 🟡 **Monitoreo continuo** - Dependabot ✅, Gitleaks ❌, Snyk ❌

---

## 🔍 Inventario de Vulnerabilidades (REAL)

### 🟡 Vulnerabilidades Actuales (3 MODERATE)

#### 1. **GHSA-g5qg-72qw-gw5v** - Cache Key Confusion in Next.js
- **Package:** `next@15.2.4`
- **Severity:** MODERATE
- **Description:** Cache key confusion vulnerability in Next.js server-side cache
- **Impact:** Potential information leakage between different users via cache
- **Affected versions:** 15.0.0-canary.0 - 15.4.6
- **Fixed in:** ≥15.5.6
- **Workaround:** None (upgrade required)
- **Status:** ✅ RESUELTO (Nov 2025)

**Detalles técnicos:**
```
When using Next.js server-side caching with certain cache keys,
there's a possibility of cache key collision that could lead to
serving cached content intended for one user to another user.
```

---

#### 2. **GHSA-xv57-4mr9-wg8v** - Content Injection in Next.js Server Actions
- **Package:** `next@15.2.4`
- **Severity:** MODERATE
- **Description:** Content injection vulnerability in Next.js Server Actions
- **Impact:** Attacker could inject malicious content via Server Actions
- **Affected versions:** 15.0.0-canary.0 - 15.4.6
- **Fixed in:** ≥15.5.6
- **Workaround:** Validate all Server Action inputs
- **Status:** ✅ RESUELTO (Nov 2025) (mitigado con validaciones)

**Nuestro uso de Server Actions:**
```typescript
// app/admin/productos/nuevo/page.tsx
// app/admin/cotizaciones/page.tsx
// Todos validan inputs con Zod schemas ✅
```

---

#### 3. **GHSA-4342-x723-ch2f** - SSRF in Next.js Middleware
- **Package:** `next@15.2.4`
- **Severity:** MODERATE
- **Description:** Server-Side Request Forgery vulnerability in Next.js middleware
- **Impact:** Attacker could make server perform requests to internal resources
- **Affected versions:** 15.0.0-canary.0 - 15.4.6
- **Fixed in:** ≥15.5.6
- **Workaround:** Validate all URLs in middleware redirects
- **Status:** ✅ RESUELTO (Nov 2025)

**Nuestro middleware:**
```typescript
// middleware.ts
// Solo hace redirects a rutas conocidas (/auth/login, /admin)
// No usa input de usuario en redirects ✅
```

---

### ✅ Fix Disponible

```bash
# Actualizar Next.js automáticamente
npm audit fix --force

# Esto actualizará:
# next: 15.2.4 → 15.5.6
```

**⚠️ IMPORTANTE:** Verificar compatibilidad:
- React 19 es compatible con Next.js 15.5.6 ✅
- Supabase SSR compatible ✅
- Tailwind CSS compatible ✅

**Esfuerzo:** 30 min (update + verificar build + tests)  
**Prioridad:** 🔴 ALTA (hacer esta semana)

---

## 🛡️ Security Headers (COMPLETADO)

### Estado Actual

**Verificación:**
```bash
curl -I https://[tu-dominio].vercel.app

# Actualmente NO hay headers de seguridad:
# ❌ Content-Security-Policy
# ❌ Strict-Transport-Security (HSTS)
# ❌ X-Frame-Options
# ❌ X-Content-Type-Options
# ❌ Referrer-Policy
# ❌ Permissions-Policy
```

---

### Solución: Middleware con Headers

**Archivo:** `middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Crear response
  const response = NextResponse.next()
  
  // 1. Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
      "frame-ancestors 'none'",
    ].join('; ')
  )
  
  // 2. Strict-Transport-Security (HTTPS only)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  
  // 3. X-Frame-Options (previene clickjacking)
  response.headers.set('X-Frame-Options', 'DENY')
  
  // 4. X-Content-Type-Options (previene MIME sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // 5. Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // 6. Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  // ... resto del middleware (auth, etc.)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and _next
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Esfuerzo:** 1 hora  
**Beneficio:** +10-15 puntos en Lighthouse Security  
**Prioridad:** 🔴 ALTA

---

## 🔐 Secrets Management

### ✅ Actual (Correcto)

```bash
# .env.local (NOT committed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# .gitignore
.env.local ✅
.env*.local ✅
```

**Verificado:**
- ✅ `.env.local` en `.gitignore`
- ✅ No hay secrets en código
- ✅ Variables públicas con prefijo `NEXT_PUBLIC_`
- ✅ Service role key NO expuesta en frontend

---

### ❌ Faltante: Gitleaks (Secrets Scanning)

**Problema:** No hay escaneo automático de secrets en commits/PRs

**Solución:**

1. **Pre-commit hook local:**
```bash
# Instalar gitleaks
brew install gitleaks  # macOS
# o
choco install gitleaks  # Windows

# Crear .gitleaks.toml
title = "FullColor Secrets Scan"

[extend]
useDefault = true

[[rules]]
id = "supabase-key"
description = "Supabase Keys"
regex = '''eyJhbGc[A-Za-z0-9_-]*'''
tags = ["secret", "supabase"]
```

2. **GitHub Actions:**
```yaml
# .github/workflows/secrets-scan.yml
name: Secrets Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Esfuerzo:** 2 horas  
**Prioridad:** 🔴 ALTA

---

## 🚦 Rate Limiting (FALTANTE)

### Problema

**Endpoints sin rate limit:**
- `/api/send-email` - Puede ser abusado para spam
- `/api/generate-pdf` - Computacionalmente costoso
- `/api/revalidate` - Puede causar DDoS en cache

**Riesgo:** Abuse, DDoS, spam

---

### Solución: Vercel Edge Config + Upstash

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})
```

```typescript
// app/api/send-email/route.ts
import { ratelimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Get IP from headers
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  
  // Check rate limit
  const { success, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': '10'
        }
      }
    )
  }
  
  // ... send email
}
```

**Setup:**
1. Crear cuenta Upstash (free tier: 10k requests/day)
2. Crear Redis database
3. Agregar env vars:
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```
4. Instalar: `npm install @upstash/ratelimit @upstash/redis`

**Esfuerzo:** 3 horas  
**Prioridad:** 🟡 MEDIA

---

## ✅ Seguridad ya Implementada

### 1. **RLS Policies en Supabase** ✅

**Verificado en RULES.md:**
```sql
-- Usuarios solo ven sus propias cotizaciones
-- Admins ven todas las cotizaciones
-- Productos públicos para todos
-- Configuración solo para admins
```

**🚨 REGLA:** NO modificar RLS policies (Supabase es fuente de verdad)

---

### 2. **Validación de Inputs con Zod** ✅

```typescript
// Todos los formularios usan Zod schemas
const leadSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().regex(/^\+593/),
  // ...
})
```

**Protección contra:**
- XSS (React escapa por defecto + validación)
- SQL Injection (Supabase usa prepared statements)
- Type coercion attacks

---

### 3. **CSRF Protection** ✅

Next.js Server Actions tienen protección CSRF integrada:
- Origin header validation
- SameSite cookies
- Double submit cookie pattern

---

### 4. **Authentication con Supabase** ✅

```typescript
// middleware.ts protege rutas /admin/*
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()

if (!user && request.nextUrl.pathname.startsWith('/admin')) {
  return NextResponse.redirect('/auth/login')
}
```

---

## 📋 Checklist de Seguridad

### ✅ Pre-commit
```bash
# 1. Lint
npm run lint

# 2. Type check
npm run type-check

# 3. Secrets scan (después de implementar gitleaks)
gitleaks detect --source . --verbose
```

### ✅ Pre-PR
```bash
# 1. Audit vulnerabilities
npm audit

# 2. Build
npm run build

# 3. Tests
npm run test:unit
```

### ✅ Pre-deploy
```bash
# 1. Audit critical/high only
npm audit --audit-level=high

# 2. Verificar headers (después de implementar)
curl -I https://preview-url.vercel.app | grep -E "Content-Security|X-Frame"

# 3. Smoke test auth
# Verificar que /admin redirige a /login sin sesión
```

---

## 🎯 Plan de Acción Inmediato

### Fase 1: Vulnerabilidades (30 min)

```bash
# 1. Update Next.js
npm audit fix --force

# 2. Verificar build
npm run build

# 3. Verificar tests
npm run test:unit

# 4. Commit
git add package.json package-lock.json
git commit -m "fix: update Next.js to 15.5.6 (3 moderate vulnerabilities)"
```

---

### Fase 2: Security Headers (1 hora)

1. Editar `middleware.ts`
2. Agregar headers (ver código arriba)
3. Deploy a preview
4. Verificar headers:
   ```bash
   curl -I https://preview-url.vercel.app
   ```
5. Test que no rompe funcionalidad

---

### Fase 3: Gitleaks (2 horas)

1. Instalar gitleaks localmente
2. Crear `.gitleaks.toml`
3. Escanear repo actual:
   ```bash
   gitleaks detect --source . --verbose
   ```
4. Si encuentra secrets, rotarlos en Supabase
5. Crear GitHub Action (ver código arriba)
6. Test en PR

---

### Fase 4: Rate Limiting (3 horas) - OPCIONAL

1. Crear cuenta Upstash
2. Crear Redis database
3. Agregar env vars
4. Instalar `@upstash/ratelimit`
5. Implementar en `/api/send-email`
6. Test con 20 requests rápidas

---

## 🚀 Comandos Disponibles

```bash
# Audit vulnerabilities
npm audit
npm audit --audit-level=moderate
npm audit --audit-level=high

# Fix vulnerabilities (auto)
npm audit fix

# Fix vulnerabilities (force major updates)
npm audit fix --force

# Outdated packages
npm outdated

# Gitleaks (después de instalar)
gitleaks detect --source . --verbose
gitleaks protect --staged --verbose  # pre-commit

# Headers check
curl -I https://[tu-dominio].vercel.app | grep -E "Content-Security|X-Frame|Strict-Transport"
```

---

## 🎓 Recursos

### Documentación oficial
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)

### Herramientas
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [Dependabot](https://github.com/dependabot)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)

---

## 📊 Métricas Objetivo

| Métrica | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| **Critical/High vulns** | 0 | 0 | ✅ CUMPLE |
| **Moderate vulns** | 0 | 0 | ✅ CUMPLE |
| **Security headers** | 6/6 | 6/6 | ✅ CUMPLE |
| **Gitleaks en CI** | ❌ | ✅ | 🔴 Falta |
| **Rate limiting** | ✅ | ✅ | ✅ CUMPLE |
| **RLS active** | ✅ | ✅ | ✅ CUMPLE |
| **Dependabot** | ✅ | ✅ | ✅ CUMPLE |

---

## 🚨 Reglas de Oro

1. **🔴 NUNCA commitear secrets** - Usar .env.local siempre
2. **🔴 NUNCA deshabilitar RLS** - Es la fuente de verdad (per RULES.md)
3. **🔴 SIEMPRE validar inputs** - Usar Zod schemas
4. **🟡 ACTUALIZAR dependencias** - Cada 2 semanas
5. **🟡 ESCANEAR secrets** - Pre-commit con gitleaks

---

## 🤖 Sintaxis de Invocación del Agente

```bash
@agent Security: [descripción de la tarea de seguridad]
```

**Ejemplos:**
```bash
@agent Security: Actualizar Next.js para resolver 3 vulnerabilidades moderadas
@agent Security: Implementar security headers en middleware ✅ (Nov 2025)
@agent Security: Configurar gitleaks en GitHub Actions
@agent Security: Agregar rate limiting a /api/send-email ✅ (Nov 2025)
@agent Security: Auditar RLS policies en Supabase (validar, no modificar)
```

---

**Última actualización:** Nov 2025 | **Branch:** feature/qa-fixes-and-optimization  
**Estado:** ⚠️ 3 vulns moderadas (fix disponible) | ❌ Headers faltantes | ❌ Gitleaks pendiente

To address all issues, run:- **Static analysis** (CodeQL, ESLint security plugins)

  npm audit fix --force- **Secret scanning** (detección de API keys, tokens expuestos)

```- **Security headers** (CSP, HSTS, X-Frame-Options, etc.)

- **Input sanitization** (XSS, SQL injection prevention)

**Contexto:** `supabase` es **devDependency** (CLI), no afecta producción directamente.- **RLS policy validation** (sin modificar, solo verificar)

- **Authentication checks** (JWT validation, session management)

---- **Rate limiting** estratégico

- **CORS configuration** adecuada

## 🎯 Objetivo- **Security.txt** y disclosure policy



Sistema seguro production-ready:### ❌ Excluido

- **0 vulnerabilidades** high/critical

- **0 vulnerabilidades moderate** (o documentadas y aceptadas)- **Penetration testing** completo (requiere especialistas externos)

- **Security headers** configurados (CSP, HSTS, X-Frame-Options)- **Infrastructure security** de Supabase (responsabilidad de Supabase)

- **Secrets scanning** automatizado- **DDoS mitigation** avanzado (responsabilidad de Vercel)

- **RLS policies** validadas- **Compliance audits** (GDPR, HIPAA, etc. - requiere legal)

- **Variables de entorno** sanitizadas- **Modificación de RLS policies** (fuera de alcance por diseño)



------



## 📦 Alcance## Herramientas



### ✅ Seguridad Existente### Stack Principal



#### 1. GitHub Actions Security Workflows| Herramienta | Propósito | Versión/Plan |

**Archivo:** `.github/workflows/security-audit.yml` (129 líneas)|-------------|-----------|--------------|

| **npm audit** | Auditoría de dependencias | Built-in |

**Jobs activos:**| **GitHub CodeQL** | Análisis estático de código | Free (GitHub Actions) |

| **GitHub Dependabot** | Alertas de vulnerabilidades | Free |

```yaml| **ESLint Security Plugin** | Linting de seguridad | Latest |

1. dependency-audit:| **OWASP ZAP** | Proxy de seguridad (opcional) | Open Source |

   - npm audit (audit-level=moderate)| **git-secrets** | Detección de secretos en commits | Open Source |

   - Genera audit-report.json

   - Sube artifacts### Alternativas Consideradas

   

2. dependency-review:- **Snyk:** Excelente pero requiere plan de pago para CI

   - Solo en PRs- **SonarQube:** Completo pero pesado de configurar

   - Usa actions/dependency-review-action@v3- **Trivy:** Bueno para containers (no aplica directamente)

   - fail-on-severity: moderate- **GitGuardian:** Detección de secretos (premium)

   

3. codeql-analysis:### Configuración Actual

   - JavaScript + TypeScript scanning

   - github/codeql-action/init@v2```yaml

   - github/codeql-action/analyze@v2# .github/workflows/security-audit.yml (ya existe)

   - npm audit --audit-level=moderate

4. performance-check:- CodeQL analysis

   - Build para producción- Dependency Review Action

   - Analiza bundle size```

   - Busca datos sensibles en build:

     grep -r "password|secret|api_key" .next/static---

```

## Entregables

**Frecuencia:**

- Push/PR a `main` o `develop`### 1. Dependency Security

- **Semanal:** Lunes 00:00 UTC (cron)

**Niveles de Severidad:**

---

| Nivel | Acción | Bloquea CI | Plazo Fix |

#### 2. Variables de Entorno Verificadas|-------|--------|------------|-----------|

**Archivo:** `tests/setup/jest.setup.ts`| **Critical** | Fix inmediato | ✅ SÍ | 24h |

| **High** | Fix urgente | ✅ SÍ | 7 días |

```typescript| **Moderate** | Evaluar y fix | ⚠️ Warning | 30 días |

// Mock de variables de entorno para tests| **Low** | Documentar | ❌ NO | Backlog |

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'**Comandos:**

```

```bash

**Variables requeridas (cliente):**# Auditoría completa

- `NEXT_PUBLIC_SUPABASE_URL` ✅ Presente en códigonpm audit

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ Presente en código

# Solo high/critical

**Variables prohibidas (cliente):**npm audit --audit-level=high

- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Verificar ausencia

# Generar reporte JSON

---npm audit --json > audit-report.json



#### 3. RLS Policies (Según RULES.md)# Fix automático (solo patches/minor)

**Estado:** ✅ Activasnpm audit fix



```markdown# Fix con breaking changes (cuidado!)

# De RULES.md:npm audit fix --force

"RLS activas. Lectura pública solo del catálogo si el negocio lo permite; ```

escrituras via server/edge."

```**Proceso de remediación:**



**Tablas con RLS:**```bash

- `productos`: Lectura pública ✅# 1. Identificar vulnerabilidad

- `precios_escalonados`: Lectura pública ✅npm audit

- `leads`: Solo escritura server ✅

- `cotizaciones`: Solo escritura server ✅# 2. Ver detalles

- `items_cotizacion`: Solo escritura server ✅npm audit --json | jq '.vulnerabilities'

- `eventos`: Solo escritura server ✅

# 3. Actualizar dependencia específica

---npm update <package-name>



### ⚠️ Issues de Seguridad Identificados# 4. Si no hay fix disponible, evaluar:

#    a) ¿Es realmente usada la funcionalidad vulnerable?

#### 1. Vulnerabilidades npm audit (MODERATE)#    b) ¿Hay alternativa?

**Issue:** 3 moderate en `tar@7.5.1` (dependencia de `supabase` CLI)#    c) ¿Podemos esperar a patch?



**Riesgo:** BAJO (solo devDependency, no afecta producción)# 5. Documentar decisión

# Crear issue en GitHub con justificación

**Solución 1 (Conservadora):**```

```bash

npm audit fix**Excepciones permitidas (documentadas):**

# Si no resuelve, esperar actualización de supabase CLI

``````json

// .npmauditignore (si es absolutamente necesario)

**Solución 2 (Forzada - cuidado):**{

```bash  "exceptions": [

npm audit fix --force    {

# Puede actualizar next@15.5.6 (fuera del rango especificado)      "id": "GHSA-xxxx-yyyy-zzzz",

```      "reason": "No afecta nuestra implementación (solo devDependency)",

      "expires": "2025-12-31",

**Decisión:** Ejecutar `npm audit fix` primero. Si persiste, documentar y aceptar riesgo hasta actualización de `supabase` CLI.      "approvedBy": "Security Team"

    }

---  ]

}

#### 2. Security Headers No Configurados ❌```

**Archivo:** `next.config.mjs`

**[PENDIENTE]** Configurar:

**Estado actual:** Headers desplegados (CSP, HSTS, XFO, Permissions-Policy)- Dependabot auto-merge para patches de seguridad

- Alertas por email/Slack para vulnerabilidades críticas

**Solución:**- Policy de SLA para fixes

```javascript

// next.config.mjs---

const nextConfig = {

  async headers() {### 2. Static Code Analysis (CodeQL)

    return [

      {**Configuración existente:**

        source: '/:path*',

        headers: [```yaml

          {# .github/workflows/security-audit.yml

            key: 'X-DNS-Prefetch-Control',codeql-analysis:

            value: 'on'  strategy:

          },    matrix:

          {      language: ['javascript', 'typescript']

            key: 'Strict-Transport-Security',```

            value: 'max-age=63072000; includeSubDomains; preload'

          },**Queries personalizadas (opcional):**

          {

            key: 'X-Frame-Options',```yaml

            value: 'SAMEORIGIN'# .github/codeql/codeql-config.yml

          },name: "CodeQL Config"

          {queries:

            key: 'X-Content-Type-Options',  - uses: security-and-quality

            value: 'nosniff'  - uses: security-extended

          },

          {query-filters:

            key: 'X-XSS-Protection',  - exclude:

            value: '1; mode=block'      id: js/unused-local-variable

          },```

          {

            key: 'Referrer-Policy',**Vulnerabilidades a detectar:**

            value: 'origin-when-cross-origin'

          },- ✅ **SQL Injection** (aunque usamos Supabase con prepared statements)

          {- ✅ **XSS** (Cross-Site Scripting)

            key: 'Permissions-Policy',- ✅ **Path Traversal**

            value: 'camera=(), microphone=(), geolocation=()'- ✅ **Code Injection**

          },- ✅ **Insecure Randomness**

        ],- ✅ **Hardcoded Credentials**

      },- ✅ **Weak Cryptography**

    ]

  },**False positives:**

}

``````typescript

// Si CodeQL marca false positive, documentar

**Verificación:**// codeql[javascript/sql-injection]

```bash// Safe: using Supabase parameterized queries

npm run buildconst { data } = await supabase

npm run start  .from('productos')

curl -I http://localhost:3000 | grep -E "X-|Strict-|Referrer"  .select('*')

```  .eq('id', userInput) // Safe: Supabase sanitiza automáticamente

```

---

---

#### 3. CSP (Content Security Policy) ⚠️

**Estado:** No configurado### 3. Secret Scanning



**Solución (restrictiva):****GitHub Secret Scanning (ya activo en repos públicos/privados con Advanced Security):**

```javascript

// next.config.mjsDetecta automáticamente:

const cspHeader = `- AWS credentials

  default-src 'self';- Azure tokens

  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;- Google Cloud keys

  style-src 'self' 'unsafe-inline';- Supabase keys (si están en patterns conocidos)

  img-src 'self' blob: data: https:;- Private keys (SSH, PGP)

  font-src 'self';

  object-src 'none';**git-secrets (local enforcement):**

  base-uri 'self';

  form-action 'self';```bash

  frame-ancestors 'none';# Instalar git-secrets

  upgrade-insecure-requests;# macOS

`brew install git-secrets



headers: [# Windows (PowerShell)

  {# Descargar desde: https://github.com/awslabs/git-secrets

    key: 'Content-Security-Policy',

    value: cspHeader.replace(/\n/g, ''),# Configurar en el repo

  },git secrets --install

]git secrets --register-aws

```

# Agregar patterns custom

**Nota:** Ajustar según recursos externos (Supabase, Vercel Analytics, etc.)git secrets --add 'NEXT_PUBLIC_SUPABASE_ANON_KEY=[A-Za-z0-9]+'

git secrets --add 'SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9]+'

---

# Escanear repo completo

#### 4. Secrets Scanning No Configurado ⚠️git secrets --scan-history

**Estado:** No hay pre-commit hook ni gitleaks```



**Solución:****Pre-commit hook:**



**Opción 1: Gitleaks (Pre-commit)**```bash

```bash# .husky/pre-commit (si usas husky)

# Instalar gitleaks#!/bin/sh

brew install gitleaks  # macOS. "$(dirname "$0")/_/husky.sh"

# O descargar desde https://github.com/gitleaks/gitleaks/releases

# Verificar secretos antes de commit

# Crear .gitleaks.toml (ya existe en repo?)git secrets --pre_commit_hook -- "$@"

# O usar configuración default```



# Pre-commit hook**Validación de variables de entorno:**

# .husky/pre-commit

gitleaks protect --staged --verbose```typescript

```// lib/env.ts

import { z } from 'zod'

**Opción 2: GitHub Action (Secret Scanning)**

```yamlconst envSchema = z.object({

# .github/workflows/secrets-scan.yml  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

name: Secrets Scanning  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),

  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32).optional(), // Solo server

on: [push, pull_request]})



jobs:// ❌ Validar en build time

  scan:try {

    runs-on: ubuntu-latest  envSchema.parse(process.env)

    steps:} catch (error) {

      - uses: actions/checkout@v4  console.error('❌ Invalid environment variables:', error)

        with:  process.exit(1)

          fetch-depth: 0}

      

      - name: Gitleaks// ✅ Helper para client-safe env

        uses: gitleaks/gitleaks-action@v2export function getPublicEnv() {

        env:  return {

          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,

```    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

  }

---}



#### 5. Service Role Key Exposure ⚠️// ✅ Helper para server-only env

**Riesgo:** Exponer `SUPABASE_SERVICE_ROLE_KEY` en clienteexport function getServerEnv() {

  if (typeof window !== 'undefined') {

**Verificación:**    throw new Error('❌ Server env accessed from client!')

```bash  }

# Buscar en código cliente  

grep -r "SERVICE_ROLE" app/ components/ src/ --exclude-dir=node_modules  return {

grep -r "service.*role" app/ components/ src/ -i --exclude-dir=node_modules    ...getPublicEnv(),

    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

# Verificar .env.example  }

cat .env.example | grep SERVICE_ROLE}

``````



**Debe retornar:** Vacío (no debe estar en código cliente)**Checklist de secretos:**



**Si aparece:** Mover a Edge Function o API Route (server-side only)- [ ] `.env.local` en `.gitignore`

- [ ] `.env.example` sin valores reales

---- [ ] Service Role Key NUNCA en cliente

- [ ] API keys con scopes mínimos

### 🔧 Herramientas- [ ] Secrets rotados cada 90 días (manual)

- [ ] git-secrets configurado localmente

#### Análisis de Dependencias

- **npm audit**: Built-in npm security auditing---

- **GitHub Dependency Review**: Automático en PRs

- **CodeQL**: Static analysis (JS/TS)### 4. Security Headers

- **Dependabot**: Automático en GitHub (si está habilitado)

**Configuración en Next.js:**

#### Secrets Scanning

- **gitleaks**: Pre-commit hook para detectar secrets```javascript

- **git-secrets**: Alternativa de AWS// next.config.mjs

- **truffleHog**: Alternativa para buscar en historialconst securityHeaders = [

  {

#### Security Headers    key: 'X-DNS-Prefetch-Control',

- **Security Headers Scanner**: https://securityheaders.com/    value: 'on',

- **Mozilla Observatory**: https://observatory.mozilla.org/  },

  {

---    key: 'Strict-Transport-Security',

    value: 'max-age=63072000; includeSubDomains; preload',

## 📝 Comandos Disponibles  },

  {

### Dependency Audit    key: 'X-Frame-Options',

```bash    value: 'SAMEORIGIN', // Previene clickjacking

# Audit completo  },

npm audit  {

    key: 'X-Content-Type-Options',

# Solo moderate o superior    value: 'nosniff', // Previene MIME sniffing

npm audit --audit-level=moderate  },

  {

# Solo high/critical    key: 'X-XSS-Protection',

npm audit --audit-level=high    value: '1; mode=block', // Legacy, pero no hace daño

  },

# Fix automático  {

npm audit fix    key: 'Referrer-Policy',

    value: 'strict-origin-when-cross-origin',

# Fix forzado (cuidado: puede romper)  },

npm audit fix --force  {

    key: 'Permissions-Policy',

# Generar reporte JSON    value: 'camera=(), microphone=(), geolocation=()', // Deshabilitar APIs no usadas

npm audit --json > audit-report.json  },

  {

# Ver detalles de un paquete    key: 'Content-Security-Policy',

npm audit | grep -A 10 "tar"    value: [

```      "default-src 'self'",

      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live", // Vercel Analytics

---      "style-src 'self' 'unsafe-inline'", // Tailwind necesita inline styles

      "img-src 'self' data: https://*.supabase.co blob:", // Supabase Storage

### TypeScript & Linting      "font-src 'self' data:",

```bash      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",

# TypeScript check (sin generar archivos)      "frame-ancestors 'self'",

npx tsc --noEmit      "base-uri 'self'",

      "form-action 'self'",

# ESLint    ].join('; '),

npm run lint  },

]

# ESLint con auto-fix

npm run lint -- --fixmodule.exports = {

  async headers() {

# ESLint en archivo específico    return [

npm run lint -- app/auth/login/page.tsx      {

```        source: '/:path*',

        headers: securityHeaders,

---      },

    ]

### Secrets Scanning  },

```bash}

# Gitleaks - Scan completo```

gitleaks detect --source . --verbose

**Validar headers:**

# Gitleaks - Solo staged files (pre-commit)

gitleaks protect --staged --verbose```bash

# Con curl

# Buscar patterns específicoscurl -I https://your-app.vercel.app

grep -r "sk_live_" . --exclude-dir=node_modules

grep -r "AKIA[0-9A-Z]{16}" . --exclude-dir=node_modules# Con securityheaders.com

grep -r "ghp_[a-zA-Z0-9]{36}" . --exclude-dir=node_modules# https://securityheaders.com/?q=your-app.vercel.app&followRedirects=on

```

# Con Mozilla Observatory

---# https://observatory.mozilla.org/

```

### RLS Validation

```bash**Objetivos de score:**

# Verificar RLS habilitado (desde Supabase Dashboard o SQL)

# Conectarse a Supabase y ejecutar:- **securityheaders.com:** A+ (mínimo A)

- **Mozilla Observatory:** A+ (mínimo B+)

SELECT tablename, rowsecurity 

FROM pg_tables **[PENDIENTE]** Ajustar CSP según necesidades reales:

WHERE schemaname = 'public';- Verificar si Vercel Analytics necesita ajustes

- Confirmar dominios de Supabase Storage

# Debe mostrar rowsecurity = true para todas las tablas críticas- Agregar nonce/hash para scripts inline si es necesario

```

---

---

### 5. Input Sanitization & Validation

### Environment Variables

```bash**Principio:** Never trust user input.

# Verificar variables en build

npm run build 2>&1 | grep "NEXT_PUBLIC"#### XSS Prevention



# Verificar NO exponer SERVICE_ROLE```typescript

grep -r "SERVICE_ROLE" .next/static  # Debe retornar vacío// ❌ MAL: Renderizar HTML raw

```<div dangerouslySetInnerHTML={{ __html: userInput }} />



---// ✅ BIEN: React escapa automáticamente

<div>{userInput}</div>

## 🎯 Plan de Acción

// ✅ Si necesitas HTML, sanitizar primero

### Fase 1: Resolver Vulnerabilidades (1 hora)import DOMPurify from 'isomorphic-dompurify'



#### 1.1 Ejecutar npm audit fixconst SafeHTML = ({ html }: { html: string }) => {

```bash  const sanitized = DOMPurify.sanitize(html, {

npm audit fix    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],

npm audit --audit-level=moderate    ALLOWED_ATTR: ['href'],

```  })

  

**Resultado esperado:** Vulnerabilidades resueltas o reducidas  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />

}

**Si persisten:** Documentar y justificar en `SECURITY.md````



---#### SQL Injection Prevention



#### 1.2 Verificar Build Después de Fix```typescript

```bash// ✅ Supabase usa prepared statements automáticamente

npm run buildconst { data } = await supabase

npm run test:all  .from('productos')

```  .select('*')

  .eq('nombre', userInput) // Safe: Supabase sanitiza

**Si falla:** Revertir y buscar alternativa

// ❌ NUNCA hacer esto (aunque Supabase lo previene)

---// await supabase.rpc('raw_sql', { query: `SELECT * FROM productos WHERE nombre = '${userInput}'` })

```

### Fase 2: Configurar Security Headers (2 horas)

#### Path Traversal Prevention

#### 2.1 Agregar Headers Básicos

```javascript```typescript

// next.config.mjs - Headers sin CSP (menos restrictivo)// ❌ MAL: Usar input directamente en paths

```const file = fs.readFileSync(`./uploads/${userInput}`)



#### 2.2 Verificar Headers// ✅ BIEN: Validar y sanitizar

```bashimport path from 'path'

npm run build

npm run start &function getUploadPath(filename: string) {

curl -I http://localhost:3000  // Normalizar y validar

  const normalized = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '')

# Debe mostrar:  const fullPath = path.join('./uploads', normalized)

# X-Frame-Options: SAMEORIGIN  

# Strict-Transport-Security: max-age=63072000  // Verificar que está dentro del directorio permitido

# etc.  if (!fullPath.startsWith(path.resolve('./uploads'))) {

```    throw new Error('Invalid path')

  }

#### 2.3 Escanear con Herramienta Online  

```bash  return fullPath

# Abrir en navegador}

https://securityheaders.com/?q=https://tu-dominio.vercel.app```

```

#### Email Validation

**Objetivo:** Grade A o A+

```typescript

---// ✅ Usar Zod para validación robusta

import { z } from 'zod'

#### 2.4 Implementar CSP (Avanzado)

**Nota:** Solo después de verificar que headers básicos funcionanconst emailSchema = z.string().email().toLowerCase().trim()



```javascript// En formularios

// next.config.mjs - Agregar CSP headerconst formSchema = z.object({

```  email: emailSchema,

  telefono: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format

**Verificar en navegador:**  nombre: z.string().min(2).max(100).trim(),

- Console no debe mostrar errores CSP})

- App funciona correctamente```



---#### File Upload Validation



### Fase 3: Secrets Scanning (2 horas)```typescript

// components/admin/ImageUpload.tsx

#### 3.1 Instalar Gitleaksconst ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

```bashconst MAX_SIZE = 5 * 1024 * 1024 // 5MB

# macOS

brew install gitleaksfunction validateFile(file: File) {

  if (!ALLOWED_TYPES.includes(file.type)) {

# Linux    throw new Error('Tipo de archivo no permitido')

wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz  }

tar -xzf gitleaks_8.18.0_linux_x64.tar.gz  

sudo mv gitleaks /usr/local/bin/  if (file.size > MAX_SIZE) {

    throw new Error('Archivo muy grande (máx 5MB)')

# Windows  }

# Descargar .exe desde GitHub releases  

```  return true

}

---

// Además, validar en servidor (Supabase Storage lo hace)

#### 3.2 Configurar Pre-commit Hook```

```bash

# Instalar husky (si no está)---

npm install -D husky

npx husky install### 6. RLS Policy Validation



# Crear pre-commit hook**Objetivo:** Verificar que RLS está activo y políticas son correctas SIN modificarlas.

npx husky add .husky/pre-commit "gitleaks protect --staged --verbose"

```**Script de validación:**



---```sql

-- scripts/validate-rls.sql

#### 3.3 Ejecutar Scan Inicial-- Ejecutar en Supabase SQL Editor

```bash

gitleaks detect --source . --verbose --report-path gitleaks-report.json-- 1. Verificar que RLS está habilitado

```SELECT schemaname, tablename, rowsecurity

FROM pg_tables

**Si encuentra secrets:**WHERE schemaname = 'public'

1. Remover del código  AND rowsecurity = false;

2. Rotar credenciales comprometidas-- ⚠️ Si devuelve filas, esas tablas NO tienen RLS!

3. Agregar a `.gitignore`

4. Limpiar historial git (si es crítico)-- 2. Listar políticas existentes

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual

---FROM pg_policies

WHERE schemaname = 'public'

#### 3.4 GitHub Action para SecretsORDER BY tablename, policyname;

```yaml

# Crear .github/workflows/secrets-scan.yml-- 3. Verificar que tablas públicas tienen política de SELECT

# Ver sección "Opción 2" arribaSELECT t.tablename

```FROM pg_tables t

LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.cmd = 'SELECT'

---WHERE t.schemaname = 'public'

  AND t.tablename NOT LIKE 'pg_%'

### Fase 4: Validación RLS (1 hora)  AND p.policyname IS NULL;

-- ⚠️ Si devuelve filas, esas tablas no tienen política SELECT!

#### 4.1 Conectarse a Supabase```

```bash

npx supabase login**Validación automatizada (CI):**

npx supabase link --project-ref your-project-ref

``````typescript

// scripts/validate-rls.ts

---import { createClient } from '@supabase/supabase-js'



#### 4.2 Verificar RLS Activoconst supabase = createClient(

```sql  process.env.SUPABASE_URL!,

-- En Supabase SQL Editor  process.env.SUPABASE_SERVICE_ROLE_KEY!

SELECT tablename, rowsecurity )

FROM pg_tables 

WHERE schemaname = 'public' async function validateRLS() {

  AND tablename IN (  // Verificar que RLS está activo

    'productos',   const { data, error } = await supabase.rpc('check_rls_enabled')

    'precios_escalonados',   

    'leads',   if (error) {

    'cotizaciones',     console.error('❌ Error checking RLS:', error)

    'items_cotizacion',     process.exit(1)

    'eventos'  }

  );  

```  const tablesWithoutRLS = data.filter((t: any) => !t.rowsecurity)

  

**Resultado esperado:** `rowsecurity = true` para todas  if (tablesWithoutRLS.length > 0) {

    console.error('❌ Tables without RLS:', tablesWithoutRLS)

---    process.exit(1)

  }

#### 4.3 Verificar Policies  

```sql  console.log('✅ All tables have RLS enabled')

-- Ver policies de cada tabla}

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 

FROM pg_policies validateRLS()

WHERE schemaname = 'public';```

```

**[PENDIENTE]** Agregar a CI:

**Verificar:**```yaml

- Lectura pública solo en `productos` y `precios_escalonados`# .github/workflows/security-audit.yml

- Escritura solo para `authenticated` o `service_role`- name: Validate RLS Policies

  run: npx tsx scripts/validate-rls.ts

---  env:

    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}

#### 4.4 Test Manual de RLS    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

```typescript```

// Script de prueba: scripts/test-rls.ts

import { createClient } from '@supabase/supabase-js'**Checklist RLS:**



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!- [ ] RLS habilitado en TODAS las tablas

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!- [ ] Política SELECT para datos públicos (catálogo)

const supabase = createClient(supabaseUrl, supabaseAnonKey)- [ ] Política INSERT/UPDATE/DELETE restringidas

- [ ] Service Role Key solo en server-side

// Test 1: Lectura pública debe funcionar- [ ] Tests de autorización (intentar acceso no autorizado)

const { data: products } = await supabase

  .from('productos')---

  .select('*')

console.log('✅ Lectura productos:', products?.length)### 7. Authentication & Authorization



// Test 2: Escritura sin auth debe fallar**JWT Validation (Supabase lo hace automáticamente):**

const { error } = await supabase

  .from('leads')```typescript

  .insert({ nombre: 'Test', email: 'test@test.com' })// middleware.ts

console.log('❌ Escritura leads sin auth:', error?.message)import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

import { NextRequest, NextResponse } from 'next/server'

// Si error contiene "policy", RLS está activo ✅

```export async function middleware(req: NextRequest) {

  const res = NextResponse.next()

---  const supabase = createMiddlewareClient({ req, res })

  

## 🐛 Troubleshooting  // Refresh session si es necesario

  const { data: { session } } = await supabase.auth.getSession()

### npm audit fix --force rompe el proyecto  

**Causa:** Actualiza dependencias fuera del rango especificado  // Proteger rutas admin

  if (req.nextUrl.pathname.startsWith('/admin') && !session) {

**Solución:**    return NextResponse.redirect(new URL('/auth/login', req.url))

```bash  }

# Revertir  

git checkout package.json package-lock.json  // Verificar rol admin

npm install  if (req.nextUrl.pathname.startsWith('/admin') && session) {

    const { data: profile } = await supabase

# Actualizar solo paquetes específicos      .from('profiles')

npm update package-name      .select('role')

```      .eq('id', session.user.id)

      .single()

---    

    if (profile?.role !== 'admin') {

### Headers no aparecen en respuesta      return NextResponse.redirect(new URL('/', req.url))

**Causa:** Next.js config mal formado o caché    }

  }

**Solución:**  

```bash  return res

# Limpiar .next}

rm -rf .next

npm run buildexport const config = {

npm run start  matcher: ['/admin/:path*'],

}

# Verificar sin caché```

curl -I -H "Cache-Control: no-cache" http://localhost:3000

```**Session Management:**



---```typescript

// app/admin/layout.tsx

### CSP bloquea recursos'use client'

**Causa:** Directiva muy restrictiva

import { useEffect } from 'react'

**Solución:**import { useRouter } from 'next/navigation'

```javascriptimport { supabase } from '@/lib/supabase-client'

// Revisar errores en console

// Ajustar CSP para permitir dominios necesariosexport default function AdminLayout({ children }) {

  const router = useRouter()

// Ejemplo: permitir Supabase  

img-src 'self' https://*.supabase.co;  useEffect(() => {

connect-src 'self' https://*.supabase.co;    // Escuchar cambios de auth

```    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {

      if (event === 'SIGNED_OUT') {

---        router.push('/auth/login')

      }

### Gitleaks detecta falsos positivos    })

**Causa:** Patterns que parecen secrets pero no lo son    

    return () => subscription.unsubscribe()

**Solución:**  }, [router])

```toml  

# .gitleaks.toml  return <>{children}</>

[[rules]]}

  description = "Generic Secret"```

  id = "generic-secret"

  [[rules.allowlist]]**[PENDIENTE]** Configurar:

    description = "Allow test secrets"- MFA (Multi-Factor Authentication) en Supabase

    regexes = ['''test-anon-key''', '''test-service-key''']- Session timeout (30 min inactividad)

```- Refresh token rotation

- Rate limiting en login endpoint

---

---

## ✅ Entregables

### 8. Rate Limiting

### Vulnerabilidades

- [ ] npm audit fix ejecutado**Estrategia:**

- [ ] 0 high/critical vulnerabilities

- [ ] 0 moderate (o documentadas)| Endpoint | Límite | Ventana | Acción |

- [ ] Reporte de audit actualizado|----------|--------|---------|--------|

| `/api/*` | 100 req | 15 min | 429 Too Many Requests |

### Security Headers| `/auth/login` | 5 req | 15 min | Bloquear IP + CAPTCHA |

- [ ] Headers básicos configurados| `/api/quotes` | 10 req | 1 hora | 429 + alerta |

- [ ] CSP implementado (opcional, después de testing)| Global | 1000 req | 1 hora | Throttle |

- [ ] Verificado en securityheaders.com

- [ ] Grade A o superior**Implementación con Vercel:**



### Secrets Scanning```typescript

- [ ] Gitleaks instalado y configurado// middleware.ts

- [ ] Pre-commit hook activoimport { Ratelimit } from '@upstash/ratelimit'

- [ ] GitHub Action creadoimport { Redis } from '@upstash/redis'

- [ ] Scan inicial sin findings

// [PENDIENTE] Configurar Upstash Redis

### RLS Validationconst redis = new Redis({

- [ ] RLS activo en todas las tablas críticas  url: process.env.UPSTASH_REDIS_REST_URL!,

- [ ] Policies verificadas  token: process.env.UPSTASH_REDIS_REST_TOKEN!,

- [ ] Test manual exitoso})

- [ ] Documentación de policies

const ratelimit = new Ratelimit({

### Variables de Entorno  redis,

- [ ] .env.example actualizado  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour

- [ ] SERVICE_ROLE_KEY no expuesta})

- [ ] Build verificado sin secrets

- [ ] CI con secrets configuradosexport async function middleware(req: NextRequest) {

  // Rate limit por IP

---  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'

  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

## 📚 Recursos  

  if (!success) {

### Documentación Oficial    return new NextResponse('Too Many Requests', {

- **npm audit:** https://docs.npmjs.com/cli/v9/commands/npm-audit      status: 429,

- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy      headers: {

- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security        'X-RateLimit-Limit': limit.toString(),

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/        'X-RateLimit-Remaining': remaining.toString(),

        'X-RateLimit-Reset': reset.toString(),

### Tools      },

- **Gitleaks:** https://github.com/gitleaks/gitleaks    })

- **Security Headers:** https://securityheaders.com/  }

- **Mozilla Observatory:** https://observatory.mozilla.org/  

  return NextResponse.next()

### Workflows de Referencia}

- `.github/workflows/security-audit.yml` - Audit actual```

- Ejemplo de secrets-scan: Ver Fase 3.4

**Alternativa sin Redis (menos robusto):**

---

```typescript

**Última actualización:** 2025-11-03  // lib/rate-limit.ts (in-memory, solo para desarrollo)

**Vulnerabilities:** ⚠️ 3 moderate (tar en supabase CLI)  const cache = new Map<string, { count: number; resetAt: number }>()

**Headers:** ❌ No configurados  

**Secrets Scanning:** ❌ No configurado  export function checkRateLimit(ip: string, limit = 100, window = 15 * 60 * 1000) {

**Prioridad:** 🟡 ALTA (después de fix de build)  const now = Date.now()

  const record = cache.get(ip)
  
  if (!record || now > record.resetAt) {
    cache.set(ip, { count: 1, resetAt: now + window })
    return { allowed: true, remaining: limit - 1 }
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  
  record.count++
  return { allowed: true, remaining: limit - record.count }
}
```

**[PENDIENTE]** Decisión:
- Implementar Upstash Redis (recomendado, $0/mo para 10k req/day)
- O usar Vercel Edge Config (más caro)
- O aceptar in-memory (no funciona en serverless distribuido)

---

### 9. CORS Configuration

```typescript
// next.config.mjs
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://fullcolor.com' // [PENDIENTE] Dominio real
              : '*', // Dev: permitir todo
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}
```

---

### 10. Security.txt

```
# public/.well-known/security.txt
Contact: security@fullcolor.com
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: es, en
Canonical: https://fullcolor.com/.well-known/security.txt

# Disclosure Policy
Policy: https://fullcolor.com/security-policy

# Acknowledgments
Acknowledgments: https://fullcolor.com/security-hall-of-fame
```

**[PENDIENTE]** Crear:
- Página de política de divulgación responsable
- Email de contacto de seguridad
- Proceso de manejo de reportes

---

## Security Checklist

### Dependencies
- [ ] npm audit sin high/critical
- [ ] Dependabot configurado
- [ ] Auto-updates para patches de seguridad

### Code
- [ ] CodeQL sin alertas high/critical
- [ ] ESLint security plugin activo
- [ ] No hay `eval()`, `Function()`, `innerHTML`
- [ ] Inputs sanitizados con Zod

### Secrets
- [ ] `.env.local` en `.gitignore`
- [ ] Service Role Key solo en server
- [ ] git-secrets configurado
- [ ] Secrets rotados cada 90 días

### Headers
- [ ] CSP configurado
- [ ] HSTS activo
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] securityheaders.com score A+

### Authentication
- [ ] JWT validation activa
- [ ] Session timeout configurado
- [ ] MFA disponible para admins
- [ ] Logout funcional

### Authorization
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas validadas (sin modificar)
- [ ] Middleware protege rutas admin
- [ ] Tests de autorización

### Input Validation
- [ ] Formularios con Zod
- [ ] XSS prevention
- [ ] SQL injection prevention (Supabase lo hace)
- [ ] File uploads validados

### Rate Limiting
- [ ] Configurado en endpoints sensibles
- [ ] Login con límite estricto
- [ ] CAPTCHA en caso de abuse

### Monitoring
- [ ] GitHub Secret Scanning activo
- [ ] Alertas de vulnerabilidades configuradas
- [ ] Logs de accesos sospechosos
- [ ] <PLACEHOLDER: SIEM tool> [PENDIENTE]

---

## Incident Response Plan

### 1. Detección
- GitHub Security Alert
- Usuario reporta vulnerabilidad
- Monitoreo detecta actividad sospechosa

### 2. Evaluación (30 min)
- Severidad (Critical/High/Medium/Low)
- Impacto (datos expuestos, servicios afectados)
- Alcance (usuarios afectados)

### 3. Contención (2 horas)
- Rotar secretos comprometidos
- Bloquear IPs maliciosas
- Desactivar features afectadas
- Notificar a stakeholders

### 4. Remediación (24 horas)
- Fix de vulnerabilidad
- Deploy de parche
- Validación en staging
- Deploy a producción

### 5. Comunicación
- Notificar a usuarios afectados (si aplica)
- Publicar post-mortem
- Actualizar security.txt

### 6. Post-Mortem (7 días)
- Documentar incidente
- Identificar mejoras
- Implementar prevención
- Training del equipo

**[PENDIENTE]** Crear:
- Runbook detallado de incidentes
- Lista de contactos de emergencia
- Template de comunicación

---

## Próximos Pasos

1. **[ACCIÓN]** Ejecutar `npm audit` y resolver vulnerabilidades high/critical
2. **[ACCIÓN]** Configurar git-secrets localmente
3. **[ACCIÓN]** Validar RLS policies con script SQL
4. **[ACCIÓN]** Implementar security headers en `next.config.mjs`
5. **[DECISIÓN]** Evaluar implementar rate limiting (Upstash vs in-memory)
6. **[ACCIÓN]** Crear `security.txt` y página de divulgación
7. **[ACCIÓN]** Configurar alertas de seguridad en GitHub
8. **[DOCUMENTAR]** Incident response plan completo

---

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [securityheaders.com](https://securityheaders.com/)

---

**Última actualización:** 2025-11-03  
**Versión:** 1.0.0  
**Mantenido por:** Security Agent







