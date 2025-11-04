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
    }))
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

      // Mock: email no existe
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [mockLead], error: null }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await crearLead({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '0999999999',
        empresa: 'Empresa Test'
      })

      expect(result).toEqual(mockLead)
      expect(fromMock).toHaveBeenCalledWith('leads')
    })

    it('debe lanzar error LEAD_EMAIL_EXISTS cuando el email ya existe', async () => {
      const existingLead = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '0999999999',
        empresa: 'Empresa Test'
      }

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [existingLead], error: null }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

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

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [mockLead], error: null }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

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
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ 
            data: null, 
            error: { message: 'Database error', code: '23505' } 
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      await expect(crearLead({
        nombre: 'Test',
        email: 'test@example.com',
        telefono: '0999999999',
        empresa: 'Test'
      })).rejects.toThrow('Error creando lead')
    })
  })

  describe('crearCotizacion', () => {
    it('debe crear una cotización con items correctamente', async () => {
      const mockCotizacion = {
        id: 1,
        lead_id: 1,
        numero: 'COT-00001',
        estado: 'pendiente',
        total: 150.00,
        validez_dias: 30,
        canal: 'web',
        created_at: new Date().toISOString()
      }

      const mockItems = [
        {
          id: 1,
          cotizacion_id: 1,
          producto_id: 1,
          cantidad: 2,
          precio_unitario_aplicado: 50.00,
          subtotal: 100.00
        },
        {
          id: 2,
          cotizacion_id: 1,
          producto_id: 2,
          cantidad: 1,
          precio_unitario_aplicado: 50.00,
          subtotal: 50.00
        }
      ]

      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              })),
              eq: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: mockCotizacion, error: null }))
              }))
            }))
          }
        }
        if (table === 'items_cotizacion') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({ data: mockItems, error: null }))
            }))
          }
        }
        // Para eventos
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await crearCotizacion({
        leadId: 1,
        items: [
          { productoId: 1, cantidad: 2, precioUnitario: 50.00, subtotal: 100.00 },
          { productoId: 2, cantidad: 1, precioUnitario: 50.00, subtotal: 50.00 }
        ],
        canal: 'web'
      })

      expect(result.cotizacion).toBeDefined()
      expect(result.cotizacion.total).toBe(150.00)
      expect(result.items).toHaveLength(2)
    })

    it('debe calcular el total correctamente', async () => {
      const mockCotizacion = {
        id: 2,
        lead_id: 2,
        numero: 'COT-00002',
        estado: 'pendiente',
        total: 350.75,
        validez_dias: 30,
        canal: 'whatsapp'
      }

      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              })),
              eq: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            })),
            insert: jest.fn((data: any) => {
              expect(data.total).toBe(350.75)
              return {
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: mockCotizacion, error: null }))
                }))
              }
            })
          }
        }
        if (table === 'items_cotizacion') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }
        }
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      await crearCotizacion({
        leadId: 2,
        items: [
          { productoId: 1, cantidad: 3, precioUnitario: 100.25, subtotal: 300.75 },
          { productoId: 2, cantidad: 1, precioUnitario: 50.00, subtotal: 50.00 }
        ],
        canal: 'whatsapp'
      })
    })

    it('debe generar números de cotización únicos con formato COT-XXXXX', async () => {
      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ 
                  data: [{ numero: 'COT-00001' }, { numero: 'COT-00002' }], 
                  error: null 
                }))
              })),
              eq: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            })),
            insert: jest.fn((data: any) => {
              expect(data.numero).toMatch(/^COT-\d{5}$/)
              return {
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ 
                    data: { ...data, id: 1 }, 
                    error: null 
                  }))
                }))
              }
            })
          }
        }
        if (table === 'items_cotizacion') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }
        }
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      await crearCotizacion({
        leadId: 1,
        items: [{ productoId: 1, cantidad: 1, precioUnitario: 100, subtotal: 100 }],
        canal: 'web'
      })
    })

    it('debe incluir notas cuando se proporcionan', async () => {
      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              })),
              eq: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            })),
            insert: jest.fn((data: any) => {
              expect(data.notas).toBe('Cliente preferencial - envío urgente')
              return {
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ 
                    data: { ...data, id: 1 }, 
                    error: null 
                  }))
                }))
              }
            })
          }
        }
        if (table === 'items_cotizacion') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }
        }
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      await crearCotizacion({
        leadId: 1,
        items: [{ productoId: 1, cantidad: 1, precioUnitario: 100, subtotal: 100 }],
        canal: 'email',
        notas: 'Cliente preferencial - envío urgente'
      })
    })
  })

  describe('registrarEvento', () => {
    it('debe registrar un evento de tipo cotizacion_creada', async () => {
      const mockEvento = {
        id: 1,
        cotizacion_id: 1,
        tipo: 'cotizacion_creada',
        metadata: { total_items: 3, canal: 'web' },
        created_at: new Date().toISOString()
      }

      const fromMock = jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockEvento, error: null }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await registrarEvento({
        cotizacionId: 1,
        tipo: 'cotizacion_creada',
        metadata: { total_items: 3, canal: 'web' }
      })

      expect(result.tipo).toBe('cotizacion_creada')
      expect(result.metadata).toEqual({ total_items: 3, canal: 'web' })
    })

    it('debe registrar un evento de tipo pdf_generado', async () => {
      const mockEvento = {
        id: 2,
        cotizacion_id: 1,
        tipo: 'pdf_generado',
        metadata: { file_size: 1024 },
        created_at: new Date().toISOString()
      }

      const fromMock = jest.fn(() => ({
        insert: jest.fn((data: any) => {
          expect(data.tipo).toBe('pdf_generado')
          return {
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockEvento, error: null }))
            }))
          }
        })
      }))

      ;(supabase.from as jest.Mock) = fromMock

      await registrarEvento({
        cotizacionId: 1,
        tipo: 'pdf_generado',
        metadata: { file_size: 1024 }
      })
    })

    it('debe manejar errores al registrar eventos', async () => {
      const fromMock = jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.reject(new Error('Database error')))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      await expect(registrarEvento({
        cotizacionId: 1,
        tipo: 'email_enviado'
      })).rejects.toThrow('Database error')
    })
  })

  describe('actualizarEstadoCotizacion', () => {
    it('debe actualizar el estado de una cotización', async () => {
      const mockCotizacion = {
        id: 1,
        numero: 'COT-00001',
        estado: 'enviada',
        total: 150.00
      }

      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            update: jest.fn((data: any) => {
              expect(data.estado).toBe('enviada')
              return {
                eq: jest.fn(() => ({
                  select: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: mockCotizacion, error: null }))
                  }))
                }))
              }
            })
          }
        }
        // Para eventos
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await actualizarEstadoCotizacion(1, 'enviada')
      expect(result.estado).toBe('enviada')
    })

    it('debe actualizar el estado y el PDF URL', async () => {
      const pdfUrl = 'https://storage.example.com/pdfs/COT-00001.pdf'
      const mockCotizacion = {
        id: 1,
        numero: 'COT-00001',
        estado: 'enviada',
        pdf_url: pdfUrl
      }

      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            update: jest.fn((data: any) => {
              expect(data.pdf_url).toBe(pdfUrl)
              return {
                eq: jest.fn(() => ({
                  select: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: mockCotizacion, error: null }))
                  }))
                }))
              }
            })
          }
        }
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
            }))
          }))
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      const result = await actualizarEstadoCotizacion(1, 'enviada', pdfUrl)
      expect(result.pdf_url).toBe(pdfUrl)
    })

    it('debe registrar un evento después de actualizar', async () => {
      const fromMock = jest.fn((table: string) => {
        if (table === 'cotizaciones') {
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ 
                    data: { id: 1, estado: 'aprobada' }, 
                    error: null 
                  }))
                }))
              }))
            }))
          }
        }
        // Verificar que se llama a eventos
        return {
          insert: jest.fn((data: any) => {
            expect(data.tipo).toBe('cotizacion_actualizada')
            expect(data.metadata.nuevo_estado).toBe('aprobada')
            return {
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
              }))
            }
          })
        }
      })

      ;(supabase.from as jest.Mock) = fromMock

      await actualizarEstadoCotizacion(1, 'aprobada')
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
