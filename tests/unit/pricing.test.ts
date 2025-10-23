/**
 * Tests unitarios para cálculo de precios escalonados
 * 
 * CRÍTICO: Esta función determina el precio que paga el cliente
 * según la cantidad solicitada. Debe ser 100% confiable.
 */

import { priceForQuantity, PricingTier } from '@/src/lib/data'

describe('priceForQuantity - Cálculo de precios escalonados', () => {
  // Datos de prueba basados en Tarjetas de Presentación reales
  const standardTiers: PricingTier[] = [
    { minQty: 100, maxQty: 499, pricePerUnit: 0.25 },
    { minQty: 500, maxQty: 999, pricePerUnit: 0.18 },
    { minQty: 1000, maxQty: 2499, pricePerUnit: 0.12 },
    { minQty: 2500, maxQty: null, pricePerUnit: 0.08 },
  ]

  describe('Casos exitosos (happy path)', () => {
    test('debe calcular correctamente para cantidad mínima del primer tier (100)', () => {
      const result = priceForQuantity(standardTiers, 100)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.25)
      expect(result.subtotal).toBe(25.0) // 100 * 0.25
      expect(result.appliedTier).toEqual(standardTiers[0])
    })

    test('debe calcular correctamente para cantidad en medio del primer tier (300)', () => {
      const result = priceForQuantity(standardTiers, 300)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.25)
      expect(result.subtotal).toBe(75.0) // 300 * 0.25
    })

    test('debe calcular correctamente para cantidad máxima del primer tier (499)', () => {
      const result = priceForQuantity(standardTiers, 499)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.25)
      expect(result.subtotal).toBe(124.75) // 499 * 0.25
    })

    test('debe usar el segundo tier para cantidad 500', () => {
      const result = priceForQuantity(standardTiers, 500)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.18)
      expect(result.subtotal).toBe(90.0) // 500 * 0.18
      expect(result.appliedTier).toEqual(standardTiers[1])
    })

    test('debe usar el tercer tier para cantidad 1000', () => {
      const result = priceForQuantity(standardTiers, 1000)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.12)
      expect(result.subtotal).toBe(120.0) // 1000 * 0.12
      expect(result.appliedTier).toEqual(standardTiers[2])
    })

    test('debe usar el cuarto tier para cantidad 2500', () => {
      const result = priceForQuantity(standardTiers, 2500)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.08)
      expect(result.subtotal).toBe(200.0) // 2500 * 0.08
      expect(result.appliedTier).toEqual(standardTiers[3])
    })

    test('debe usar el cuarto tier para cantidades muy grandes (10000)', () => {
      const result = priceForQuantity(standardTiers, 10000)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.08)
      expect(result.subtotal).toBe(800.0) // 10000 * 0.08
    })
  })

  describe('Casos edge (bordes entre tiers)', () => {
    test('debe cambiar de tier correctamente en el límite 499→500', () => {
      const result499 = priceForQuantity(standardTiers, 499)
      const result500 = priceForQuantity(standardTiers, 500)
      
      expect(result499.pricePerUnit).toBe(0.25)
      expect(result500.pricePerUnit).toBe(0.18)
      expect(result499.subtotal).toBe(124.75)
      expect(result500.subtotal).toBe(90.0)
    })

    test('debe cambiar de tier correctamente en el límite 999→1000', () => {
      const result999 = priceForQuantity(standardTiers, 999)
      const result1000 = priceForQuantity(standardTiers, 1000)
      
      expect(result999.pricePerUnit).toBe(0.18)
      expect(result1000.pricePerUnit).toBe(0.12)
    })

    test('debe cambiar de tier correctamente en el límite 2499→2500', () => {
      const result2499 = priceForQuantity(standardTiers, 2499)
      const result2500 = priceForQuantity(standardTiers, 2500)
      
      expect(result2499.pricePerUnit).toBe(0.12)
      expect(result2500.pricePerUnit).toBe(0.08)
    })
  })

  describe('Casos de error (validación)', () => {
    test('debe retornar inválido para cantidad 0', () => {
      const result = priceForQuantity(standardTiers, 0)
      
      expect(result.isValid).toBe(false)
      expect(result.pricePerUnit).toBeNull()
      expect(result.subtotal).toBe(0)
      expect(result.appliedTier).toBeNull()
    })

    test('debe retornar inválido para cantidad negativa', () => {
      const result = priceForQuantity(standardTiers, -100)
      
      expect(result.isValid).toBe(false)
      expect(result.pricePerUnit).toBeNull()
      expect(result.subtotal).toBe(0)
    })

    test('debe retornar inválido para cantidad por debajo del mínimo (50)', () => {
      const result = priceForQuantity(standardTiers, 50)
      
      expect(result.isValid).toBe(false)
      expect(result.pricePerUnit).toBeNull()
      expect(result.subtotal).toBe(0)
    })

    test('debe retornar inválido para array de tiers vacío', () => {
      const result = priceForQuantity([], 500)
      
      expect(result.isValid).toBe(false)
      expect(result.pricePerUnit).toBeNull()
      expect(result.subtotal).toBe(0)
    })

    test('debe retornar inválido para tiers null/undefined', () => {
      const resultNull = priceForQuantity(null as any, 500)
      const resultUndefined = priceForQuantity(undefined as any, 500)
      
      expect(resultNull.isValid).toBe(false)
      expect(resultUndefined.isValid).toBe(false)
    })
  })

  describe('Casos especiales de configuración', () => {
    test('debe funcionar con un solo tier', () => {
      const singleTier: PricingTier[] = [
        { minQty: 50, maxQty: null, pricePerUnit: 1.0 },
      ]
      
      const result = priceForQuantity(singleTier, 100)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(1.0)
      expect(result.subtotal).toBe(100.0)
    })

    test('debe funcionar con precios decimales precisos', () => {
      const decimalTiers: PricingTier[] = [
        { minQty: 100, maxQty: null, pricePerUnit: 0.125 },
      ]
      
      const result = priceForQuantity(decimalTiers, 800)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.125)
      expect(result.subtotal).toBe(100.0) // 800 * 0.125
    })

    test('debe manejar tiers con gaps (no continuos)', () => {
      const gappedTiers: PricingTier[] = [
        { minQty: 100, maxQty: 200, pricePerUnit: 0.5 },
        { minQty: 500, maxQty: null, pricePerUnit: 0.3 },
      ]
      
      const result300 = priceForQuantity(gappedTiers, 300)
      const result500 = priceForQuantity(gappedTiers, 500)
      
      // 300 cae en el gap, debe ser inválido
      expect(result300.isValid).toBe(false)
      
      // 500 debe usar el segundo tier
      expect(result500.isValid).toBe(true)
      expect(result500.pricePerUnit).toBe(0.3)
    })
  })

  describe('Reglas de negocio (según RULES.md)', () => {
    test('debe elegir la MAYOR escala con cantidad_min <= cantidad solicitada', () => {
      // Si cantidad = 600, debe usar el tier de 500-999, NO el de 100-499
      const result = priceForQuantity(standardTiers, 600)
      
      expect(result.appliedTier?.minQty).toBe(500)
      expect(result.pricePerUnit).toBe(0.18)
    })

    test('no debe bloquear si cantidad < mínimo (solo marcar como inválido)', () => {
      const result = priceForQuantity(standardTiers, 50)
      
      // Debe retornar resultado, aunque inválido
      expect(result).toBeDefined()
      expect(result.isValid).toBe(false)
      // En la UI esto mostraría un aviso, pero no bloquea el input
    })

    test('subtotal debe ser cantidad * precio_unitario_aplicado', () => {
      const result = priceForQuantity(standardTiers, 750)
      
      expect(result.subtotal).toBe(750 * 0.18) // 135.0
      expect(result.subtotal).toBe(result.pricePerUnit! * 750)
    })
  })

  describe('Performance y edge cases numéricos', () => {
    test('debe manejar cantidades muy grandes (1 millón)', () => {
      const result = priceForQuantity(standardTiers, 1000000)
      
      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(0.08)
      expect(result.subtotal).toBe(80000.0)
    })

    test('debe manejar cantidades con decimales (redondear internamente)', () => {
      const result = priceForQuantity(standardTiers, 500.7)
      
      expect(result.isValid).toBe(true)
      // Debe usar cantidad exacta sin redondear
      expect(result.subtotal).toBe(500.7 * 0.18)
    })

    test('debe calcular correctamente con muchos tiers (10 niveles)', () => {
      const manyTiers: PricingTier[] = Array.from({ length: 10 }, (_, i) => ({
        minQty: (i + 1) * 100,
        maxQty: i < 9 ? (i + 2) * 100 - 1 : null,
        pricePerUnit: 1.0 - i * 0.05,
      }))
      
      const result = priceForQuantity(manyTiers, 550)
      
      expect(result.isValid).toBe(true)
      expect(result.appliedTier?.minQty).toBe(500) // Tier 5
    })
  })
})
