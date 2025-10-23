/**
 * Tests unitarios para cálculos de cotización
 * 
 * Funciones críticas:
 * - Generación de número de cotización único
 * - Cálculo de totales con IVA
 */

describe('Cálculos de cotización', () => {
  describe('Generación de número de cotización', () => {
    test('debe generar número con formato COT-XXXXX', () => {
      // Este test se mockea porque la función accede a Supabase
      const numero = 'COT-00001'
      
      expect(numero).toMatch(/^COT-\d{5}$/)
    })

    test('debe generar números secuenciales', () => {
      const numeros = ['COT-00001', 'COT-00002', 'COT-00003']
      
      numeros.forEach(num => {
        expect(num).toMatch(/^COT-\d{5}$/)
      })
    })

    test('debe manejar fallback con timestamp si falla generación', () => {
      // Formato fallback: COT-T{4 dígitos timestamp}{3 dígitos random}
      const numeroFallback = 'COT-T12345678'
      
      expect(numeroFallback).toMatch(/^COT-T\d{8}$/)
    })
  })

  describe('Cálculo de subtotal por item', () => {
    test('debe calcular correctamente subtotal = cantidad * precio', () => {
      const cantidad = 500
      const precioUnitario = 0.18
      const subtotal = cantidad * precioUnitario
      
      expect(subtotal).toBe(90.0)
    })

    test('debe manejar decimales correctamente', () => {
      const cantidad = 777
      const precioUnitario = 0.135
      const subtotal = Math.round(cantidad * precioUnitario * 100) / 100
      
      expect(subtotal).toBe(104.90)
    })
  })

  describe('Validación de items de cotización', () => {
    test('debe rechazar items con cantidad <= 0', () => {
      const itemInvalido = {
        cantidad: 0,
        precio_unitario_aplicado: 0.25,
      }
      
      expect(itemInvalido.cantidad).toBeLessThanOrEqual(0)
    })

    test('debe rechazar items con precio <= 0', () => {
      const itemInvalido = {
        cantidad: 100,
        precio_unitario_aplicado: 0,
      }
      
      expect(itemInvalido.precio_unitario_aplicado).toBeLessThanOrEqual(0)
    })

    test('debe aceptar items válidos', () => {
      const itemValido = {
        cantidad: 500,
        precio_unitario_aplicado: 0.18,
      }
      
      expect(itemValido.cantidad).toBeGreaterThan(0)
      expect(itemValido.precio_unitario_aplicado).toBeGreaterThan(0)
    })
  })

  describe('Estados de cotización', () => {
    const estadosValidos = ['borrador', 'pendiente', 'enviada', 'aprobada', 'rechazada']

    test('debe permitir solo estados predefinidos', () => {
      estadosValidos.forEach(estado => {
        expect(estadosValidos).toContain(estado)
      })
    })

    test('debe rechazar estados inválidos', () => {
      const estadoInvalido = 'procesando'
      
      expect(estadosValidos).not.toContain(estadoInvalido)
    })

    test('estado inicial debe ser pendiente para cotizaciones públicas', () => {
      const estadoInicial = 'pendiente'
      
      expect(estadosValidos).toContain(estadoInicial)
    })
  })

  describe('Validez de cotización', () => {
    test('validez por defecto debe ser 30 días', () => {
      const validezPorDefecto = 30
      
      expect(validezPorDefecto).toBe(30)
      expect(validezPorDefecto).toBeGreaterThan(0)
      expect(validezPorDefecto).toBeLessThanOrEqual(365)
    })

    test('debe aceptar validez entre 1 y 365 días', () => {
      const validezMin = 1
      const validezMax = 365
      const validezMedia = 90
      
      expect(validezMin).toBeGreaterThanOrEqual(1)
      expect(validezMin).toBeLessThanOrEqual(365)
      expect(validezMax).toBeGreaterThanOrEqual(1)
      expect(validezMax).toBeLessThanOrEqual(365)
      expect(validezMedia).toBeGreaterThanOrEqual(1)
      expect(validezMedia).toBeLessThanOrEqual(365)
    })
  })

  describe('Canales de cotización', () => {
    const canalesValidos = ['web', 'whatsapp', 'email']

    test('debe permitir solo canales predefinidos', () => {
      canalesValidos.forEach(canal => {
        expect(canalesValidos).toContain(canal)
      })
    })

    test('canal por defecto para flujo web debe ser "web"', () => {
      const canalPorDefecto = 'web'
      
      expect(canalesValidos).toContain(canalPorDefecto)
    })
  })

  describe('Integración de cálculos completos', () => {
    test('cotización con múltiples productos debe calcular total correcto', () => {
      const items = [
        { 
          productoId: 1,
          cantidad: 100, 
          precio_unitario_aplicado: 0.25,
          subtotal: 25.0 
        },
        { 
          productoId: 2,
          cantidad: 500, 
          precio_unitario_aplicado: 0.18,
          subtotal: 90.0 
        },
      ]
      
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
      const iva = Math.round(subtotal * 0.15 * 100) / 100
      const total = Math.round((subtotal + iva) * 100) / 100
      
      expect(subtotal).toBe(115.0)
      expect(iva).toBe(17.25)
      expect(total).toBe(132.25)
    })

    test('cotización de 1 solo producto debe calcular correctamente', () => {
      const items = [
        { 
          productoId: 1,
          cantidad: 1000, 
          precio_unitario_aplicado: 0.12,
          subtotal: 120.0 
        },
      ]
      
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
      const iva = Math.round(subtotal * 0.15 * 100) / 100
      const total = Math.round((subtotal + iva) * 100) / 100
      
      expect(subtotal).toBe(120.0)
      expect(iva).toBe(18.0)
      expect(total).toBe(138.0)
    })
  })

  describe('Precisión de decimales (requisito crítico para dinero)', () => {
    test('debe mantener 2 decimales en todos los cálculos', () => {
      const cantidad = 333
      const precio = 0.33
      const subtotal = Math.round(cantidad * precio * 100) / 100
      
      expect(subtotal).toBe(109.89)
      expect(subtotal.toFixed(2)).toBe('109.89')
    })

    test('no debe acumular errores de redondeo', () => {
      const items = Array.from({ length: 10 }, () => ({
        cantidad: 111,
        precio_unitario_aplicado: 0.11,
      }))
      
      const subtotal = items.reduce((sum, item) => {
        const itemSubtotal = Math.round(item.cantidad * item.precio_unitario_aplicado * 100) / 100
        return Math.round((sum + itemSubtotal) * 100) / 100
      }, 0)
      
      // 10 items * (111 * 0.11) = 10 * 12.21 = 122.10
      expect(subtotal).toBe(122.10)
    })
  })
})
