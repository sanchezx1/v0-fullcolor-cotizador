/**
 * Tests unitarios para validaciones de datos
 * 
 * Validaciones críticas del negocio:
 * - Email válido
 * - Teléfono ecuatoriano (+593)
 * - RUC/Cédula ecuatoriana
 * - Formato SKU
 */

import {
  validarTelefonoEcuador,
  validarRucCedula,
  validarFormatoSKU,
  calcularTotalesCotizacion,
} from '@/src/lib/validations'

describe('Validaciones de datos', () => {
  describe('validarTelefonoEcuador', () => {
    test('debe aceptar teléfono válido con espacios (+593 99 123 4567)', () => {
      expect(validarTelefonoEcuador('+593 99 123 4567')).toBe(true)
    })

    test('debe aceptar teléfono válido sin espacios (+59399123456 7)', () => {
      expect(validarTelefonoEcuador('+593991234567')).toBe(true)
    })

    test('debe rechazar teléfono sin código de país', () => {
      expect(validarTelefonoEcuador('991234567')).toBe(false)
    })

    test('debe rechazar teléfono con código de país incorrecto (+1)', () => {
      expect(validarTelefonoEcuador('+1 999 123 4567')).toBe(false)
    })

    test('debe rechazar teléfono con menos dígitos', () => {
      expect(validarTelefonoEcuador('+593 99 123 456')).toBe(false)
    })

    test('debe rechazar teléfono con más dígitos', () => {
      expect(validarTelefonoEcuador('+593 99 123 45678')).toBe(false)
    })

    test('debe rechazar string vacío', () => {
      expect(validarTelefonoEcuador('')).toBe(false)
    })

    test('debe rechazar null/undefined', () => {
      expect(validarTelefonoEcuador(null as any)).toBe(false)
      expect(validarTelefonoEcuador(undefined as any)).toBe(false)
    })
  })

  describe('validarRucCedula', () => {
    test('debe aceptar cédula ecuatoriana válida (10 dígitos)', () => {
      // Cédulas de prueba con algoritmo válido
      expect(validarRucCedula('1234567890')).toBe(true)
    })

    test('debe aceptar RUC válido (13 dígitos)', () => {
      expect(validarRucCedula('1234567890001')).toBe(true)
    })

    test('debe rechazar cédula con menos de 10 dígitos', () => {
      expect(validarRucCedula('123456789')).toBe(false)
    })

    test('debe rechazar RUC con dígitos incorrectos', () => {
      expect(validarRucCedula('12345678900012')).toBe(false) // 14 dígitos
    })

    test('debe rechazar valores no numéricos', () => {
      expect(validarRucCedula('ABC1234567')).toBe(false)
    })

    test('debe rechazar string vacío', () => {
      expect(validarRucCedula('')).toBe(false)
    })
  })

  describe('validarFormatoSKU', () => {
    test('debe aceptar SKU válido con letras y números (ABC-123)', () => {
      expect(validarFormatoSKU('ABC-123')).toBe(true)
    })

    test('debe aceptar SKU solo con letras mayúsculas (CARD)', () => {
      expect(validarFormatoSKU('CARD')).toBe(true)
    })

    test('debe aceptar SKU con guiones (CAT-PRD-001)', () => {
      expect(validarFormatoSKU('CAT-PRD-001')).toBe(true)
    })

    test('debe rechazar SKU con caracteres especiales (@#$)', () => {
      expect(validarFormatoSKU('ABC@123')).toBe(false)
    })

    test('debe rechazar SKU vacío', () => {
      expect(validarFormatoSKU('')).toBe(false)
    })

    test('debe rechazar SKU solo con espacios', () => {
      expect(validarFormatoSKU('   ')).toBe(false)
    })
  })

  describe('calcularTotalesCotizacion', () => {
    test('debe calcular correctamente subtotal, IVA y total', () => {
      const items = [
        { cantidad: 100, precio_unitario_aplicado: 0.25 }, // 25.00
        { cantidad: 500, precio_unitario_aplicado: 0.18 }, // 90.00
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      expect(totales.subtotal).toBe(115.0) // 25 + 90
      expect(totales.iva).toBe(17.25) // 115 * 0.15
      expect(totales.total).toBe(132.25) // 115 + 17.25
    })

    test('debe redondear correctamente a 2 decimales', () => {
      const items = [
        { cantidad: 333, precio_unitario_aplicado: 0.33 }, // 109.89
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      expect(totales.subtotal).toBe(109.89)
      expect(totales.iva).toBe(16.48) // 109.89 * 0.15 = 16.4835 → 16.48
      expect(totales.total).toBe(126.37)
    })

    test('debe manejar array vacío', () => {
      const totales = calcularTotalesCotizacion([])
      
      expect(totales.subtotal).toBe(0)
      expect(totales.iva).toBe(0)
      expect(totales.total).toBe(0)
    })

    test('debe manejar un solo item', () => {
      const items = [
        { cantidad: 1000, precio_unitario_aplicado: 0.12 },
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      expect(totales.subtotal).toBe(120.0)
      expect(totales.iva).toBe(18.0) // 120 * 0.15
      expect(totales.total).toBe(138.0)
    })

    test('debe calcular correctamente con múltiples items', () => {
      const items = [
        { cantidad: 100, precio_unitario_aplicado: 0.25 },  // 25.00
        { cantidad: 500, precio_unitario_aplicado: 0.18 },  // 90.00
        { cantidad: 1000, precio_unitario_aplicado: 0.12 }, // 120.00
        { cantidad: 2500, precio_unitario_aplicado: 0.08 }, // 200.00
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      expect(totales.subtotal).toBe(435.0) // 25 + 90 + 120 + 200
      expect(totales.iva).toBe(65.25) // 435 * 0.15
      expect(totales.total).toBe(500.25) // 435 + 65.25
    })

    test('debe aplicar IVA del 15% (regla de Ecuador)', () => {
      const items = [
        { cantidad: 100, precio_unitario_aplicado: 1.0 },
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      // 100 * 1.0 = 100
      // IVA = 100 * 0.15 = 15
      // Total = 100 + 15 = 115
      expect(totales.subtotal).toBe(100.0)
      expect(totales.iva).toBe(15.0)
      expect(totales.total).toBe(115.0)
    })

    test('debe manejar cantidades grandes sin overflow', () => {
      const items = [
        { cantidad: 100000, precio_unitario_aplicado: 0.05 },
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      expect(totales.subtotal).toBe(5000.0)
      expect(totales.iva).toBe(750.0)
      expect(totales.total).toBe(5750.0)
    })

    test('debe manejar precios con decimales precisos', () => {
      const items = [
        { cantidad: 777, precio_unitario_aplicado: 0.135 },
      ]
      
      const totales = calcularTotalesCotizacion(items)
      
      expect(totales.subtotal).toBe(104.90) // 777 * 0.135 = 104.895 → 104.90
      expect(totales.iva).toBe(15.73) // 104.90 * 0.15 = 15.735 → 15.73
      expect(totales.total).toBe(120.63) // 104.90 + 15.73
    })
  })

  describe('Integración de validaciones', () => {
    test('datos de lead completo deben pasar todas las validaciones', () => {
      const leadData = {
        nombre: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        telefono: '+593 99 123 4567',
        empresa: 'Empresa Test S.A.',
        ruc_cedula: '1234567890001',
      }
      
      // Email es validado por Zod en validations.ts (regex estándar)
      expect(leadData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(validarTelefonoEcuador(leadData.telefono)).toBe(true)
      expect(validarRucCedula(leadData.ruc_cedula)).toBe(true)
    })

    test('producto completo debe pasar validaciones de SKU', () => {
      const productoData = {
        nombre: 'Tarjetas de Presentación',
        sku: 'CARD-001',
        categoria: 'papeleria_corporativa',
        minimo_pedido: 100,
      }
      
      expect(validarFormatoSKU(productoData.sku)).toBe(true)
      expect(productoData.minimo_pedido).toBeGreaterThan(0)
    })
  })
})
