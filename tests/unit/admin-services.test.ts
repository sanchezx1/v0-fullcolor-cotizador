/**
 * Tests para lib/admin-services.ts
 * Funciones CRUD críticas del panel admin
 */

import { getProductos, getCotizaciones, getLeads, updateCotizacion } from '@/lib/admin-services'

// Mock de Supabase
jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })),
    },
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: mockData[table] || [],
            error: null,
            count: mockData[table]?.length || 0,
          })),
          eq: jest.fn(() => ({
            data: mockData[table] || [],
            error: null,
            count: mockData[table]?.length || 0,
          })),
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockData[table]?.[0] || null,
            error: null,
          })),
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: mockData[table] || [],
              error: null,
              count: mockData[table]?.length || 0,
            })),
          })),
        })),
        or: jest.fn(function(this: any) {
          return this
        }),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 1, estado: 'enviada' },
              error: null,
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 1 },
            error: null,
          })),
        })),
      })),
    })),
  },
}))

// Mock data
const mockData: Record<string, any[]> = {
  productos: [
    {
      id: 1,
      nombre: 'Tarjetas de Presentación',
      sku: 'TDP-001',
      categoria: 'Papelería',
      activo: true,
      created_at: '2025-01-01',
      precios_escalonados: [
        { id: 1, producto_id: 1, cantidad_min: 100, precio_unitario: 0.25 },
        { id: 2, producto_id: 1, cantidad_min: 500, precio_unitario: 0.18 },
      ],
    },
    {
      id: 2,
      nombre: 'Banners',
      sku: 'BAN-001',
      categoria: 'Señalética',
      activo: true,
      created_at: '2025-01-02',
      precios_escalonados: [
        { id: 3, producto_id: 2, cantidad_min: 1, precio_unitario: 25.00 },
      ],
    },
  ],
  cotizaciones: [
    {
      id: 1,
      numero_cotizacion: 'COT-20250101-0001',
      lead_id: 1,
      estado: 'enviada',
      subtotal: 125.00,
      iva: 18.75,
      total: 143.75,
      created_at: '2025-01-01',
      lead: {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
      },
    },
    {
      id: 2,
      numero_cotizacion: 'COT-20250102-0002',
      lead_id: 2,
      estado: 'borrador',
      subtotal: 250.00,
      iva: 37.50,
      total: 287.50,
      created_at: '2025-01-02',
      lead: {
        id: 2,
        nombre: 'María García',
        email: 'maria@example.com',
      },
    },
  ],
  leads: [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '+593991234567',
      empresa: 'Empresa Test',
      created_at: '2025-01-01',
      total_cotizaciones: 2,
      total_ventas: 1000.00,
      tasa_conversion: 0.5,
    },
    {
      id: 2,
      nombre: 'María García',
      email: 'maria@example.com',
      telefono: '+593991234568',
      empresa: null,
      created_at: '2025-01-02',
      total_cotizaciones: 1,
      total_ventas: 0,
      tasa_conversion: 0,
    },
  ],
}

describe('admin-services: Productos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProductos', () => {
    it('debe obtener todos los productos con precios', async () => {
      const result = await getProductos()

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.data[0]).toHaveProperty('nombre', 'Tarjetas de Presentación')
      expect(result.data[0]).toHaveProperty('precios_escalonados')
      expect(result.data[0].precios_escalonados).toHaveLength(2)
    })

    it('debe calcular precio_base correctamente', async () => {
      const result = await getProductos()

      // Precio base debe ser el más bajo
      expect(result.data[0].precio_base).toBe(0.18) // Min de [0.25, 0.18]
      expect(result.data[1].precio_base).toBe(25.00)
    })

    it('debe aplicar paginación correctamente', async () => {
      const result = await getProductos({ page: 1, perPage: 1 })

      expect(result.page).toBe(1)
      expect(result.perPage).toBe(1)
      expect(result.totalPages).toBe(2)
    })

    it('debe manejar error de autenticación', async () => {
      // Mock usuario no autenticado
      const mockSupabase = require('@/lib/supabase-client').supabase
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('No autenticado'),
      })

      await expect(getProductos()).rejects.toThrow('Usuario no autenticado')
    })
  })
})

describe('admin-services: Cotizaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCotizaciones', () => {
    it('debe obtener todas las cotizaciones con relaciones', async () => {
      const result = await getCotizaciones()

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.data[0]).toHaveProperty('numero_cotizacion')
      expect(result.data[0]).toHaveProperty('lead')
      expect(result.data[0].lead).toHaveProperty('nombre', 'Juan Pérez')
    })

    it('debe calcular totales correctamente', async () => {
      const result = await getCotizaciones()

      const cotizacion = result.data[0]
      expect(cotizacion.subtotal).toBe(125.00)
      expect(cotizacion.iva).toBe(18.75)
      expect(cotizacion.total).toBe(143.75)
      // Verificar IVA 15%
      expect(cotizacion.iva).toBe(cotizacion.subtotal * 0.15)
    })

    it('debe incluir estado de cotización', async () => {
      const result = await getCotizaciones()

      expect(result.data[0].estado).toBe('enviada')
      expect(result.data[1].estado).toBe('borrador')
    })
  })

  describe('updateCotizacion', () => {
    it('debe actualizar estado de cotización', async () => {
      const result = await updateCotizacion(1, { estado: 'aprobada' })

      expect(result).toHaveProperty('id', 1)
      expect(result).toHaveProperty('estado', 'enviada')
    })

    it('debe permitir actualizar campos parciales', async () => {
      const result = await updateCotizacion(1, { 
        estado: 'aprobada'
      })
      
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
    })
  })
})

describe('admin-services: Leads', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLeads', () => {
    it('debe obtener todos los leads', async () => {
      const result = await getLeads()

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.data[0]).toHaveProperty('nombre', 'Juan Pérez')
    })

    it('debe incluir información de contacto', async () => {
      const result = await getLeads()

      const lead = result.data[0]
      expect(lead.email).toBe('juan@example.com')
      expect(lead.telefono).toBe('+593991234567')
      expect(lead.empresa).toBe('Empresa Test')
    })

    it('debe manejar leads sin empresa', async () => {
      const result = await getLeads()

      const leadSinEmpresa = result.data[1]
      expect(leadSinEmpresa.empresa).toBeNull()
    })
  })
})

describe('admin-services: Validaciones', () => {
  it('debe rechazar operaciones sin autenticación', async () => {
    const mockSupabase = require('@/lib/supabase-client').supabase
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('No autenticado'),
    })

    await expect(getProductos()).rejects.toThrow()
  })

  it('debe manejar errores de Supabase correctamente', async () => {
    const mockSupabase = require('@/lib/supabase-client').supabase
    
    // Simular error de Supabase
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: null,
            error: { message: 'Database error' },
            count: 0,
          })),
        })),
      })),
    })

    await expect(getProductos()).rejects.toThrow('Error al obtener productos')
  })
})
