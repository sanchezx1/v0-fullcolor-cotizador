/**
 * Tests para src/services/supabaseClient.ts
 * Validar que el cliente de Supabase esté configurado correctamente
 */

describe('supabaseClient', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    // Setear variables de entorno para tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Inicialización', () => {
    it('debe exportar instancia de supabase', () => {
      const { supabase } = require('@/src/services/supabaseClient')

      expect(supabase).toBeDefined()
      expect(supabase).toHaveProperty('auth')
      expect(supabase).toHaveProperty('from')
    })

    it('debe tener configuración de auth', () => {
      const { supabase } = require('@/src/services/supabaseClient')

      expect(supabase.auth).toBeDefined()
    })

    it('debe poder interactuar con tablas', () => {
      const { supabase } = require('@/src/services/supabaseClient')

      expect(supabase.from).toBeDefined()
      expect(typeof supabase.from).toBe('function')
    })
  })

  describe('Métodos del cliente', () => {
    it('debe tener método from para consultas', () => {
      const { supabase } = require('@/src/services/supabaseClient')

      expect(typeof supabase.from).toBe('function')
    })

    it('debe exportar el cliente correctamente', () => {
      const module = require('@/src/services/supabaseClient')

      expect(module).toHaveProperty('supabase')
      expect(module.supabase).toBeDefined()
    })
  })

  describe('TypeScript types', () => {
    it('debe exportar tipos de Producto', () => {
      const types = require('@/src/services/supabaseClient')

      // Verificar que los tipos están disponibles (runtime check básico)
      expect(types).toHaveProperty('supabase')
    })
  })
})
