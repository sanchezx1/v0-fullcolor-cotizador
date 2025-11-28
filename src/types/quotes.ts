/**
 * Types for Quote/Cotizacion-related operations
 */

import type { Database } from './database.types'

// Database table types
export type Cotizacion = Database['public']['Tables']['cotizaciones']['Row']
export type CotizacionInsert = Database['public']['Tables']['cotizaciones']['Insert']
export type CotizacionUpdate = Database['public']['Tables']['cotizaciones']['Update']

export type ItemCotizacion = Database['public']['Tables']['items_cotizacion']['Row']
export type ItemCotizacionInsert = Database['public']['Tables']['items_cotizacion']['Insert']

export type Producto = Database['public']['Tables']['productos']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']

// Compound types for queries with relations
export interface CotizacionWithRelations extends Cotizacion {
  leads: Lead
  items_cotizacion: ItemCotizacionWithProducto[]
}

export interface ItemCotizacionWithProducto extends ItemCotizacion {
  productos: Producto
}

// Service method parameter types
export interface CreateQuoteParams {
  leadData: Partial<Lead>
  items: Array<{
    producto_id: number
    cantidad: number
    precio_unitario: number
  }>
  userId?: string
  metadata?: Record<string, unknown>
}

export interface UpdateQuoteStatusParams {
  quoteId: number
  nuevoEstado: string
  notas?: string
}

// Hook types
export interface MergeLeadDataParams {
  existingLead: Lead
  newData: Partial<Lead>
}

// Error types
export interface ProductoAgotadoError extends Error {
  code: 'PRODUCTO_AGOTADO'
  producto?: string
}

// Generic metadata type
export type QuoteMetadata = Record<string, unknown>
