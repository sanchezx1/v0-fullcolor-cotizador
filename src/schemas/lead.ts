import { z } from "zod"

/**
 * Schema de validación para creación de Leads
 * Usado en: servicios de quotes, Edge Functions, API routes
 *
 * Nota: Los campos opcionales aceptan tanto null como undefined
 * ya que Supabase retorna null para campos vacíos
 */
export const LeadSchema = z.object({
  nombre: z
    .string({ required_error: "Nombre es requerido" })
    .min(1, "Nombre no puede estar vacío")
    .max(255, "Nombre demasiado largo"),

  email: z
    .string({ required_error: "Email es requerido" })
    .email("Email inválido")
    .max(255, "Email demasiado largo"),

  telefono: z
    .string({ required_error: "Teléfono es requerido" })
    .min(1, "Teléfono no puede estar vacío")
    .max(20, "Teléfono demasiado largo"),

  empresa: z
    .string()
    .max(255, "Nombre de empresa demasiado largo")
    .nullable()
    .optional()
    .transform(val => val ?? undefined),

  ruc_cedula: z
    .string()
    .max(13, "RUC/Cédula inválido")
    .nullable()
    .optional()
    .transform(val => val ?? undefined),

  ciudad: z
    .string()
    .max(100, "Nombre de ciudad demasiado largo")
    .nullable()
    .optional()
    .transform(val => val ?? undefined),

  notas: z
    .string()
    .max(1000, "Notas demasiado largas")
    .nullable()
    .optional()
    .transform(val => val ?? undefined),
})

export type LeadInput = z.infer<typeof LeadSchema>

/**
 * Schema para updates parciales de Leads
 * Todos los campos son opcionales excepto validaciones cuando están presentes
 */
export const LeadUpdateSchema = LeadSchema.partial()

export type LeadUpdateInput = z.infer<typeof LeadUpdateSchema>

/**
 * Schema mínimo para creación rápida de lead (solo email requerido)
 * Usado cuando se crea lead desde cotización pública
 */
export const LeadMinimalSchema = z.object({
  nombre: z.string().min(1).max(255),
  email: z.string().email().max(255),
  telefono: z.string().min(1, "Teléfono es requerido").max(20),
  empresa: z.string().max(255).nullable().optional().transform(val => val ?? ""),
})

export type LeadMinimalInput = z.infer<typeof LeadMinimalSchema>
