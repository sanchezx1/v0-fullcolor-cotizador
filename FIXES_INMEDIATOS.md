# 🎯 Plan de Acción Inmediato - Issues Críticos

> **Fixes priorizados con comandos ejecutables**  
> **Basado en análisis real del repositorio**

---

## 📊 Resumen de Issues

| # | Issue | Severidad | Tiempo | Bloquea Deploy |
|---|-------|-----------|--------|----------------|
| 1 | Build falla en `/auth/login` | 🔴 CRÍTICA | 30 min | ✅ Sí |
| 2 | TypeScript/ESLint ignorados | 🔴 CRÍTICA | 30 min | ✅ Sí |
| 3 | Imágenes sin optimizar | 🟡 Alta | 15 min | ❌ No |
| 4 | 3 vulnerabilidades moderate | 🟡 Alta | 15 min | ❌ No (es devDep) |
| 5 | Security headers no configurados | 🟡 Alta | 1 hora | ❌ No |
| 6 | Secrets scanning no configurado | 🟢 Media | 1 hora | ❌ No |

**Total tiempo crítico:** 1-2 horas  
**Total tiempo alta prioridad:** +3 horas  
**Total completo:** ~5 horas

---

## 🔴 FASE 1: Issues Críticos (1-2 horas)

### Issue #1: Fix Build Error (30 min)

**Problema:**
```
useSearchParams() should be wrapped in a suspense boundary at page "/auth/login"
```

**Ubicación:** `app/auth/login/page.tsx`

**Fix:**
```tsx
// ANTES (rompe build)
'use client'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()  // ❌ Sin Suspense
  
  return (
    <div>
      <LoginForm />
    </div>
  )
}
```

```tsx
// DESPUÉS (funciona)
'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Extraer componente que usa useSearchParams
function LoginForm() {
  const searchParams = useSearchParams()  // ✅ Dentro de Suspense
  
  return (
    <form>
      {/* Tu código de formulario */}
    </form>
  )
}

// Wrapper con Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
```

**Verificación:**
```bash
npm run build
# Debe completar sin el error de suspense boundary
```

---

### Issue #2: Habilitar TypeScript/ESLint (30 min)

**Problema:** Errores ocultos que pueden causar runtime failures

**Ubicación:** `next.config.mjs`

**Fix:**
```javascript
// ANTES (ignora errores)
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ❌ Ignora ESLint
  },
  typescript: {
    ignoreBuildErrors: true,    // ❌ Ignora TypeScript
  },
  images: {
    unoptimized: true,          // ⚠️ Sin optimización
  },
}
```

```javascript
// DESPUÉS (valida errores)
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,  // ✅ Valida ESLint
  },
  typescript: {
    ignoreBuildErrors: false,   // ✅ Valida TypeScript
  },
  images: {
    unoptimized: false,         // ✅ Optimizar imágenes
    domains: [
      // Agregar dominios de Supabase Storage si usas imágenes externas
      // 'your-project.supabase.co',
    ],
  },
}

export default nextConfig
```

**Verificación paso a paso:**
```bash
# 1. Verificar errores TypeScript
npx tsc --noEmit
# Si hay errores, corregirlos antes de seguir

# 2. Verificar errores ESLint
npm run lint
# Si hay errores, corregirlos o ejecutar:
npm run lint -- --fix

# 3. Intentar build
npm run build
```

**Si images.unoptimized = false falla:**
```javascript
// Dejar temporalmente en true hasta investigar
images: {
  unoptimized: true,  // ⚠️ Temporal
}
```

---

### Issue #3: Verificar Imágenes (15 min)

**Problema:** Imágenes probablemente sin optimizar

**Investigar:**
```bash
# Buscar uso de <img> vs <Image>
grep -r "<img" app/ components/ --include="*.tsx"

# Buscar uso de next/image
grep -r "from 'next/image'" app/ components/ --include="*.tsx"
```

**Si encuentras `<img>` tags, reemplazar:**
```tsx
// ANTES
<img src="/producto.jpg" alt="Producto" />

// DESPUÉS
import Image from 'next/image'

<Image 
  src="/producto.jpg" 
  alt="Producto"
  width={500}
  height={500}
  priority={false}  // true si es above-the-fold
/>
```

