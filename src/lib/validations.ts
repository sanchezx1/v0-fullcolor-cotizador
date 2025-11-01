import { z } from 'zod'

/**
 * Esquemas de validación Zod para formularios del admin
 */

// ============================================================================
// PRODUCTO
// ============================================================================

export const productoSchema = z.object({
  sku: z.string()
    .min(1, 'El SKU es requerido')
    .max(100, 'El SKU no puede tener más de 100 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
  
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede tener más de 255 caracteres'),
  
  descripcion: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  
  categoria: z.enum([
    'Impresión Digital',
    'Impresión Offset',
    'Material Publicitario',
    'Señalética',
    'Packaging',
    'Otros'
  ], {
    errorMap: () => ({ message: 'Selecciona una categoría válida' })
  }),
  
  unidad: z.string()
    .default('unidad')
    .optional(),
  
  minimo_pedido: z.number()
    .int('Debe ser un número entero')
    .min(1, 'El mínimo pedido debe ser al menos 1')
    .default(1)
    .optional(),
  
  activo: z.boolean()
    .default(true)
    .optional(),

  agotado: z.boolean()
    .default(false)
    .optional(),

  mas_vendido: z.boolean()
    .default(false)
    .optional(),
  
  imagen_url: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal(''))
})

export type ProductoFormData = z.infer<typeof productoSchema>

// ============================================================================
// PRECIO ESCALONADO
// ============================================================================

export const precioEscalonadoSchema = z.object({
  cantidad_min: z.number()
    .int('Debe ser un número entero')
    .min(1, 'La cantidad mínima debe ser al menos 1'),
  
  precio_unitario: z.number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales')
})

export type PrecioEscalonadoFormData = z.infer<typeof precioEscalonadoSchema>

// ============================================================================
// LEAD
// ============================================================================

export const leadSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede tener más de 255 caracteres'),
  
  email: z.string()
    .email('Debe ser un email válido')
    .max(255, 'El email no puede tener más de 255 caracteres'),
  
  telefono: z.string()
    .regex(/^\+593\s?\d{2}\s?\d{3}\s?\d{4}$/, 'Formato válido: +593 99 123 4567')
    .optional()
    .or(z.literal('')),
  
  empresa: z.string()
    .max(255, 'El nombre de empresa no puede tener más de 255 caracteres')
    .optional()
    .or(z.literal('')),
  
  ruc_cedula: z.string()
    .regex(/^\d{10}$|^\d{13}$/, 'Debe tener 10 dígitos (cédula) o 13 dígitos (RUC)')
    .optional()
    .or(z.literal('')),
  
  ciudad: z.string()
    .max(100, 'La ciudad no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  direccion: z.string()
    .max(500, 'La dirección no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  notas: z.string()
    .optional()
    .or(z.literal(''))
})

export type LeadFormData = z.infer<typeof leadSchema>

// ============================================================================
// COTIZACIÓN
// ============================================================================

export const itemCotizacionSchema = z.object({
  producto_id: z.number()
    .int('Debe ser un ID válido')
    .min(1, 'Selecciona un producto'),
  
  cantidad: z.number()
    .int('Debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1'),
  
  precio_unitario_aplicado: z.number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales')
})

export const cotizacionSchema = z.object({
  lead_id: z.number()
    .int('Debe ser un ID válido')
    .min(1, 'Selecciona un cliente'),
  
  items: z.array(itemCotizacionSchema)
    .min(1, 'Debe haber al menos un producto en la cotización'),
  
  validez_dias: z.number()
    .int('Debe ser un número entero')
    .min(1, 'La validez debe ser al menos 1 día')
    .max(365, 'La validez no puede ser mayor a 1 año')
    .default(30)
    .optional(),
  
  notas: z.string()
    .optional()
    .or(z.literal('')),
  
  estado: z.enum(['borrador', 'pendiente', 'enviada', 'aprobada', 'rechazada'])
    .default('borrador')
    .optional()
})

export type CotizacionFormData = z.infer<typeof cotizacionSchema>

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export const configuracionEmpresaSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255),
  
  email: z.string()
    .email('Debe ser un email válido'),
  
  telefono: z.string()
    .regex(/^\+593\s?\d{2}\s?\d{3}\s?\d{4}$/),
  
  whatsapp: z.string()
    .regex(/^\+593\s?\d{2}\s?\d{3}\s?\d{4}$/),
  
  direccion: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres'),
  
  logo_url: z.string()
    .url()
    .optional()
    .or(z.literal(''))
})

export const configuracionCotizacionesSchema = z.object({
  tasa_iva: z.number()
    .min(0, 'La tasa de IVA no puede ser negativa')
    .max(100, 'La tasa de IVA no puede ser mayor a 100%'),
  
  validez_dias_default: z.number()
    .int()
    .min(1)
    .max(365),
  
  prefijo_numeracion: z.string()
    .max(10),
  
  anio_reinicio: z.number()
    .int()
    .min(2020)
    .max(2100)
})

export const configuracionEmailsSchema = z.object({
  from_name: z.string()
    .min(3)
    .max(100),
  
  plantilla_asunto: z.string()
    .min(10)
    .max(200),
  
  mensaje_validez: z.string()
    .max(500),
  
  footer_personalizado: z.string()
    .max(1000)
})

// ============================================================================
// UPLOAD
// ============================================================================

export const uploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'El archivo no puede pesar más de 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Solo se permiten imágenes JPG, PNG o WebP'
    )
})

// ============================================================================
// HELPERS DE VALIDACIÓN
// ============================================================================

/**
 * Valida y formatea un número de teléfono ecuatoriano
 */
export function validarTelefonoEcuador(telefono: string): boolean {
  const regex = /^\+593\s?\d{2}\s?\d{3}\s?\d{4}$/
  return regex.test(telefono)
}

/**
 * Valida RUC o Cédula ecuatoriana
 */
export function validarRucCedula(valor: string): boolean {
  // Debe tener 10 (cédula) o 13 dígitos (RUC)
  return /^\d{10}$|^\d{13}$/.test(valor)
}

/**
 * Valida SKU único (debe verificarse en BD)
 */
export function validarFormatoSKU(sku: string): boolean {
  return /^[A-Z0-9-_]+$/.test(sku)
}

/**
 * Calcula totales de cotización
 */
export function calcularTotalesCotizacion(items: { cantidad: number; precio_unitario_aplicado: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario_aplicado), 0)
  const iva = subtotal * 0.15
  const total = subtotal + iva
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}
