/**
 * @jest-environment node
 */

import {
  sendQuoteEmail,
  wasEmailSent,
  getEmailHistory,
  getLeadEmail
} from '@/src/services/emailService'
import { supabase } from '@/src/services/supabaseClient'

// Mock de Supabase
jest.mock('@/src/services/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    },
    from: jest.fn()
  }
}))

describe('emailService.ts - Servicio de envío de emails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendQuoteEmail', () => {
    it('debe enviar email exitosamente', async () => {
      const mockResponse = {
        success: true,
        recipient: 'cliente@example.com',
        cotizacionNumero: 'COT-00001'
      }

      ;(supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null
      })

      const result = await sendQuoteEmail(1)

      expect(result.success).toBe(true)
      expect(result.recipient).toBe('cliente@example.com')
      expect(result.cotizacionNumero).toBe('COT-00001')
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          body: {
            quoteId: 1,
            recipientEmail: undefined,
            quoteToken: undefined,
            emailType: 'quote_created',
            newStatus: undefined
          }
        })
      )
    })

    it('debe enviar email a destinatario específico', async () => {
      const mockResponse = {
        success: true,
        recipient: 'otro@example.com',
        cotizacionNumero: 'COT-00002'
      }

      ;(supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null
      })

      const result = await sendQuoteEmail(2, 'otro@example.com')

      expect(result.success).toBe(true)
      expect(result.recipient).toBe('otro@example.com')
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          body: {
            quoteId: 2,
            recipientEmail: 'otro@example.com',
            quoteToken: undefined,
            emailType: 'quote_created',
            newStatus: undefined
          }
        })
      )
    })

    it('debe manejar error al invocar función', async () => {
      ;(supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Function error' }
      })

      const result = await sendQuoteEmail(1)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Function error')
    })

    it('debe manejar respuesta sin éxito', async () => {
      ;(supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { success: false, error: 'SendGrid error' },
        error: null
      })

      const result = await sendQuoteEmail(1)

      expect(result.success).toBe(false)
      expect(result.error).toContain('SendGrid error')
    })

    it('debe manejar excepciones', async () => {
      ;(supabase.functions.invoke as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const result = await sendQuoteEmail(1)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('debe incluir datos de cotización en respuesta exitosa', async () => {
      const mockResponse = {
        success: true,
        recipient: 'test@example.com',
        cotizacionNumero: 'COT-12345'
      }

      ;(supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null
      })

      const result = await sendQuoteEmail(123)

      expect(result.success).toBe(true)
      expect(result.cotizacionNumero).toBe('COT-12345')
      expect(result.recipient).toBe('test@example.com')
    })
  })

  describe('wasEmailSent', () => {
    it('debe retornar true si el email fue enviado', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [{ id: 1 }],
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await wasEmailSent(1)

      expect(result).toBe(true)
      expect(fromMock).toHaveBeenCalledWith('eventos')
    })

    it('debe retornar false si el email no fue enviado', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await wasEmailSent(1)

      expect(result).toBe(false)
    })

    it('debe retornar false en caso de error', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Database error' }
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await wasEmailSent(1)

      expect(result).toBe(false)
    })

    it('debe verificar tipo de evento correcto', async () => {
      const eqSpy = jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: eqSpy
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      await wasEmailSent(5)

      expect(eqSpy).toHaveBeenCalledWith('cotizacion_id', 5)
    })
  })

  describe('getEmailHistory', () => {
    it('debe obtener historial de emails enviados', async () => {
      const mockHistory = [
        {
          id: 1,
          cotizacion_id: 1,
          tipo: 'email_enviado',
          created_at: '2025-11-03T10:00:00Z',
          metadata: { recipient: 'test@example.com' }
        },
        {
          id: 2,
          cotizacion_id: 1,
          tipo: 'email_enviado',
          created_at: '2025-11-02T10:00:00Z',
          metadata: { recipient: 'test@example.com' }
        }
      ]

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: mockHistory,
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getEmailHistory(1)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(fromMock).toHaveBeenCalledWith('eventos')
    })

    it('debe retornar array vacío si no hay historial', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getEmailHistory(1)

      expect(result).toEqual([])
    })

    it('debe retornar array vacío en caso de error', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Database error' }
              }))
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getEmailHistory(1)

      expect(result).toEqual([])
    })

    it('debe ordenar por fecha descendente', async () => {
      const orderSpy = jest.fn(() => Promise.resolve({
        data: [],
        error: null
      }))

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: orderSpy
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      await getEmailHistory(1)

      expect(orderSpy).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('getLeadEmail', () => {
    it('debe obtener email del lead asociado', async () => {
      const mockData = {
        id: 1,
        leads: {
          email: 'lead@example.com'
        }
      }

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockData,
              error: null
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getLeadEmail(1)

      expect(result).toBe('lead@example.com')
      expect(fromMock).toHaveBeenCalledWith('cotizaciones')
    })

    it('debe retornar null si la cotización no existe', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getLeadEmail(999)

      expect(result).toBeNull()
    })

    it('debe retornar null si el lead no tiene email', async () => {
      const mockData = {
        id: 1,
        leads: null
      }

      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockData,
              error: null
            }))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getLeadEmail(1)

      expect(result).toBeNull()
    })

    it('debe manejar errores correctamente', async () => {
      const fromMock = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.reject(new Error('Database error')))
          }))
        }))
      }))

      ;(supabase.from as jest.Mock) = fromMock

      const result = await getLeadEmail(1)

      expect(result).toBeNull()
    })

    it('debe realizar query con relaciones correctas', async () => {
      const selectSpy = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: null
          }))
        }))
      }))

      const fromMock = jest.fn(() => ({
        select: selectSpy
      }))

      ;(supabase.from as jest.Mock) = fromMock

      await getLeadEmail(1)

      expect(selectSpy).toHaveBeenCalledWith(expect.stringContaining('leads'))
    })
  })
})
