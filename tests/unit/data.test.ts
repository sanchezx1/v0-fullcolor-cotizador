/**
 * @jest-environment node
 */

import {
  priceForQuantity,
  clearCache,
  revalidateCache,
  getProductWithTiers,
  listProducts,
  searchProducts,
  getProductsByCategory,
  calculatePriceForProduct
} from '@/src/lib/data'
import { supabase } from '@/src/services/supabaseClient'

// Mock de Supabase
jest.mock('@/src/services/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}))

// Mock de product-status
jest.mock('@/lib/product-status', () => ({
  normalizeProductFromSource: jest.fn((p) => p)
}))

describe('data.ts - Funciones de datos y caché', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
  })

  describe('priceForQuantity', () => {
    const tiers = [
      { minQty: 1, maxQty: 9, pricePerUnit: 10 },
      { minQty: 10, maxQty: 49, pricePerUnit: 9 },
      { minQty: 50, maxQty: null, pricePerUnit: 8 }
    ]

    it('debe calcular precio para cantidad mínima', () => {
      const result = priceForQuantity(tiers, 5)

      expect(result.pricePerUnit).toBe(10)
      expect(result.subtotal).toBe(50)
      expect(result.appliedTier?.minQty).toBe(1)
      expect(result.isValid).toBe(true)
    })

    it('debe aplicar tier correcto para cantidad media', () => {
      const result = priceForQuantity(tiers, 25)

      expect(result.pricePerUnit).toBe(9)
      expect(result.subtotal).toBe(225)
      expect(result.appliedTier?.minQty).toBe(10)
    })

    it('debe aplicar tier correcto para cantidad alta', () => {
      const result = priceForQuantity(tiers, 100)

      expect(result.pricePerUnit).toBe(8)
      expect(result.subtotal).toBe(800)
      expect(result.appliedTier?.minQty).toBe(50)
    })

    it('debe aplicar tier en el límite exacto', () => {
      const result = priceForQuantity(tiers, 10)

      expect(result.pricePerUnit).toBe(9)
      expect(result.appliedTier?.minQty).toBe(10)
    })

    it('debe manejar cantidad cero como inválida', () => {
      const result = priceForQuantity(tiers, 0)

      expect(result.isValid).toBe(false)
      expect(result.pricePerUnit).toBeNull()
      expect(result.subtotal).toBe(0)
    })

    it('debe manejar cantidad negativa como inválida', () => {
      const result = priceForQuantity(tiers, -5)

      expect(result.isValid).toBe(false)
    })

    it('debe manejar tiers vacíos', () => {
      const result = priceForQuantity([], 10)

      expect(result.isValid).toBe(false)
      expect(result.pricePerUnit).toBeNull()
    })

    it('debe calcular subtotal correctamente', () => {
      const result = priceForQuantity(tiers, 7)

      expect(result.subtotal).toBe(7 * 10)
    })
  })

  describe('clearCache', () => {
    it('debe limpiar el cache correctamente', () => {
      clearCache()
      // No hay forma directa de verificar, pero no debe lanzar error
      expect(true).toBe(true)
    })
  })

  describe('listProducts', () => {
    it('debe listar todos los productos activos', async () => {
      const mockProducts = [
        { id: 1, nombre: 'Producto 1', categoria: 'Cat A', activo: true },
        { id: 2, nombre: 'Producto 2', categoria: 'Cat B', activo: true }
      ]

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockProducts,
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await listProducts()

      expect(result).toHaveLength(2)
      expect(result[0].nombre).toBe('Producto 1')
      expect(fromMock).toHaveBeenCalledWith('productos')
    })

    it('debe retornar array vacío en caso de error', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.reject(new Error('DB Error')))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await listProducts()

      expect(result).toEqual([])
    })

    it('debe cargar productos desde la base de datos', async () => {
      const mockProducts = [
        { id: 1, nombre: 'Producto 1', activo: true }
      ]

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockProducts,
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await listProducts()
      
      expect(result).toHaveLength(1)
      expect(fromMock).toHaveBeenCalledWith('productos')
    })
  })

  describe('searchProducts', () => {
    beforeEach(() => {
      const mockProducts = [
        { id: 1, nombre: 'Banner Publicitario', categoria: 'Impresión', descripcion: 'Banner grande', activo: true },
        { id: 2, nombre: 'Tarjeta de Presentación', categoria: 'Papelería', descripcion: 'Tarjetas', activo: true },
        { id: 3, nombre: 'Volante Promocional', categoria: 'Impresión', descripcion: 'Volantes A5', activo: true }
      ]

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockProducts,
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock
    })

    it('debe buscar productos por nombre', async () => {
      const result = await searchProducts('banner')

      expect(result).toHaveLength(1)
      expect(result[0].nombre).toContain('Banner')
    })

    it('debe buscar productos por descripción', async () => {
      const result = await searchProducts('grande')

      expect(result).toHaveLength(1)
      expect(result[0].descripcion).toContain('grande')
    })

    it('debe buscar productos por categoría', async () => {
      const result = await searchProducts('impresión')

      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    it('debe ser case-insensitive', async () => {
      const result = await searchProducts('BANNER')

      expect(result).toHaveLength(1)
    })

    it('debe retornar todos los productos si el término está vacío', async () => {
      const result = await searchProducts('')

      expect(result).toHaveLength(3)
    })

    it('debe retornar array vacío si no hay coincidencias', async () => {
      const result = await searchProducts('XXXXXX')

      expect(result).toHaveLength(0)
    })
  })

  describe('getProductsByCategory', () => {
    beforeEach(() => {
      const mockProducts = [
        { id: 1, nombre: 'Producto 1', categoria: 'Impresión', activo: true },
        { id: 2, nombre: 'Producto 2', categoria: 'Papelería', activo: true },
        { id: 3, nombre: 'Producto 3', categoria: 'Impresión', activo: true }
      ]

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockProducts,
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock
    })

    it('debe filtrar productos por categoría', async () => {
      const result = await getProductsByCategory('Impresión')

      expect(result).toHaveLength(2)
      expect(result.every(p => p.categoria === 'Impresión')).toBe(true)
    })

    it('debe retornar array vacío para categoría inexistente', async () => {
      const result = await getProductsByCategory('NoExiste')

      expect(result).toHaveLength(0)
    })

    it('debe retornar solo productos de esa categoría', async () => {
      const result = await getProductsByCategory('Papelería')

      expect(result).toHaveLength(1)
      expect(result[0].nombre).toBe('Producto 2')
    })
  })

  describe('getProductWithTiers', () => {
    it('debe obtener producto con sus precios escalonados', async () => {
      const mockProduct = { id: 1, nombre: 'Producto 1', activo: true }
      const mockTiers = [
        { id: 1, producto_id: 1, cantidad_min: 1, precio_unitario: 10 },
        { id: 2, producto_id: 1, cantidad_min: 10, precio_unitario: 9 }
      ]

      const fromMock = jest.fn((table: string) => {
        if (table === 'productos') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  order: jest.fn(() => Promise.resolve({
                    data: [mockProduct],
                    error: null
                  }))
                }))
              }))
            }))
          }
        }
        // precios_escalonados
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockTiers,
                error: null
              }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getProductWithTiers(1)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(1)
      expect(result?.pricingTiers).toHaveLength(2)
    })

    it('debe retornar null para producto inexistente', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getProductWithTiers(999)

      expect(result).toBeNull()
    })
  })

  describe('calculatePriceForProduct', () => {
    it('debe calcular precio para producto y cantidad', async () => {
      const mockProduct = { id: 1, nombre: 'Producto 1', activo: true }
      const mockTiers = [
        { id: 1, producto_id: 1, cantidad_min: 1, precio_unitario: 10 },
        { id: 2, producto_id: 1, cantidad_min: 10, precio_unitario: 9 }
      ]

      const fromMock = jest.fn((table: string) => {
        if (table === 'productos') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  order: jest.fn(() => Promise.resolve({
                    data: [mockProduct],
                    error: null
                  }))
                }))
              }))
            }))
          }
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockTiers,
                error: null
              }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await calculatePriceForProduct(1, 15)

      expect(result.isValid).toBe(true)
      expect(result.pricePerUnit).toBe(9)
      expect(result.subtotal).toBe(135)
      expect(result.product).not.toBeNull()
    })

    it('debe manejar producto inexistente', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await calculatePriceForProduct(999, 10)

      expect(result.isValid).toBe(false)
      expect(result.product).toBeNull()
    })
  })
})
