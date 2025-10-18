#!/usr/bin/env node

/**
 * Script de prueba para validar el cálculo de precios
 * Ejecutar con: node scripts/test-pricing-simple.js
 */

// Función de cálculo de precio (copiada de src/lib/data.ts)
function priceForQuantity(tiers, quantity) {
  if (!tiers || tiers.length === 0 || quantity <= 0) {
    return {
      pricePerUnit: null,
      subtotal: 0,
      appliedTier: null,
      isValid: false
    }
  }

  // Ordenar tiers por minQty descendente para encontrar el mayor aplicable
  const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty)
  
  // Encontrar el tier aplicable (mayor minQty <= quantity)
  const appliedTier = sortedTiers.find(tier => 
    quantity >= tier.minQty && 
    (tier.maxQty === null || quantity <= tier.maxQty)
  )

  if (!appliedTier) {
    return {
      pricePerUnit: null,
      subtotal: 0,
      appliedTier: null,
      isValid: false
    }
  }

  return {
    pricePerUnit: appliedTier.pricePerUnit,
    subtotal: appliedTier.pricePerUnit * quantity,
    appliedTier,
    isValid: true
  }
}

// Datos de prueba basados en las escalas de Supabase para Tarjetas de Presentación (ID: 1)
const testTiers = [
  { minQty: 100, maxQty: 499, pricePerUnit: 0.25 },
  { minQty: 500, maxQty: 999, pricePerUnit: 0.18 },
  { minQty: 1000, maxQty: 2499, pricePerUnit: 0.12 },
  { minQty: 2500, maxQty: null, pricePerUnit: 0.08 }
]

// Casos de prueba críticos
const testCases = [
  { quantity: 100, expectedPrice: 0.25, description: "Mínimo del primer tier" },
  { quantity: 500, expectedPrice: 0.18, description: "Mínimo del segundo tier" },
  { quantity: 1000, expectedPrice: 0.12, description: "Mínimo del tercer tier" },
  { quantity: 2500, expectedPrice: 0.08, description: "Mínimo del cuarto tier" },
  { quantity: 50, expectedPrice: null, description: "Por debajo del mínimo" }
]

console.log('🧪 Iniciando pruebas de cálculo de precios...\n')

let passedTests = 0
let totalTests = testCases.length

testCases.forEach((testCase, index) => {
  const result = priceForQuantity(testTiers, testCase.quantity)
  const actualPrice = result.pricePerUnit
  const expectedPrice = testCase.expectedPrice
  
  const passed = actualPrice === expectedPrice
  
  console.log(`Test ${index + 1}: ${testCase.description}`)
  console.log(`  Cantidad: ${testCase.quantity}`)
  console.log(`  Precio esperado: $${expectedPrice || 'null'}`)
  console.log(`  Precio obtenido: $${actualPrice || 'null'}`)
  console.log(`  Subtotal: $${result.subtotal.toFixed(2)}`)
  console.log(`  Tier aplicado: ${result.appliedTier ? `${result.appliedTier.minQty}+ unidades` : 'Ninguno'}`)
  console.log(`  Resultado: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log('')
  
  if (passed) passedTests++
})

console.log('📊 Resumen de pruebas:')
console.log(`  Total: ${totalTests}`)
console.log(`  Pasaron: ${passedTests}`)
console.log(`  Fallaron: ${totalTests - passedTests}`)
console.log(`  Porcentaje: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

if (passedTests === totalTests) {
  console.log('\n🎉 ¡Todas las pruebas pasaron! El cálculo de precios funciona correctamente.')
  console.log('\n✅ Validación completada:')
  console.log('   - Cantidad 100 → $0.25/unidad ✓')
  console.log('   - Cantidad 500 → $0.18/unidad ✓')
  console.log('   - Cantidad 1000 → $0.12/unidad ✓')
  console.log('   - Cantidad 2500 → $0.08/unidad ✓')
  console.log('   - Cantidad 50 → null (por debajo del mínimo) ✓')
  process.exit(0)
} else {
  console.log('\n⚠️  Algunas pruebas fallaron. Revisar la lógica de cálculo.')
  process.exit(1)
}
