# Guía de Ejecución de Agentes QA

> **Propósito:** Instrucciones paso a paso para ejecutar cada agente y validar que el proyecto está listo para producción.

---

## 🚀 Quick Start

### Pre-requisitos

```bash
# Verificar instalaciones
node --version   # Debe ser 18.x o 20.x
npm --version    # Debe ser 9.x o superior
git --version

# Verificar que el proyecto construye
npm run build

# Verificar que hay tests
npm run test -- --listTests
```

---

## 1️⃣ Testing Agent

### Ejecutar Tests Unitarios

```bash
# Todos los tests unitarios
npm run test:unit

# Con coverage
npm run test:coverage

# Watch mode (desarrollo)
npm run test:watch

# Test específico
npm run test -- pricing.test.ts
```

**Resultado esperado:**
```
PASS tests/unit/pricing.test.ts
✓ Lógica de Precios Escalonados (4 tests)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Coverage:    90% (objetivo: 50%)
```

### Ejecutar Tests de Integración

```bash
# Todos los tests de integración
npm run test:integration

# Con ambiente de test
TEST_SUPABASE_URL=https://test.supabase.co npm run test:integration
```

### Ejecutar Tests E2E

```bash
# Todos los navegadores
npm run test:e2e

# Con interfaz gráfica
npm run test:e2e:ui

# Solo Chrome (más rápido)
npm run test:e2e -- --project=chromium

# Con navegador visible (debug)
npm run test:e2e:headed

# Test específico
npm run test:e2e -- cotizacion-flow.spec.ts
```

**Resultado esperado:**
```
Running 12 tests using 4 workers

✓ [chromium] › cotizacion-flow.spec.ts:8:3 › debe completar cotización (15s)
✓ [firefox] › cotizacion-flow.spec.ts:8:3 › debe completar cotización (18s)
✓ [webkit] › cotizacion-flow.spec.ts:8:3 › debe completar cotización (16s)

12 passed (45s)
```

### Ejecutar Tests de Accesibilidad

```bash
# Solo tests de accesibilidad
npm run test:accessibility

# Con reporte HTML
npm run test:e2e -- --grep @a11y --reporter=html
open playwright-report/index.html
```

### Checklist Testing Agent

```bash
# Copiar y ejecutar todos los comandos
echo "🧪 Testing Agent - Checklist"

echo "1. Tests unitarios..."
npm run test:unit || echo "❌ FAILED"

echo "2. Tests de integración..."
npm run test:integration || echo "❌ FAILED"

echo "3. Tests E2E..."
npm run test:e2e || echo "❌ FAILED"

echo "4. Tests de accesibilidad..."
npm run test:accessibility || echo "❌ FAILED"

echo "5. Coverage..."
npm run test:coverage || echo "❌ FAILED"

echo "✅ Testing Agent completado"
```

---

## 2️⃣ Performance Agent

### Ejecutar Lighthouse Local

```bash
# Instalar Lighthouse CLI
npm install -g @lhci/cli lighthouse

# Construir el proyecto
npm run build

# Iniciar servidor
npm start &

# Ejecutar Lighthouse
lighthouse http://localhost:3000 \
  --view \
  --output html \
  --output-path ./lighthouse-report.html

# Ver reporte
open lighthouse-report.html
```

**Métricas objetivo:**
```
Performance:     > 90
Accessibility:   > 90
Best Practices:  > 90
SEO:            > 90

LCP: < 2.5s
FID: < 100ms
CLS: < 0.1
```

### Analizar Bundle Size

```bash
# Instalar analyzer
npm install -D @next/bundle-analyzer

# Analizar bundle
ANALYZE=true npm run build

# Se abrirá automáticamente el navegador con el análisis visual
```

**Verificar:**
- First Load JS < 200KB
- Shared chunks razonables
- No hay duplicados grandes

### Medir Core Web Vitals en Producción

```bash
# Si tienes Vercel Analytics
# Ver en: https://vercel.com/[team]/[project]/analytics

# O usar PageSpeed Insights
# https://pagespeed.web.dev/

# O usar Chrome DevTools
# 1. Abrir DevTools → Lighthouse
# 2. Seleccionar "Performance"
# 3. Generate report
```

### Checklist Performance Agent

