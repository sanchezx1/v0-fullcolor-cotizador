import { z } from "zod"

/**
 * Schema para creación/actualización de productos
 * Usado en: panel de administración, imports de datos
 */
export const ProductSchema = z.object({
  nombre: z
    .string({ required_error: "Nombre es requerido" })
    .min(1, "Nombre no puede estar vacío")
    .max(255, "Nombre demasiado largo"),

  descripcion: z
    .string()
    .max(2000, "Descripción demasiado larga")
    .optional()
    .nullable(),

  categoria: z
    .string({ required_error: "Categoría es requerida" })
    .min(1, "Categoría no puede estar vacía")
    .max(100, "Categoría demasiado larga"),

  precio_base: z
    .number({ required_error: "Precio base es requerido" })
    .positive("Precio base debe ser mayor a 0")
    .finite("Precio base debe ser un número válido"),

  imagen_url: z
    .string()
    .url("URL de imagen inválida")
    .optional()
    .nullable(),

  activo: z
    .boolean()
    .default(true),

  stock: z
    .number()
    .int("Stock debe ser un número entero")
    .nonnegative("Stock no puede ser negativo")
    .optional()
    .nullable(),

  caracteristicas: z
    .record(z.unknown())
    .optional()
    .nullable(),
})

export type ProductInput = z.infer<typeof ProductSchema>

/**
 * Schema para updates parciales de productos
 */
export const ProductUpdateSchema = ProductSchema.partial()

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>

/**
 * Schema para validación de precios escalonados
 */
export const PrecioEscalonadoSchema = z.object({
  producto_id: z
    .number()
    .int()
    .positive(),

  cantidad_minima: z
    .number()
    .int()
    .positive("Cantidad mínima debe ser mayor a 0"),

  cantidad_maxima: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  precio_unitario: z
    .number()
    .positive("Precio debe ser mayor a 0")
    .finite(),

  activo: z
    .boolean()
    .default(true),
})
  .refine(
    (data) => {
      if (data.cantidad_maxima === null || data.cantidad_maxima === undefined) {
        return true
      }
      return data.cantidad_maxima > data.cantidad_minima
    },
    {
      message: "Cantidad máxima debe ser mayor a cantidad mínima",
      path: ["cantidad_maxima"],
    }
  )

export type PrecioEscalonadoInput = z.infer<typeof PrecioEscalonadoSchema>
