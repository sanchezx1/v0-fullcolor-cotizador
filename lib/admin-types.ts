/**
 * Tipos TypeScript para el Panel Admin
 * Basados en el schema real de Supabase (database.types.ts)
 * NOTA: Usamos `| null` en lugar de `?` para coincidir con los tipos generados de Supabase
 */

// ============= PRODUCTOS =============
// Tipo base que coincide con la tabla productos de Supabase (Row)
export interface Producto {
  id: number
  nombre: string
  sku: string
  descripcion: string | null
  categoria: string
  imagen_url: string | null
  activo: boolean
  created_at: string | null
  updated_at: string | null
  unidad: string
  minimo_pedido: number
  // Campos virtuales extraídos de descripcion (no están en BD)
  agotado?: boolean
  mas_vendido?: boolean
}

// Tipo para crear productos (coincide con Insert de Supabase)
export interface ProductoInput {
  nombre: string
  sku: string
  categoria: string
  descripcion?: string | null
  imagen_url?: string | null
  activo?: boolean
  unidad?: string
  minimo_pedido?: number
  // Campos virtuales
  agotado?: boolean
  mas_vendido?: boolean
}

export interface PrecioEscalonado {
  id: number
  producto_id: number
  cantidad_min: number
  precio_unitario: number
  created_at: string | null
}

export interface ProductoConPrecios extends Producto {
  precios_escalonados: PrecioEscalonado[]
  precio_base?: number
  veces_cotizado?: number
}

// ============= LEADS =============
export interface Lead {
  id: number
  nombre: string
  email: string
  telefono: string | null
  empresa: string | null
  ruc_cedula: string | null
  ciudad: string | null
  notas: string | null
  estado: string | null
  origen: string | null
  presupuesto_estimado: number | null
  prioridad: string | null
  proximo_seguimiento: string | null
  score: number | null
  temperatura: string | null
  ultimo_contacto: string | null
  user_id: string | null
  updated_by: string | null
  created_at: string | null
  updated_at: string | null
}

export interface LeadConEstadisticas extends Lead {
  total_cotizaciones: number
  total_ventas: number
  tasa_conversion: number
  primera_cotizacion?: string
  ultima_cotizacion?: string
}

// ============= COTIZACIONES =============
// Estados posibles de cotización (referencia, no enforced por BD)
export type EstadoCotizacion = 'borrador' | 'pendiente' | 'enviada' | 'en_revision' | 'aprobada' | 'rechazada' | 'vencida'

export interface Cotizacion {
  id: number
  numero: string
  lead_id: number
  user_id: string | null
  estado: string  // La BD no usa enum, almacena como string
  canal: string
  subtotal: number | null
  iva: number | null
  total: number
  pdf_url: string | null
  notas: string | null
  access_token: string
  validez_dias: number
  created_at: string | null
  updated_at: string | null
}

export interface ItemCotizacion {
  id: number
  cotizacion_id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  iva: number
  created_at: string
}

export interface CotizacionConRelaciones extends Cotizacion {
  lead: Lead | null
  items_cotizacion?: ItemCotizacion[]
  eventos?: Evento[]
}

export interface CotizacionCompleta extends Cotizacion {
  lead: Lead
  items: (ItemCotizacion & { producto: Producto })[]
}

// ============= EVENTOS =============
export type TipoEvento = 
  | 'cotizacion_creada'
  | 'cotizacion_editada'
  | 'estado_cambiado'
  | 'pdf_generado'
  | 'email_enviado'
  | 'producto_creado'
  | 'producto_editado'
  | 'producto_eliminado'

// Tipo Json de Supabase para compatibilidad
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tipo que coincide con la tabla eventos de Supabase
export interface Evento {
  id: number
  tipo: string  // La BD no usa enum, almacena como string
  cotizacion_id: number
  descripcion: string | null
  metadata: Json
  created_at: string | null
}