```bash
echo "⚡ Performance Agent - Checklist"

echo "1. Build exitoso..."
npm run build || echo "❌ FAILED"

echo "2. Lighthouse score > 90..."
lighthouse http://localhost:3000 --quiet --only-categories=performance,accessibility,best-practices,seo

echo "3. Bundle size < 200KB..."
npm run build | grep "First Load JS"

echo "4. Imágenes optimizadas..."
# Verificar manualmente que Next/Image se usa en todas las imágenes

echo "✅ Performance Agent completado"
```

---

## 3️⃣ Security Agent

### Auditar Dependencias

```bash
# Auditoría completa
npm audit

# Solo high/critical
npm audit --audit-level=high

# Generar reporte JSON
npm audit --json > audit-report.json

# Ver detalles de una vulnerabilidad
npm audit --json | jq '.vulnerabilities.["package-name"]'

# Intentar fix automático
npm audit fix

# Fix con breaking changes (cuidado!)
npm audit fix --force
```

**Resultado esperado:**
```
found 0 vulnerabilities
```

### Análisis Estático (CodeQL)

```bash
# CodeQL se ejecuta en GitHub Actions
# Ver resultados en: https://github.com/[user]/[repo]/security/code-scanning

# Local (requiere CodeQL CLI instalado)
codeql database create ./codeql-db --language=javascript
codeql database analyze ./codeql-db --format=sarif-latest --output=results.sarif
```

### Escanear Secretos

```bash
# Instalar git-secrets (una vez)
# macOS:
brew install git-secrets

# Windows: descargar desde GitHub

# Configurar en el repo
git secrets --install
git secrets --register-aws

# Agregar patterns custom
git secrets --add 'SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9]+'

# Escanear repo completo
git secrets --scan-history

# Escanear staged files
git secrets --scan
```

**Resultado esperado:**
```
No secrets found
```

### Validar Security Headers

```bash
# Construir y ejecutar
npm run build
npm start &

# Verificar headers con curl
curl -I http://localhost:3000

# O usar herramienta online
# https://securityheaders.com/?q=http://localhost:3000
```

**Headers esperados:**
```
Strict-Transport-Security: max-age=63072000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'; ...
```

### Validar RLS Policies

```bash
# Conectar a Supabase y ejecutar script
psql $DATABASE_URL < scripts/validate-rls.sql

# O usar Supabase CLI
supabase db remote query < scripts/validate-rls.sql
```

### Checklist Security Agent

```bash
echo "🔒 Security Agent - Checklist"

echo "1. npm audit..."
npm audit --audit-level=moderate || echo "⚠️ Vulnerabilidades encontradas"

echo "2. git-secrets scan..."
git secrets --scan || echo "❌ SECRETS FOUND!"

echo "3. Security headers..."
npm run build && npm start &
sleep 5
curl -I http://localhost:3000 | grep -E "Strict-Transport|X-Frame|X-Content"
kill %1

echo "4. TypeScript strict mode..."
grep -r '"strict": true' tsconfig.json || echo "⚠️ Strict mode no activo"

echo "5. .env.local en .gitignore..."
grep ".env.local" .gitignore || echo "❌ .env.local NO ignorado"

echo "✅ Security Agent completado"
```

---

## 🔄 Ejecutar TODO el Pipeline (Local)

```bash
#!/bin/bash
# run-all-qa.sh

echo "🚀 Iniciando QA Pipeline Completo"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# 1. Testing Agent
echo -e "\n${YELLOW}🧪 Testing Agent${NC}"
echo "-------------------"

echo "→ Unit tests..."
npm run test:unit || { echo -e "${RED}❌ FAILED${NC}"; FAILED=1; }

echo "→ Integration tests..."
npm run test:integration || { echo -e "${RED}❌ FAILED${NC}"; FAILED=1; }

echo "→ E2E tests..."
npm run test:e2e || { echo -e "${RED}❌ FAILED${NC}"; FAILED=1; }

echo "→ Coverage check..."
npm run test:coverage || { echo -e "${RED}❌ FAILED${NC}"; FAILED=1; }

# 2. Performance Agent
echo -e "\n${YELLOW}⚡ Performance Agent${NC}"
echo "---------------------"

echo "→ Building project..."
npm run build || { echo -e "${RED}❌ FAILED${NC}"; FAILED=1; }

echo "→ Analyzing bundle size..."
BUNDLE_SIZE=$(npm run build 2>&1 | grep "First Load JS" | awk '{print $4}')
echo "Bundle size: $BUNDLE_SIZE"

# 3. Security Agent
echo -e "\n${YELLOW}🔒 Security Agent${NC}"
echo "-------------------"

echo "→ npm audit..."
npm audit --audit-level=moderate || { echo -e "${RED}⚠️ Vulnerabilities found${NC}"; FAILED=1; }

echo "→ Checking for secrets..."
git secrets --scan 2>/dev/null || echo "⚠️ git-secrets not configured"

echo "→ TypeScript check..."
npx tsc --noEmit || { echo -e "${RED}❌ FAILED${NC}"; FAILED=1; }

echo "→ Linting..."
npm run lint || { echo -e "${RED}⚠️ Lint errors${NC}"; }

# Summary
echo -e "\n=================================="
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo "Ready for production! 🚀"
  exit 0
else
  echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
  echo "Please fix the errors before deploying."
  exit 1
fi
```