**Si usas imágenes de Supabase Storage:**
```javascript
// next.config.mjs
images: {
  domains: ['your-project.supabase.co'],
  // O usar remotePatterns:
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

---

## 🟡 FASE 2: Alta Prioridad (3 horas)

### Issue #4: Fix Vulnerabilidades (15 min)

**Estado actual:**
```bash
$ npm audit --audit-level=moderate
3 moderate severity vulnerabilities
- tar@7.5.1 (en supabase CLI)
```

**Fix automático:**
```bash
# Intentar fix automático
npm audit fix

# Verificar resultado
npm audit --audit-level=moderate
```

**Si persiste (probable):**
- **Razón:** `supabase` CLI (devDependency) usa `tar@7.5.1` vulnerable
- **Riesgo:** BAJO (solo dev, no producción)
- **Acción:** Documentar y esperar actualización de Supabase

```bash
# Verificar que tar NO está en producción
npm ls tar --production
# Debe mostrar: (empty) o "not found"

# Si confirmas que es solo devDependency, documentar:
echo "## Known Security Issues

### tar@7.5.1 (MODERATE - devDependency only)
- **Source:** supabase CLI
- **Risk:** LOW (development only, not in production)
- **Status:** Waiting for upstream fix
- **Verified:** Not present in production build
- **Date:** 2025-11-03
" >> SECURITY.md

