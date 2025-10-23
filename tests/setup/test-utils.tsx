import React from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Wrapper personalizado para componentes que necesitan providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

/**
 * Utilidad de render personalizada que incluye providers
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

/**
 * Utilidad para crear mocks de productos
 */
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  nombre: 'Producto Test',
  descripcion: 'Descripción de prueba',
  categoria: 'papeleria_corporativa',
  sku: 'TEST-001',
  minimo_pedido: 100,
  activo: true,
  imagen_url: 'https://via.placeholder.com/300',
  created_at: new Date().toISOString(),
  ...overrides,
})

/**
 * Utilidad para crear mocks de precios escalonados
 */
export const createMockPricingTier = (overrides = {}) => ({
  id: 1,
  producto_id: 1,
  cantidad_min: 100,
  precio_unitario: 0.25,
  created_at: new Date().toISOString(),
  ...overrides,
})

/**
 * Utilidad para crear mocks de cotizaciones
 */
export const createMockQuote = (overrides = {}) => ({
  id: 1,
  lead_id: 1,
  numero: 'COT-00001',
  estado: 'pendiente',
  total: 100.0,
  validez_dias: 30,
  canal: 'web',
  created_at: new Date().toISOString(),
  ...overrides,
})

/**
 * Utilidad para crear mocks de leads
 */
export const createMockLead = (overrides = {}) => ({
  id: 1,
  nombre: 'Cliente Test',
  email: 'test@example.com',
  telefono: '+593 99 123 4567',
  empresa: 'Empresa Test',
  created_at: new Date().toISOString(),
  ...overrides,
})

/**
 * Utilidad para simular delay en tests async
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
