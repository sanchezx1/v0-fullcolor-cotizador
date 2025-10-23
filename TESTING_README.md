# 🧪 Paquete de Pruebas y CI - FullColor Cotizador

## 📋 Contenido

Este paquete incluye pruebas completas para el proyecto **sin modificar el código de producción**:

- ✅ **Unit Tests**: Pruebas unitarias de lógica de negocio
- ✅ **Integration Tests**: Pruebas de integración de servicios
- ✅ **E2E Tests**: Pruebas end-to-end del flujo completo
- ✅ **Accessibility Tests**: Pruebas de accesibilidad (WCAG 2.1 AA)
- ✅ **CI/CD Workflows**: Automatización en GitHub Actions
- ✅ **Security Audits**: Análisis de vulnerabilidades

---

## 🚀 Instalación

### 1. Instalar dependencias de pruebas

```bash
npm install
```

Esto instalará:
- Jest (unit/integration tests)
- Playwright (E2E tests)
- Testing Library (utilidades de testing)
- axe-core (accesibilidad)

### 2. Instalar navegadores de Playwright

```bash
npx playwright install
```

---

## 🧪 Ejecutar Pruebas

### Unit Tests (Pruebas Unitarias)

```bash
# Ejecutar todas las pruebas unitarias
npm run test:unit

# Ejecutar con watch mode (desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

**Ubicación**: `tests/unit/`

**Qué se prueba**:
- ✅ `pricing.test.ts`: Cálculo de precios escalonados (función crítica)
- ✅ `validations.test.ts`: Validaciones de email, teléfono, RUC/cédula
- ✅ `quote-calculations.test.ts`: Cálculos de totales con IVA

### Integration Tests (Pruebas de Integración)

```bash
# Ejecutar todas las pruebas de integración
npm run test:integration
```

**Ubicación**: `tests/integration/`

**Qué se prueba**:
- Flujo completo de creación de cotización
- Integración entre productos y precios
- Interacción con mocks de Supabase

### E2E Tests (Pruebas End-to-End)

```bash
# Ejecutar E2E en modo headless (sin UI)
npm run test:e2e

# Ejecutar con interfaz gráfica (desarrollo)
npm run test:e2e:ui

# Ejecutar con navegador visible
npm run test:e2e:headed

# Solo pruebas de accesibilidad
npm run test:accessibility
```

**Ubicación**: `e2e/specs/`

**Qué se prueba**:
- ✅ `cotizador-flow.spec.ts`: Flujo completo Home → Catálogo → Producto → Cotizador → Confirmación
- ✅ `accessibility.spec.ts`: Violaciones de accesibilidad (WCAG 2.1 AA)

### Ejecutar TODAS las pruebas

```bash
npm run test:all
```

---

## 📊 Reportes

### Cobertura de Código

Después de ejecutar `npm run test:coverage`:

```bash
# Abrir reporte HTML
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

**Umbrales de cobertura configurados**:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

### Reportes E2E (Playwright)

Después de ejecutar `npm run test:e2e`:

```bash
npx playwright show-report
```

Esto abrirá un servidor local con:
- ✅ Tests ejecutados y resultados
- 📸 Screenshots de fallos
- 📹 Videos de ejecución
- 🔍 Traces detallados

---

## 🔧 Configuración

### Jest (`jest.config.ts`)

```typescript
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  coverageThresholds: { global: { branches: 50, functions: 50 } }
}
```

### Playwright (`playwright.config.ts`)

```typescript
{
  testDir: './e2e/specs',
  use: { baseURL: 'http://localhost:3000' },
  projects: ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari']
}
```

---

## 🏗️ Estructura de Archivos

```
tests/
├── unit/
│   ├── pricing.test.ts              # Precios escalonados
│   ├── validations.test.ts          # Validaciones
│   └── quote-calculations.test.ts   # Cálculos de cotización
│
├── integration/
│   ├── quote-flow.test.ts          # Flujo de cotización
│   └── product-pricing.test.ts     # Productos + precios
│
└── setup/
    ├── jest.config.ts              # Configuración Jest
    ├── jest.setup.ts               # Setup global
    └── test-utils.tsx              # Utilidades de testing

e2e/
├── specs/
│   ├── cotizador-flow.spec.ts     # Flujo principal E2E
│   └── accessibility.spec.ts       # Tests de a11y
│
├── fixtures/
│   ├── products.json              # Mock de productos
│   ├── pricing-tiers.json         # Mock de precios
│   └── quotes.json                # Mock de cotizaciones
│
└── playwright.config.ts           # Configuración Playwright

.github/
└── workflows/
    ├── tests-unit.yml             # CI para unit tests
    ├── tests-e2e.yml              # CI para E2E tests
    └── security-audit.yml         # CI para seguridad
```

---

## 🔒 CI/CD (GitHub Actions)

### Workflows Disponibles

#### 1. **Unit & Integration Tests** (`.github/workflows/tests-unit.yml`)

- ✅ Se ejecuta en cada push/PR
- ✅ Corre en Node 18 y 20
- ✅ Genera reporte de cobertura
- ✅ Sube resultados como artifacts

#### 2. **E2E Tests** (`.github/workflows/tests-e2e.yml`)