**Ejecutar:**

```bash
# Hacer ejecutable
chmod +x run-all-qa.sh

# Ejecutar
./run-all-qa.sh
```

---

## 📊 Interpretar Resultados

### Tests Pasando ✅

```
✅ Testing Agent: 100% tests passing
✅ Performance Agent: Lighthouse score 94
✅ Security Agent: 0 vulnerabilities

→ READY FOR PRODUCTION
```

### Tests Fallando ❌

```
❌ Testing Agent: 2 tests failing
⚠️ Performance Agent: Bundle size 250KB (límite: 200KB)
⚠️ Security Agent: 3 moderate vulnerabilities

→ FIX BEFORE DEPLOYING
```

---

## 🔍 Debugging

### Test específico falla

```bash
# Ejecutar solo ese test
npm run test -- path/to/test.spec.ts

# Con verbose
npm run test -- --verbose path/to/test.spec.ts

# Con debugger
node --inspect-brk node_modules/.bin/jest path/to/test.spec.ts
```

### Lighthouse score bajo

```bash
# Generar reporte detallado
lighthouse http://localhost:3000 \
  --output json \
  --output-path report.json

# Ver recomendaciones
cat report.json | jq '.audits | to_entries[] | select(.value.score < 0.9)'
```

### Vulnerabilidad no fixeable

```bash
# Ver dependencias que usan el paquete vulnerable
npm ls <package-name>

# Ver si hay actualización disponible
npm outdated <package-name>

# Si no hay fix, documentar en security.md
```

---

## 📋 Checklist Pre-Deploy

```markdown
## Pre-Deploy Checklist

### Testing
- [ ] `npm run test:unit` ✅
- [ ] `npm run test:integration` ✅
- [ ] `npm run test:e2e` ✅
- [ ] `npm run test:coverage` (> 50%) ✅

### Performance
- [ ] `npm run build` ✅
- [ ] Bundle size < 200KB ✅
- [ ] Lighthouse score > 90 ✅
- [ ] Core Web Vitals en objetivo ✅

### Security
- [ ] `npm audit --audit-level=high` ✅
- [ ] `git secrets --scan` ✅
- [ ] Security headers configurados ✅
- [ ] RLS policies validadas ✅
- [ ] No hay secrets en código ✅

### CI/CD
- [ ] Todos los workflows de GitHub Actions pasan ✅
- [ ] Branch protection rules activos ✅
- [ ] Preview deploy exitoso en Vercel ✅

### Documentation
- [ ] CHANGELOG.md actualizado ✅
- [ ] README.md actualizado ✅
- [ ] Migrations documentadas (si aplica) ✅

---
**Aprobado por:** [Nombre]  
**Fecha:** [YYYY-MM-DD]  
**Deploy autorizado:** ✅ SÍ / ❌ NO
```

---

## 🚨 Rollback Plan

Si algo falla en producción:

```bash
# 1. Identificar versión anterior estable
git log --oneline -10

# 2. Revertir a commit específico
git revert <commit-hash>

# 3. Push y deploy
git push origin main

# 4. Verificar con smoke tests
npm run test:e2e -- --grep @smoke
```

O desde Vercel:

1. Dashboard → Deployments
2. Encontrar deployment anterior
3. Click en "..." → "Promote to Production"

---

## 📚 Recursos Adicionales

- [Testing Best Practices](./agents/testing.md)
- [Performance Optimization](./agents/performance.md)
- [Security Hardening](./agents/security.md)
- [CI/CD Workflows](./ci/workflows.md)
- [Agentes Overview](./agents/README.md)

---

**Última actualización:** 2025-11-03  
**Versión:** 1.0.0  
**Mantenido por:** Arquitecto de QA