// ============= VISTAS Y ESTADÍSTICAS =============
// Tipo que coincide con la vista estadisticas_dashboard de Supabase
export interface EstadisticasDashboard {
  cotizaciones_aprobadas: number | null
  cotizaciones_borrador: number | null
  cotizaciones_enviadas: number | null
  cotizaciones_mes: number | null
  cotizaciones_pendiente: number | null
  cotizaciones_rechazadas: number | null
  ingresos_estimados: number | null
  productos_activos: number | null
  total_cotizaciones: number | null
  total_leads: number | null
  // Campos calculados en el servicio
  cotizaciones_por_estado: {
    borrador: number
    enviada: number
    aprobada: number
    rechazada: number
    pendiente: number
  }
}

// Tipo que coincide con la vista productos_top_cotizados
export interface ProductoTopCotizado {
  id: number | null
  nombre: string | null
  categoria: string | null
  imagen_url: string | null
  sku: string | null
  veces_cotizado: number | null
  unidades_totales: number | null
  ingresos_generados: number | null
}

export interface CotizacionPorDia {
  fecha: string
  cantidad: number
}

// ============= FORMULARIOS =============
export interface ProductoFormData {
  nombre: string
  sku: string
  descripcion?: string
  categoria: string
  color?: string
  lados?: string
  impresion?: string
  agotado?: boolean
  mas_vendido?: boolean
  activo: boolean
  imagen?: File
}

export interface PrecioEscalonadoFormData {
  cantidad_min: number
  precio_unitario: number
}

export interface LeadFormData {
  nombre: string
  empresa?: string
  ruc_cedula?: string
  email: string
  telefono: string
  ciudad?: string
  direccion?: string
}

export interface CotizacionFormData {
  lead_id: number
  items: {
    producto_id: number
    cantidad: number
    precio_unitario: number
  }[]
}

// ============= FILTROS Y BÚSQUEDA =============
export interface FiltrosProductos {
  search?: string
  categoria?: string
  activo?: boolean | 'all'
  page?: number
  perPage?: number
}

export interface FiltrosCotizaciones {
  search?: string
  estado?: EstadoCotizacion | 'all'
  fechaInicio?: string
  fechaFin?: string
  leadId?: number
  montoMin?: number
  montoMax?: number
  page?: number
  perPage?: number
}

export interface FiltrosLeads {
  search?: string
  ciudad?: string
  tieneEmpresa?: boolean | 'all'
  tieneCotizaciones?: boolean | 'all'
  page?: number
  perPage?: number
}

export interface FiltrosEventos {
  tipo?: TipoEvento | 'all'
  cotizacionId?: number
  fechaInicio?: string
  fechaFin?: string
  page?: number
  perPage?: number
}

// ============= RESPUESTAS DE API =============
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// ============= CONFIGURACIÓN =============
export interface ConfiguracionEmpresa {
  nombre_comercial: string
  email_contacto: string
  telefono: string
  whatsapp: string
  direccion: string
  logo_url?: string
}

export interface ConfiguracionCotizaciones {
  tasa_iva: number
  dias_validez: number
  prefijo_numeracion: string
  anio_reinicio: number
}

export interface ConfiguracionEmails {
  from_name: string
  asunto_template: string
  mensaje_validez: string
  footer_html: string
}

// ============= CATEGORÍAS =============
export const CATEGORIAS_PRODUCTO = [
  'Impresión Digital',
  'Impresión Offset',
  'Material Publicitario',
  'Señalética',
  'Packaging',
  'Otros'
] as const

export type CategoriaProducto = typeof CATEGORIAS_PRODUCTO[number]

// ============= BADGES DE ESTADO =============
export const ESTADO_COLORS: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-800 border-gray-300',
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  enviada: 'bg-blue-100 text-blue-800 border-blue-300',
  en_revision: 'bg-amber-100 text-amber-800 border-amber-300',
  aprobada: 'bg-green-100 text-green-800 border-green-300',
  rechazada: 'bg-red-100 text-red-800 border-red-300',
  vencida: 'bg-slate-100 text-slate-800 border-slate-300',
}

export const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador',
  pendiente: 'Pendiente',
  enviada: 'Enviada',
  en_revision: 'En revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida'
}
