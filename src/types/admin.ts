/**
 * Tipos TypeScript para el Panel Admin
 * Mantener sincronizados con el schema de Supabase
 */

// ============================================================================
// PRODUCTOS
// ============================================================================

export interface Producto {
  id: number
  sku: string
  nombre: string
  descripcion?: string
  categoria: ProductoCategoria
  unidad: string
  minimo_pedido: number
  activo: boolean
  imagen_url?: string
  created_at: string
  updated_at: string
}

export type ProductoCategoria = 
  | 'Impresión Digital'
  | 'Impresión Offset'
  | 'Material Publicitario'
  | 'Señalética'
  | 'Packaging'
  | 'Otros'

export interface PrecioEscalonado {
  id: number
  producto_id: number
  cantidad_min: number
  precio_unitario: number
  created_at: string
}

export interface ProductoConPrecios extends Producto {
  precios_escalonados: PrecioEscalonado[]
  precio_base?: number // El precio más bajo
}

// ============================================================================
// LEADS
// ============================================================================

export interface Lead {
  id: number
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  ruc_cedula?: string
  ciudad?: string
  direccion?: string
  notas?: string
  created_at: string
  updated_at: string
}

export interface LeadConEstadisticas extends Lead {
  total_cotizaciones: number
  total_ventas: number
  tasa_conversion: number
  primera_cotizacion?: string
  ultima_cotizacion?: string
}

// ============================================================================
// COTIZACIONES
// ============================================================================

export type EstadoCotizacion = 'borrador' | 'pendiente' | 'enviada' | 'aprobada' | 'rechazada'
export type CanalCotizacion = 'web' | 'whatsapp' | 'email'

export interface Cotizacion {
  id: number
  lead_id: number
  estado: EstadoCotizacion
  subtotal: number
  iva: number
  total: number
  validez_dias: number
  pdf_url?: string
  canal: CanalCotizacion
  notas?: string
  created_at: string
  updated_at: string
}

export interface CotizacionConRelaciones extends Cotizacion {
  leads: Lead
  items_cotizacion: ItemCotizacion[]
  eventos?: Evento[]
}

export interface ItemCotizacion {
  id: number
  cotizacion_id: number
  producto_id: number
  cantidad: number
  precio_unitario_aplicado: number
  subtotal: number
  created_at: string
  productos?: Producto
}

// ============================================================================
// EVENTOS
// ============================================================================

export type TipoEvento = 
  | 'pdf_generado'
  | 'email_enviado'
  | 'whatsapp_share'
  | 'cotizacion_creada'
  | 'cotizacion_actualizada'
  | 'cotizacion_editada'
  | 'estado_cambiado'
  | 'cotizacion_clonada'

export interface Evento {
  id: number
  cotizacion_id: number
  tipo: TipoEvento
  descripcion?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface EventoConCotizacion extends Evento {
  cotizaciones?: {
    id: number
    leads?: {
      nombre: string
      empresa?: string
    }
  }
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface EstadisticasDashboard {
  total_cotizaciones: number
  cotizaciones_mes: number
  ingresos_estimados: number
  cotizaciones_borrador: number
  cotizaciones_enviadas: number
  cotizaciones_aprobadas: number
  cotizaciones_rechazadas: number
  productos_activos: number
  total_leads: number
}

export interface ProductoTopCotizado {
  id: number
  nombre: string
  sku: string
  categoria: string
  imagen_url?: string
  veces_cotizado: number
  cantidad_total_cotizada: number
  ingresos_totales: number
}

export interface DatosGrafica {
  fecha: string
  cotizaciones: number
}

// ============================================================================
// FORMULARIOS
// ============================================================================

export interface ProductoFormData {
  sku: string
  nombre: string
  descripcion?: string
  categoria: ProductoCategoria
  unidad?: string
  minimo_pedido?: number
  activo?: boolean
  imagen_url?: string
}

export interface LeadFormData {
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  ruc_cedula?: string
  ciudad?: string
  direccion?: string
  notas?: string
}

export interface CotizacionFormData {
  lead_id: number
  items: {
    producto_id: number
    cantidad: number
    precio_unitario_aplicado: number
  }[]
  validez_dias?: number
  notas?: string
  estado?: EstadoCotizacion
}

export interface PrecioEscalonadoFormData {
  cantidad_min: number
  precio_unitario: number
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

export interface FiltrosProductos {
  busqueda?: string
  categoria?: ProductoCategoria | 'todos'
  estado?: 'activos' | 'inactivos' | 'todos'
  page?: number
  perPage?: number
}

export interface FiltrosCotizaciones {
  busqueda?: string
  estado?: EstadoCotizacion | 'todos'
  fecha_inicio?: string
  fecha_fin?: string
  lead_id?: number
  monto_min?: number
  monto_max?: number
  page?: number
  perPage?: number
}

export interface FiltrosLeads {
  busqueda?: string
  ciudad?: string
  tiene_empresa?: boolean
  con_cotizaciones?: boolean
  page?: number
  perPage?: number
}

export interface FiltrosEventos {
  tipo?: TipoEvento | 'todos'
  cotizacion_id?: number
  fecha_inicio?: string
  fecha_fin?: string
  page?: number
  perPage?: number
}

export interface ResultadoPaginado<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ============================================================================
// RESPUESTAS DE API
// ============================================================================

export interface RespuestaAPI<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface RespuestaUpload {
  success: boolean
  url?: string
  path?: string
  error?: string
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export interface ConfiguracionEmpresa {
  nombre: string
  email: string
  telefono: string
  whatsapp: string
  direccion: string
  logo_url?: string
}

export interface ConfiguracionCotizaciones {
  tasa_iva: number
  validez_dias_default: number
  prefijo_numeracion: string
  anio_reinicio: number
}

export interface ConfiguracionEmails {
  from_name: string
  plantilla_asunto: string
  mensaje_validez: string
  footer_personalizado: string
}
