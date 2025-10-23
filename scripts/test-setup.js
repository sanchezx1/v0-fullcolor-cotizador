#!/usr/bin/env node

/**
 * Script de setup para entorno de pruebas
 * 
 * Ejecutar: node scripts/test-setup.cjs
 */

console.log('🧪 Configurando entorno de pruebas...\n')

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Verificar que estamos en el directorio correcto
const projectRoot = path.resolve(__dirname, '..')
const packageJsonPath = path.join(projectRoot, 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: No se encuentra package.json')
  console.error('   Ejecuta este script desde la raíz del proyecto')
  process.exit(1)
}

// Verificar que jest.config.ts existe
const jestConfigPath = path.join(projectRoot, 'jest.config.ts')
if (fs.existsSync(jestConfigPath)) {
  console.log('✅ jest.config.ts encontrado')
} else {
  console.error('❌ Error: No se encuentra jest.config.ts')
  process.exit(1)
}

// Verificar que playwright.config.ts existe
const playwrightConfigPath = path.join(projectRoot, 'playwright.config.ts')
if (fs.existsSync(playwrightConfigPath)) {
  console.log('✅ playwright.config.ts encontrado')
} else {
  console.error('❌ Error: No se encuentra playwright.config.ts')
  process.exit(1)
}

// Verificar estructura de directorios
const requiredDirs = [
  'tests/unit',
  'tests/integration',
  'tests/setup',
  'e2e/specs',
  'e2e/fixtures',
]

console.log('\n📁 Verificando estructura de directorios...')
let allDirsExist = true

requiredDirs.forEach(dir => {
  const dirPath = path.join(projectRoot, dir)
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}`)
  } else {
    console.log(`❌ ${dir} - NO EXISTE`)
    allDirsExist = false
  }
})

if (!allDirsExist) {
  console.error('\n❌ Error: Faltan directorios requeridos')
  process.exit(1)
}

// Verificar archivos de test
const testFiles = [
  'tests/unit/pricing.test.ts',
  'tests/unit/validations.test.ts',
  'tests/unit/quote-calculations.test.ts',
  'tests/setup/jest.setup.ts',
  'tests/setup/test-utils.tsx',
  'e2e/specs/cotizador-flow.spec.ts',
  'e2e/specs/accessibility.spec.ts',
]

console.log('\n📄 Verificando archivos de pruebas...')
let allFilesExist = true

testFiles.forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - NO EXISTE`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.error('\n❌ Error: Faltan archivos de pruebas')
  process.exit(1)
}

// Verificar fixtures
const fixtures = [
  'e2e/fixtures/products.json',
  'e2e/fixtures/pricing-tiers.json',
  'e2e/fixtures/quotes.json',
]

console.log('\n🗂️  Verificando fixtures...')
fixtures.forEach(fixture => {
  const fixturePath = path.join(projectRoot, fixture)
  if (fs.existsSync(fixturePath)) {
    console.log(`✅ ${fixture}`)
  } else {
    console.log(`⚠️  ${fixture} - NO EXISTE (opcional)`)
  }
})

// Verificar workflows de CI
const workflows = [
  '.github/workflows/tests-unit.yml',
  '.github/workflows/tests-e2e.yml',
  '.github/workflows/security-audit.yml',
]

console.log('\n🔄 Verificando workflows de CI...')
workflows.forEach(workflow => {
  const workflowPath = path.join(projectRoot, workflow)
  if (fs.existsSync(workflowPath)) {
    console.log(`✅ ${workflow}`)
  } else {
    console.log(`⚠️  ${workflow} - NO EXISTE`)
  }
})

// Verificar package.json tiene los scripts
console.log('\n📦 Verificando scripts en package.json...')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
const requiredScripts = [
  'test',
  'test:unit',
  'test:integration',
  'test:e2e',
  'test:coverage',
]

let allScriptsExist = true
requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ npm run ${script}`)
  } else {
    console.log(`❌ npm run ${script} - NO DEFINIDO`)
    allScriptsExist = false
  }
})

// Resumen final
console.log('\n' + '='.repeat(50))
if (allDirsExist && allFilesExist && allScriptsExist) {
  console.log('✅ ¡Entorno de pruebas configurado correctamente!')
  console.log('\n📚 Próximos pasos:')
  console.log('   1. Instalar dependencias: npm install')
  console.log('   2. Instalar navegadores: npx playwright install')
  console.log('   3. Ejecutar tests: npm run test:unit')
  console.log('   4. Ver README: cat TESTING_README.md')
  console.log('='.repeat(50) + '\n')
  process.exit(0)
} else {
  console.log('❌ Hay problemas con la configuración')
  console.log('\n💡 Revisa los errores arriba y corrige')
  console.log('='.repeat(50) + '\n')
  process.exit(1)
}
