/**
 * @jest-environment node
 */

import { 
  crearLead, 
  crearCotizacion, 
  registrarEvento, 
  actualizarEstadoCotizacion,
  obtenerCotizacionCompleta 
} from '@/src/services/quotes'
import { supabase } from '@/src/services/supabaseClient'

// Mock de Supabase
jest.mock('@/src/services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: null,
            error: null
          })),
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          })),
          data: null,
          error: null
        })),
        data: null,
        error: null
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    functions: {
      invoke: jest.fn()
    }
  }
}))

describe('quotes.ts - Funciones críticas de cotizaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('crearLead', () => {
    it('debe crear un nuevo lead cuando el email no existe', async () => {
      const mockLead = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '0999999999',
        empresa: 'Empresa Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          lead: mockLead
        },
        error: null
      })

      const result = await crearLead({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '0999999999',
        empresa: 'Empresa Test'
      })

      expect(result).toEqual(mockLead)
      expect(supabase.rpc).toHaveBeenCalledWith(
        'create_public_lead',
        expect.objectContaining({
          p_email: 'juan@example.com'
        })
      )
    })

    it('debe lanzar error LEAD_EMAIL_EXISTS cuando el email ya existe', async () => {
      const existingLead = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '0999999999',
        empresa: 'Empresa Test'
      }

      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          success: false,
          code: 'LEAD_EMAIL_EXISTS',
          existing_lead: existingLead,
          new_data: {
            nombre: 'Juan P�rez',
            email: 'juan@example.com'
          }
        },
        error: null
      })

      await expect(crearLead({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '0999999999',
        empresa: 'Empresa Test'
      })).rejects.toThrow('LEAD_EMAIL_EXISTS')
    })

    it('debe incluir campos opcionales cuando se proporcionan', async () => {
      const mockLead = {
        id: 2,
        nombre: 'María González',
        email: 'maria@example.com',
        telefono: '0988888888',
        empresa: 'Empresa 2',
        ruc_cedula: '1234567890',
        ciudad: 'Quito',
        notas: 'Cliente preferencial',
        created_at: new Date().toISOString()
      }

      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          lead: mockLead
        },
        error: null
      })

      const result = await crearLead({
        nombre: 'María González',
        email: 'maria@example.com',
        telefono: '0988888888',
        empresa: 'Empresa 2',
        ruc_cedula: '1234567890',
        ciudad: 'Quito',
        notas: 'Cliente preferencial'
      })

      expect(result.ruc_cedula).toBe('1234567890')
      expect(result.ciudad).toBe('Quito')
      expect(result.notas).toBe('Cliente preferencial')
    })


    it('debe manejar errores de base de datos correctamente', async () => {
      ;(supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(crearLead({
        nombre: 'Test',
        email: 'test@example.com',
        telefono: '0999999999',
        empresa: 'Test'
      })).rejects.toThrow('Error creando lead: Database error')
    })
  })

  describe('crearCotizacion', () => {
    it('debe crear una cotización mediante la RPC segura', async () => {
      const mockResponse = {
        cotizacion: {
          id: 1,
          lead_id: 1,
          numero: 'COT-00010',
          estado: 'pendiente',
          total: 150,
          canal: 'web'
        },
        items: [
          { id: 1, cotizacion_id: 1, producto_id: 1, cantidad: 2, precio_unitario_aplicado: 50, subtotal: 100 },
          { id: 2, cotizacion_id: 1, producto_id: 2, cantidad: 1, precio_unitario_aplicado: 50, subtotal: 50 }
        ]
      }

      ;(supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        error: null
      })

      const result = await crearCotizacion({
        leadId: 1,
        items: [
          { productoId: 1, cantidad: 2, precioUnitario: 50, subtotal: 100 },
          { productoId: 2, cantidad: 1, precioUnitario: 50, subtotal: 50 }
        ],
        canal: 'web',
        notas: 'Cliente preferencial'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('create_public_quote', expect.objectContaining({
        p_lead_id: 1,
        p_canal: 'web',
        p_notas: 'Cliente preferencial'
      }))
      expect(result.cotizacion.id).toBe(1)
      expect(result.items).toHaveLength(2)
    })

    it('debe lanzar error cuando la RPC falla', async () => {
      ;(supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'DB error' }
      })

      await expect(crearCotizacion({
        leadId: 9,
        items: [{ productoId: 1, cantidad: 1, precioUnitario: 100, subtotal: 100 }],
        canal: 'web'
      })).rejects.toThrow('Error creando cotización: DB error')
    })
  })

  describe('obtenerCotizacionCompleta', () => {
    it('debe obtener una cotización con todos sus datos relacionados', async () => {
      const mockData = {
        id: 1,
        numero: 'COT-00001',
        estado: 'pendiente',
        total: 150.00,
        leads: {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        },
        items_cotizacion: [
          {
            id: 1,
            cantidad: 2,
            precio_unitario_aplicado: 50.00,
            subtotal: 100.00,
            producto: {
              id: 1,
              nombre: 'Producto 1',
              precio_unitario: 50.00
            }
          }
        ]
      }

      const mockEventos = [
        {
          id: 1,
          tipo: 'cotizacion_creada',
          created_at: new Date().toISOString()
        }
      ]

      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
              }))
            }))
          }
        }
        if (table === 'eventos') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ data: mockEventos, error: null }))
              }))
            }))
          }
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await obtenerCotizacionCompleta(1)

      expect(result.cotizacion.id).toBe(1)
      expect(result.lead.nombre).toBe('Juan Pérez')
      expect(result.items).toHaveLength(1)
      expect(result.items[0].producto.nombre).toBe('Producto 1')
      expect(result.eventos).toHaveLength(1)
    })

    it('debe manejar cotizaciones sin eventos', async () => {
      const mockData = {
        id: 2,
        numero: 'COT-00002',
        leads: { id: 2, nombre: 'María' },
        items_cotizacion: []
      }

      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
              }))
            }))
          }
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await obtenerCotizacionCompleta(2)
      expect(result.eventos).toEqual([])
    })
  })
})
