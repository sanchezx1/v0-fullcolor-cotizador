import { z } from "zod"

/**
 * Schema para items individuales de cotización
 */
export const QuoteItemSchema = z.object({
  producto_id: z
    .number({ required_error: "ID de producto es requerido" })
    .int("ID de producto debe ser entero")
    .positive("ID de producto debe ser mayor a 0"),

  cantidad: z
    .number({ required_error: "Cantidad es requerida" })
    .int("Cantidad debe ser un número entero")
    .positive("Cantidad debe ser mayor a 0")
    .max(999999, "Cantidad demasiado grande"),

  precio_unitario: z
    .number({ required_error: "Precio unitario es requerido" })
    .positive("Precio debe ser mayor a 0")
    .finite("Precio debe ser un número válido"),

  subtotal: z
    .number({ required_error: "Subtotal es requerido" })
    .nonnegative("Subtotal no puede ser negativo")
    .finite("Subtotal debe ser un número válido"),
})

export type QuoteItemInput = z.infer<typeof QuoteItemSchema>

/**
 * Schema para creación de cotización completa
 * Incluye validación de items y datos opcionales
 */
export const CreateQuoteSchema = z.object({
  leadId: z
    .number()
    .int()
    .positive()
    .optional(),

  items: z
    .array(QuoteItemSchema, { required_error: "Items son requeridos" })
    .min(1, "Al menos un producto es requerido")
    .max(100, "Máximo 100 productos por cotización"),

  canal: z
    .enum(["web", "whatsapp", "email"], {
      required_error: "Canal es requerido",
      invalid_type_error: "Canal debe ser web, whatsapp o email",
    })
    .default("web"),

  notas: z
    .string()
    .max(1000, "Notas demasiado largas")
    .optional(),
})

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>

/**
 * Schema para actualización de estado de cotización
 */
export const UpdateQuoteStatusSchema = z.object({
  quoteId: z
    .number()
    .int()
    .positive(),

  nuevoEstado: z.enum(["borrador", "enviada", "aceptada", "rechazada"], {
    required_error: "Estado es requerido",
    invalid_type_error: "Estado inválido",
  }),

  notas: z
    .string()
    .max(1000)
    .optional(),

  pdfUrl: z
    .string()
    .url("URL de PDF inválida")
    .optional(),
})

export type UpdateQuoteStatusInput = z.infer<typeof UpdateQuoteStatusSchema>

/**
 * Schema para validación de datos de cotización en Edge Functions
 * Incluye validación más permisiva para datos públicos
 */
export const PublicQuoteSchema = z.object({
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
        precioUnitario: z.number().positive(),
        subtotal: z.number().nonnegative(),
      })
    )
    .min(1, "Al menos un producto es requerido"),

  canal: z.enum(["web", "whatsapp", "email"]).default("web"),

  notas: z.string().max(1000).optional(),
})

export type PublicQuoteInput = z.infer<typeof PublicQuoteSchema>
