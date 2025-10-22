/**
 * Tipos TypeScript para el Panel Admin
 * Basados en el schema real de Supabase
 */

// ============= PRODUCTOS =============
export interface Producto {
  id: number
  nombre: string
  sku: string
  descripcion?: string
  categoria: string
  imagen_url?: string
  color?: string
  lados?: string
  impresion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PrecioEscalonado {
  id: number
  producto_id: number
  cantidad_min: number
  precio_unitario: number
  created_at: string
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
  empresa?: string
  ruc_cedula?: string
  email: string
  telefono: string
  ciudad?: string
  direccion?: string
  created_at: string
}

export interface LeadConEstadisticas extends Lead {
  total_cotizaciones: number
  total_ventas: number
  tasa_conversion: number
  primera_cotizacion?: string
  ultima_cotizacion?: string
}

// ============= COTIZACIONES =============
export type EstadoCotizacion = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'pendiente'

export interface Cotizacion {
  id: number
  numero: string
  lead_id: number
  estado: EstadoCotizacion
  subtotal: number
  iva: number
  total: number
  pdf_url?: string
  created_at: string
  updated_at: string
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
  leads: Lead
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

export interface Evento {
  id: number
  tipo: TipoEvento
  cotizacion_id?: number
  descripcion?: string
  metadata?: Record<string, any>
  created_at: string
}

// ============= VISTAS Y ESTADÍSTICAS =============
export interface EstadisticasDashboard {
  total_cotizaciones: number
  cotizaciones_mes_actual: number
  cotizaciones_mes_anterior: number
  porcentaje_cambio: number
  ingresos_estimados: number
  productos_activos: number
  total_leads: number
  cotizaciones_por_estado: {
    borrador: number
    enviada: number
    aprobada: number
    rechazada: number
    pendiente: number
  }
}

export interface ProductoTopCotizado {
  producto_id: number
  nombre: string
  categoria: string
  imagen_url?: string
  veces_cotizado: number
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
export const ESTADO_COLORS: Record<EstadoCotizacion, string> = {
  borrador: 'bg-gray-100 text-gray-800 border-gray-300',
  enviada: 'bg-blue-100 text-blue-800 border-blue-300',
  aprobada: 'bg-green-100 text-green-800 border-green-300',
  rechazada: 'bg-red-100 text-red-800 border-red-300',
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

export const ESTADO_LABELS: Record<EstadoCotizacion, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  pendiente: 'Pendiente'
}