git add SECURITY.md
git commit -m "docs: document known tar vulnerability in supabase CLI"
```

---

### Issue #5: Security Headers (1 hora)

**Problema:** Sin protección contra XSS, clickjacking, etc.

**Ubicación:** `next.config.mjs`

**Fix básico (sin CSP):**
```javascript
// next.config.mjs
const nextConfig = {
  // ... config existente ...
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Verificación:**
```bash
# Build y start
npm run build
npm run start &

# Esperar 5 segundos
sleep 5

# Verificar headers (PowerShell)
(Invoke-WebRequest -Uri "http://localhost:3000").Headers

# O con curl (si está instalado)
curl -I http://localhost:3000 | Select-String "X-Frame|Strict-Transport"

# Debe mostrar los headers configurados
```

**Verificación online (después de deploy):**
```
https://securityheaders.com/?q=https://tu-dominio.vercel.app
```

**Objetivo:** Grade A o A+

---

### Issue #6: Secrets Scanning (1 hora)

**Problema:** Sin protección contra commits con secrets

**Fix: Gitleaks pre-commit hook**

#### Paso 1: Instalar Gitleaks

**Windows:**
```powershell
# Descargar desde GitHub releases
$url = "https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_windows_x64.zip"
$output = "$env:TEMP\gitleaks.zip"
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive -Path $output -DestinationPath "$env:TEMP\gitleaks"
Move-Item "$env:TEMP\gitleaks\gitleaks.exe" "$env:USERPROFILE\AppData\Local\Microsoft\WindowsApps\"

# Verificar
gitleaks version
```

**macOS:**
```bash
brew install gitleaks
gitleaks version
```

---

#### Paso 2: Ejecutar Scan Inicial

```bash
# Scan completo
gitleaks detect --source . --verbose --report-path gitleaks-report.json

# Si encuentra secrets:
# 1. Revisar gitleaks-report.json
# 2. Remover secrets del código
# 3. Rotar credenciales comprometidas
# 4. Agregar a .gitignore
```

---

#### Paso 3: Configurar Pre-commit Hook

**Instalar husky (si no está):**
```bash
npm install -D husky
npx husky install
npm pkg set scripts.prepare="husky install"
```

**Crear pre-commit hook:**
```bash
npx husky add .husky/pre-commit "gitleaks protect --staged --verbose"
chmod +x .husky/pre-commit  # Unix/Mac
```

**Probar:**
```bash
# Intentar commit con secret ficticio
echo "AWS_SECRET_KEY=AKIA1234567890ABCDEF" > test-secret.txt
git add test-secret.txt
git commit -m "test: secret detection"

# Debe BLOQUEAR el commit con mensaje de gitleaks
```

---

#### Paso 4: GitHub Action (opcional)

```yaml
# .github/workflows/secrets-scan.yml
name: Secrets Scanning

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## ✅ Checklist de Validación

### Después de Fase 1 (Crítico)
```bash
# 1. Build exitoso
npm run build
# ✅ Debe completar sin errores

# 2. Tests pasando
npm run test:unit
# ✅ 73 tests passing

# 3. TypeScript OK
npx tsc --noEmit
# ✅ 0 errores

# 4. ESLint OK
npm run lint
# ✅ 0 errores
```

---

### Después de Fase 2 (Alta Prioridad)
```bash
# 5. Vulnerabilidades
npm audit --audit-level=high
# ✅ 0 high/critical

npm audit --audit-level=moderate
# ✅ 0 moderate (o documentado en SECURITY.md)

# 6. Security headers
curl -I http://localhost:3000 | grep "X-Frame-Options"
# ✅ Debe mostrar: X-Frame-Options: SAMEORIGIN

# 7. Secrets scan
gitleaks detect --source .
# ✅ No findings (o solo falsos positivos documentados)
```

---

### Checklist Final Pre-Deploy
```markdown
## Pre-Deploy Checklist - [FECHA]

### Build & Tests
- [ ] `npm run build` → ✅ Sin errores
- [ ] `npm run test:unit` → ✅ 73/73 passing
- [ ] `npm run test:e2e` → ✅ Passing (después de build fix)
- [ ] `npx tsc --noEmit` → ✅ 0 errores
- [ ] `npm run lint` → ✅ 0 errores

### Security
- [ ] `npm audit --audit-level=high` → ✅ 0 vulnerabilities
- [ ] Security headers configurados → ✅
- [ ] Gitleaks scan clean → ✅
- [ ] Secrets en SECURITY.md documentados → ✅

### GitHub Actions
- [ ] tests-unit.yml → ✅ Green
- [ ] tests-e2e.yml → ✅ Green
- [ ] security-audit.yml → ✅ Green

### Vercel
- [ ] Secrets configurados → ✅
- [ ] Build preview OK → ✅

---
**Aprobado por:** [Tu nombre]  
**Fecha:** [YYYY-MM-DD]  
**Deploy:** ✅ Autorizado
```

---

## 🚀 Ejecutar Todo Ahora (Script)

```powershell
# PowerShell script completo
Write-Host "=== FASE 1: Fix Crítico ===" -ForegroundColor Yellow

# Verificar estado inicial
Write-Host "`n1. Estado inicial:" -ForegroundColor Cyan
npm run test:unit
npm audit --audit-level=high

Write-Host "`n2. Intentar build (esperamos que falle):" -ForegroundColor Cyan
npm run build

Write-Host "`n=== FIX REQUERIDO ===" -ForegroundColor Red
Write-Host "Editar app/auth/login/page.tsx (agregar Suspense)"
Write-Host "Editar next.config.mjs (habilitar checks)"
Read-Host "Presiona Enter cuando hayas editado los archivos..."

Write-Host "`n3. Verificar TypeScript:" -ForegroundColor Cyan
npx tsc --noEmit

Write-Host "`n4. Verificar ESLint:" -ForegroundColor Cyan
npm run lint

Write-Host "`n5. Build nuevamente:" -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD EXITOSO!" -ForegroundColor Green
    
    Write-Host "`n=== FASE 2: Security ===" -ForegroundColor Yellow
    
    Write-Host "`n6. Fix vulnerabilidades:" -ForegroundColor Cyan
    npm audit fix
    npm audit --audit-level=moderate
    
    Write-Host "`n7. Verificar final:" -ForegroundColor Cyan
    npm run test:all
    
    Write-Host "`n✅ TODO COMPLETO!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Build falló. Revisar errores arriba." -ForegroundColor Red
}
```

**Guardar como:** `fix-all.ps1`  
**Ejecutar:** `.\fix-all.ps1`

---

## 📚 Siguiente Lectura

Después de completar estos fixes:

1. **[docs/agents/README.md](./docs/agents/README.md)** - Overview del sistema QA
2. **[docs/agents/testing.md](./docs/agents/testing.md)** - Expandir tests
3. **[docs/agents/performance.md](./docs/agents/performance.md)** - Optimizar bundle
4. **[docs/agents/security.md](./docs/agents/security.md)** - CSP y más

---

**Última actualización:** 2025-11-03  
**Tiempo total estimado:** 2-5 horas  
**Issues críticos:** 2  
**Issues alta prioridad:** 4
