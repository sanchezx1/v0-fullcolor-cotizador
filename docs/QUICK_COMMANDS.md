# ⚡ Comandos Rápidos QA - FullColor Cotizador

> **Cheat sheet** de comandos para ejecutar agentes de QA de forma rápida.

---

## 🧪 Testing Agent

### Tests Unitarios
```bash
# Todos los tests unitarios
npm run test:unit

# Con watch mode
npm run test:watch

# Test específico
npm run test -- pricing.test.ts

# Con cobertura
npm run test:coverage

# Limpiar cache de Jest
npm run test -- --clearCache
```

### Tests de Integración
```bash
# Todos los tests de integración
npm run test:integration

# Con base de datos de test
TEST_SUPABASE_URL=https://test.supabase.co npm run test:integration
```

### Tests E2E
```bash
# Todos los navegadores
npm run test:e2e

# Con UI (recomendado para debug)
npm run test:e2e:ui

# Solo Chrome (más rápido)
npm run test:e2e -- --project=chromium

# Con navegador visible
npm run test:e2e:headed

# Test específico
npm run test:e2e -- cotizacion-flow.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

### Tests de Accesibilidad
```bash
# Solo tests de accesibilidad
npm run test:accessibility

# Con reporte HTML
npm run test:e2e -- --grep @a11y --reporter=html
```

---

## ⚡ Performance Agent

### Build y Bundle Analysis
```bash
# Build normal
npm run build

# Build con análisis de bundle
ANALYZE=true npm run build

# Ver tamaño del bundle
npm run build | grep "First Load JS"
```

### Lighthouse
```bash
# Instalar Lighthouse (una vez)
npm install -g lighthouse @lhci/cli

# Lighthouse simple
lighthouse http://localhost:3000 --view

# Lighthouse con reporte JSON
lighthouse http://localhost:3000 \
  --output json \
  --output-path report.json

# Lighthouse CI
lhci autorun
```

### Dev Performance
```bash
# Iniciar con análisis de performance
npm run dev -- --turbo

# Verificar bundle sizes
npm run build -- --profile
```

---

## 🔒 Security Agent

### Dependency Auditing
```bash
# Auditoría completa
npm audit

# Solo high/critical
npm audit --audit-level=high

# Reporte JSON
npm audit --json > audit-report.json

# Fix automático (solo patches)
npm audit fix

# Fix con breaking changes (cuidado!)
npm audit fix --force

# Ver dependencias de un paquete
npm ls <package-name>
```

### Static Analysis
```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Linting con auto-fix
npm run lint -- --fix

# ESLint específico
npx eslint path/to/file.ts
```

### Secret Scanning
```bash
# Instalar git-secrets (una vez)
# macOS:
brew install git-secrets

# Configurar
git secrets --install
git secrets --register-aws

# Agregar patterns
git secrets --add 'SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9]+'

# Escanear historial completo
git secrets --scan-history

# Escanear staged files
git secrets --scan
```

### Security Headers Check
```bash
# Build y start
npm run build && npm start &

# Verificar headers con curl
curl -I http://localhost:3000

# Verificar con securityheaders.com
# https://securityheaders.com/?q=http://localhost:3000
```

---

## 🔄 CI/CD

### GitHub Actions
```bash
# Ver workflows disponibles
ls .github/workflows/

# Ejecutar workflow localmente (con act)
act -j test

# Ver logs de workflow
gh run list
gh run view <run-id>
```

### Vercel
```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Listar deployments
vercel ls
```

---

## 🚀 Pipeline Completo

### Local (Todo en uno)
```bash
# Windows (PowerShell)
.\run-all-qa.ps1

# Unix/Mac/WSL (Bash)
./run-all-qa.sh

# Con opciones
./run-all-qa.sh --skip-e2e        # Omitir E2E
./run-all-qa.sh --skip-security   # Omitir security
./run-all-qa.sh --verbose         # Verbose mode
```

### Manual (Paso a paso)
```bash
# 1. Pre-checks
node --version
npm --version

# 2. Install dependencies
npm ci

# 3. Tests
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage

# 4. Build
npm run build