- ✅ Se ejecuta en cada push/PR
- ✅ Tests en Chromium, Firefox, WebKit
- ✅ Tests en viewports mobile/desktop
- ✅ Sube screenshots/videos de fallos

#### 3. **Security Audit** (`.github/workflows/security-audit.yml`)

- ✅ Se ejecuta en push/PR + semanalmente
- ✅ npm audit (vulnerabilidades)
- ✅ Dependency review (PRs)
- ✅ CodeQL analysis (código estático)
- ✅ Bundle size check
- ✅ Sensitive data scan

### Ver Resultados en GitHub

1. Ve a la pestaña **Actions** del repositorio
2. Selecciona el workflow (Unit Tests, E2E Tests, Security)
3. Click en el run más reciente
4. Descarga artifacts:
   - `coverage-report` → Cobertura HTML
   - `playwright-report` → Reporte E2E interactivo
   - `test-videos` → Videos de tests fallidos
   - `npm-audit-report` → Reporte de seguridad

---

## 🎯 Casos de Prueba Críticos

### Precios Escalonados (CRÍTICO)

```typescript
// tests/unit/pricing.test.ts
test('debe usar el tier correcto según cantidad', () => {
  const result = priceForQuantity(tiers, 500)
  expect(result.pricePerUnit).toBe(0.18) // Tier 500-999
})
```

**Por qué es crítico**: Esta función determina el precio que paga el cliente. Un error aquí causa pérdidas financieras.

### Cálculo de IVA (CRÍTICO)

```typescript
// tests/unit/validations.test.ts
test('debe aplicar IVA del 15% correctamente', () => {
  const totales = calcularTotalesCotizacion(items)
  expect(totales.iva).toBe(15.0) // 100 * 0.15
})
```

**Por qué es crítico**: Cálculos incorrectos de IVA causan problemas legales/contables.

### Flujo Completo E2E (CRÍTICO)

```typescript
// e2e/specs/cotizador-flow.spec.ts
test('debe completar flujo de cotización exitosamente', async ({ page }) => {
  // Home → Catálogo → Producto → Cotizador → Confirmación
})
```

**Por qué es crítico**: Verifica que el usuario pueda completar su objetivo principal.

---

## 🐛 Debugging

### Tests Unitarios Fallando

```bash
# Ver output detallado
npm run test:unit -- --verbose

# Ejecutar un solo test
npm run test:unit -- pricing.test.ts

# Debug con Node inspector
node --inspect-brk node_modules/.bin/jest tests/unit/pricing.test.ts
```

### Tests E2E Fallando

```bash
# Ejecutar con navegador visible
npm run test:e2e:headed

# Ejecutar con interfaz gráfica (mejor para debug)
npm run test:e2e:ui

# Ver trace de un test fallado
npx playwright show-trace test-results/.../trace.zip
```

### Mocks No Funcionan

1. Verifica que `jest.setup.ts` se está cargando
2. Revisa que los mocks estén antes de los imports
3. Usa `jest.clearAllMocks()` en `beforeEach`

---

## 📝 Agregar Nuevas Pruebas

### Nuevo Unit Test

1. Crea archivo en `tests/unit/mi-feature.test.ts`
2. Sigue el patrón:

```typescript
describe('Mi Feature', () => {
  test('debe hacer X cuando Y', () => {
    // Arrange
    const input = ...
    
    // Act
    const result = myFunction(input)
    
    // Assert
    expect(result).toBe(expected)
  })
})
```

### Nuevo E2E Test

1. Crea archivo en `e2e/specs/mi-flujo.spec.ts`
2. Sigue el patrón:

```typescript
test('debe completar flujo exitosamente', async ({ page }) => {
  await page.goto('/ruta')
  await page.getByRole('button', { name: /texto/i }).click()
  await expect(page).toHaveURL(/nueva-ruta/)
})
```

---

## 🚨 Reglas Importantes

### ❌ NO hacer:

- ❌ Modificar código de producción para tests
- ❌ Hardcodear URLs o credenciales
- ❌ Hacer tests que dependan de datos reales de Supabase
- ❌ Commits con tests fallando

### ✅ SÍ hacer:

- ✅ Usar mocks y fixtures
- ✅ Configurar todo por variables de entorno
- ✅ Tests independientes (no orden específico)
- ✅ Nombres descriptivos de tests
- ✅ Assertions claras

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [axe-core (Accesibilidad)](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 💬 Soporte

Si encuentras problemas con las pruebas:

1. Verifica que todas las dependencias estén instaladas: `npm ci`
2. Limpia caché: `npm run clean` (si existe)
3. Reinstala navegadores: `npx playwright install`
4. Revisa los logs de GitHub Actions
5. Consulta la documentación de Jest/Playwright

---

## ✅ Checklist antes de hacer PR

- [ ] `npm run test:unit` pasa ✅
- [ ] `npm run test:integration` pasa ✅
- [ ] `npm run test:e2e` pasa ✅
- [ ] `npm run test:accessibility` pasa ✅
- [ ] Cobertura >= 50% en archivos modificados
- [ ] No hay errores de lint
- [ ] CI workflows pasan (GitHub Actions)
- [ ] Documentación actualizada si es necesario

---

**Creado**: 2025-01-23  
**Versión**: 1.0.0  
**Mantenido por**: Equipo FullColor
