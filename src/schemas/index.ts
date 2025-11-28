/**
 * Schemas de validación con Zod
 *
 * Centraliza todos los schemas de validación para:
 * - Servicios
 * - API routes
 * - Server actions
 * - Edge functions
 */

// Lead schemas
export {
  LeadSchema,
  LeadUpdateSchema,
  LeadMinimalSchema,
  type LeadInput,
  type LeadUpdateInput,
  type LeadMinimalInput,
} from "./lead"

// Quote schemas
export {
  QuoteItemSchema,
  CreateQuoteSchema,
  UpdateQuoteStatusSchema,
  PublicQuoteSchema,
  type QuoteItemInput,
  type CreateQuoteInput,
  type UpdateQuoteStatusInput,
  type PublicQuoteInput,
} from "./quote"

// Product schemas
export {
  ProductSchema,
  ProductUpdateSchema,
  PrecioEscalonadoSchema,
  type ProductInput,
  type ProductUpdateInput,
  type PrecioEscalonadoInput,
} from "./product"
