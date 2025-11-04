/**
 * @jest-environment node
 */

import {
  extractProductStatus,
  injectProductStatus,
  normalizeProductFromSource,
  prepareProductForPersist
} from '@/lib/product-status'

describe('product-status.ts - Normalización de productos', () => {
  describe('extractProductStatus', () => {
    it('debe extraer status de descripción con marcadores', () => {
      const description = 'Producto de prueba\n<!--FC_STATUS:{"agotado":true,"mas_vendido":false}-->'
      const result = extractProductStatus(description)

      expect(result.description).toBe('Producto de prueba')
      expect(result.status.agotado).toBe(true)
      expect(result.status.mas_vendido).toBe(false)
    })

    it('debe manejar descripción sin marcadores', () => {
      const description = 'Producto simple'
      const result = extractProductStatus(description)

      expect(result.description).toBe('Producto simple')
      expect(result.status.agotado).toBe(false)
      expect(result.status.mas_vendido).toBe(false)
    })

    it('debe manejar descripción null o undefined', () => {
      expect(extractProductStatus(null).status.agotado).toBe(false)
      expect(extractProductStatus(undefined).status.mas_vendido).toBe(false)
    })

    it('debe extraer ambos flags cuando están activos', () => {
      const description = 'Producto\n<!--FC_STATUS:{"agotado":true,"mas_vendido":true}-->'
      const result = extractProductStatus(description)

      expect(result.status.agotado).toBe(true)
      expect(result.status.mas_vendido).toBe(true)
    })

    it('debe ignorar JSON mal formado', () => {
      const description = 'Producto\n<!--FC_STATUS:{invalid json}-->'
      const result = extractProductStatus(description)

      expect(result.status.agotado).toBe(false)
      expect(result.status.mas_vendido).toBe(false)
    })

    it('debe limpiar espacios finales después de extraer', () => {
      const description = 'Producto con espacios   \n<!--FC_STATUS:{"agotado":false,"mas_vendido":false}-->'
      const result = extractProductStatus(description)

      expect(result.description).toBe('Producto con espacios')
    })
  })

  describe('injectProductStatus', () => {
    it('debe inyectar status en descripción', () => {
      const description = 'Producto de prueba'
      const status = { agotado: true, mas_vendido: false }
      const result = injectProductStatus(description, status)

      expect(result).toContain('Producto de prueba')
      expect(result).toContain('<!--FC_STATUS:')
      expect(result).toContain('"agotado":true')
      expect(result).toContain('"mas_vendido":false')
    })

    it('debe retornar descripción sin marcadores si todos los flags son false', () => {
      const description = 'Producto normal'
      const status = { agotado: false, mas_vendido: false }
      const result = injectProductStatus(description, status)

      expect(result).toBe('Producto normal')
      expect(result).not.toContain('<!--FC_STATUS:')
    })

    it('debe reemplazar marcadores existentes', () => {
      const description = 'Producto\n<!--FC_STATUS:{"agotado":false,"mas_vendido":false}-->'
      const status = { agotado: true, mas_vendido: true }
      const result = injectProductStatus(description, status)

      expect(result).toContain('"agotado":true')
      expect(result).toContain('"mas_vendido":true')
      // No debe tener marcadores duplicados
      expect((result.match(/<!--FC_STATUS:/g) || []).length).toBe(1)
    })

    it('debe manejar descripción vacía', () => {
      const result = injectProductStatus('', { agotado: true, mas_vendido: false })

      expect(result).toContain('<!--FC_STATUS:')
      expect(result).toContain('"agotado":true')
    })

    it('debe normalizar valores truthy/falsy', () => {
      const result = injectProductStatus('Test', { agotado: 1 as any, mas_vendido: 0 as any })

      expect(result).toContain('"agotado":true')
      expect(result).toContain('"mas_vendido":false')
    })

    it('debe manejar status parcial', () => {
      const result = injectProductStatus('Test', { agotado: true })

      expect(result).toContain('"agotado":true')
      expect(result).toContain('"mas_vendido":false')
    })
  })

  describe('normalizeProductFromSource', () => {
    it('debe normalizar producto con status embebido', () => {
      const product = {
        id: 1,
        nombre: 'Producto Test',
        descripcion: 'Descripción\n<!--FC_STATUS:{"agotado":true,"mas_vendido":false}-->',
        precio: 100
      }

      const result = normalizeProductFromSource(product)

      expect(result.descripcion).toBe('Descripción')
      expect(result.agotado).toBe(true)
      expect(result.mas_vendido).toBe(false)
      expect(result.nombre).toBe('Producto Test')
      expect(result.precio).toBe(100)
    })

    it('debe normalizar producto sin status', () => {
      const product = {
        id: 1,
        nombre: 'Producto Simple',
        descripcion: 'Solo descripción',
        precio: 50
      }

      const result = normalizeProductFromSource(product)

      expect(result.descripcion).toBe('Solo descripción')
      expect(result.agotado).toBe(false)
      expect(result.mas_vendido).toBe(false)
    })

    it('debe manejar producto sin descripción', () => {
      const product = {
        id: 1,
        nombre: 'Producto',
        descripcion: null,
        precio: 50
      }

      const result = normalizeProductFromSource(product)

      expect(result.descripcion).toBe('')
      expect(result.agotado).toBe(false)
      expect(result.mas_vendido).toBe(false)
    })

    it('debe preservar todas las propiedades originales', () => {
      const product = {
        id: 1,
        nombre: 'Producto',
        descripcion: 'Test',
        precio: 100,
        categoria: 'test',
        sku: 'TEST-001'
      }

      const result = normalizeProductFromSource(product)

      expect(result.id).toBe(1)
      expect(result.categoria).toBe('test')
      expect(result.sku).toBe('TEST-001')
    })
  })

  describe('prepareProductForPersist', () => {
    it('debe preparar producto para persistencia con status', () => {
      const product = {
        id: 1,
        nombre: 'Producto',
        descripcion: 'Descripción',
        agotado: true,
        mas_vendido: false,
        precio: 100
      }

      const result = prepareProductForPersist(product)

      expect(result.descripcion).toContain('Descripción')
      expect(result.descripcion).toContain('<!--FC_STATUS:')
      expect(result.descripcion).toContain('"agotado":true')
      expect(result).not.toHaveProperty('agotado')
      expect(result).not.toHaveProperty('mas_vendido')
    })

    it('debe preparar producto sin flags activos', () => {
      const product = {
        id: 1,
        nombre: 'Producto',
        descripcion: 'Descripción normal',
        agotado: false,
        mas_vendido: false,
        precio: 100
      }

      const result = prepareProductForPersist(product)

      expect(result.descripcion).toBe('Descripción normal')
      expect(result.descripcion).not.toContain('<!--FC_STATUS:')
    })

    it('debe manejar producto sin campos de status', () => {
      const product = {
        id: 1,
        nombre: 'Producto',
        descripcion: 'Test',
        precio: 100
      }

      const result = prepareProductForPersist(product)

      expect(result.descripcion).toBe('Test')
      expect(result).not.toHaveProperty('agotado')
      expect(result).not.toHaveProperty('mas_vendido')
    })

    it('debe preservar otras propiedades', () => {
      const product = {
        id: 1,
        nombre: 'Producto',
        descripcion: 'Test',
        precio: 100,
        sku: 'TEST-001',
        agotado: true,
        mas_vendido: false
      }

      const result = prepareProductForPersist(product)

      expect(result.id).toBe(1)
      expect(result.nombre).toBe('Producto')
      expect(result.precio).toBe(100)
      expect(result.sku).toBe('TEST-001')
    })
  })

  describe('Integración: ciclo completo', () => {
    it('debe mantener integridad en ciclo normalizar -> modificar -> persistir', () => {
      // 1. Producto desde BD (con status embebido)
      const fromDB = {
        id: 1,
        nombre: 'Banner',
        descripcion: 'Banner publicitario\n<!--FC_STATUS:{"agotado":false,"mas_vendido":true}-->',
        precio: 100
      }

      // 2. Normalizar para usar en la app
      const normalized = normalizeProductFromSource(fromDB)
      expect(normalized.agotado).toBe(false)
      expect(normalized.mas_vendido).toBe(true)
      expect(normalized.descripcion).toBe('Banner publicitario')

      // 3. Modificar en la app
      normalized.agotado = true
      normalized.descripcion = 'Banner publicitario actualizado'

      // 4. Preparar para guardar
      const forDB = prepareProductForPersist(normalized)
      expect(forDB.descripcion).toContain('Banner publicitario actualizado')
      expect(forDB.descripcion).toContain('"agotado":true')
      expect(forDB.descripcion).toContain('"mas_vendido":true')

      // 5. Verificar que al normalizar de nuevo funciona
      const reNormalized = normalizeProductFromSource(forDB as any)
      expect(reNormalized.agotado).toBe(true)
      expect(reNormalized.mas_vendido).toBe(true)
      expect(reNormalized.descripcion).toBe('Banner publicitario actualizado')
    })
  })
})