# 5. Security
npm audit --audit-level=moderate
npx tsc --noEmit
npm run lint

# 6. Performance (opcional)
lighthouse http://localhost:3000
```

---

## 🐛 Debug & Troubleshooting

### Tests fallan
```bash
# Limpiar cache
npm run test -- --clearCache
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Ejecutar con verbose
npm run test -- --verbose

# Ejecutar con debug
node --inspect-brk node_modules/.bin/jest
```

### Build falla
```bash
# Limpiar .next
rm -rf .next

# Verificar TypeScript
npx tsc --noEmit

# Build con más información
npm run build -- --debug
```

### E2E timeout
```bash
# Aumentar timeout global
# En playwright.config.ts: timeout: 60000

# Aumentar timeout específico
# En test: test.setTimeout(60000)

# Ejecutar con más tiempo
npm run test:e2e -- --timeout=60000
```

---

## 📊 Reportes

### Coverage Report
```bash
# Generar cobertura
npm run test:coverage

# Ver HTML report
open coverage/lcov-report/index.html
```

### Playwright Report
```bash
# Ejecutar tests
npm run test:e2e

# Ver reporte
npx playwright show-report

# O abrir HTML
open playwright-report/index.html
```

### Bundle Analysis
```bash
# Generar análisis
ANALYZE=true npm run build

# Ver en navegador (se abre automáticamente)
```

---

## 🔍 Verificaciones Rápidas

### Pre-commit
```bash
# Antes de hacer commit
npm run lint                  # Linting
npx tsc --noEmit             # TypeScript
npm run test:unit            # Tests rápidos
git secrets --scan           # Secretos
```

### Pre-push
```bash
# Antes de hacer push
npm run test                 # Todos los tests
npm run build                # Verificar build
npm audit --audit-level=high # Security
```

### Pre-deploy
```bash
# Antes de deployar a producción
./run-all-qa.sh              # Pipeline completo
npm run test:e2e             # E2E en local
npm audit                    # Security full
```

---

## 📱 Mobile Testing

### Playwright Mobile
```bash
# Solo mobile
npm run test:e2e -- --project="Mobile Chrome"
npm run test:e2e -- --project="Mobile Safari"

# Todos los devices
npm run test:e2e -- --project="Mobile*"
```

### Chrome DevTools
```bash
# 1. Iniciar dev server
npm run dev

# 2. Abrir Chrome DevTools
# 3. Toggle device toolbar (Ctrl+Shift+M)
# 4. Seleccionar device
```

---

## 🎯 Comandos por Escenario

### Desarrollo local
```bash
npm run dev
npm run test:watch
```

### Pre-commit
```bash
npm run lint
npm run test:unit
```

### Pre-PR
```bash
./run-all-qa.sh --skip-e2e
npm run build
```

### Pre-merge
```bash
./run-all-qa.sh              # Todo
# + Verificar que CI pasa en GitHub
```

### Pre-deploy
```bash
./run-all-qa.sh              # Todo
npm run test:e2e             # Verificar E2E
# + Smoke tests en preview
```

### Post-deploy
```bash
# Smoke tests en producción
PLAYWRIGHT_TEST_BASE_URL=https://fullcolor.com npm run test:e2e -- --grep @smoke
```

---

## 🚨 Emergencias

### Rollback rápido
```bash
# Método 1: Git revert
git revert HEAD
git push origin main

# Método 2: Vercel rollback
# Dashboard → Deployments → Previous → Promote to Production
```

### Fix crítico en producción
```bash
# 1. Crear hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix + tests
# ... code ...

# 3. Tests rápidos
npm run test:unit
npm run build

# 4. Push y deploy
git push origin hotfix/critical-bug

# 5. Fast-track PR
# Merge con 1 approval + CI passing
```

---

## 📚 Más Información

- [Testing Agent](./agents/testing.md)
- [Performance Agent](./agents/performance.md)
- [Security Agent](./agents/security.md)
- [Workflows CI/CD](./ci/workflows.md)
- [Guía de Ejecución](./EXECUTION_GUIDE.md)
- [Índice QA](./QA_INDEX.md)

---

**Última actualización:** 2025-11-03
