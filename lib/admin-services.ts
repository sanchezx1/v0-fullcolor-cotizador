/**
 * Servicios de Supabase para el Panel Admin
 * Todas las operaciones CRUD centralizadas aquí
 */

'use client'

import { supabase } from './supabase-client'
import type {
  Producto,
  ProductoConPrecios,
  PrecioEscalonado,
  Lead,
  LeadConEstadisticas,
  Cotizacion,
  CotizacionCompleta,
  ItemCotizacion,
  Evento,
  EstadisticasDashboard,
  ProductoTopCotizado,
  FiltrosProductos,
  FiltrosCotizaciones,
  FiltrosLeads,
  FiltrosEventos,
  PaginatedResponse,
  EstadoCotizacion
} from './admin-types'

// ============= PRODUCTOS =============

export async function getProductos(filtros?: FiltrosProductos): Promise<PaginatedResponse<ProductoConPrecios>> {
  try {
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Usuario no autenticado. Por favor inicia sesión.')
    }

    let query = supabase
      .from('productos')
      .select('*, precios_escalonados(*)', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filtros
    if (filtros?.search) {
      query = query.or(`nombre.ilike.%${filtros.search}%,sku.ilike.%${filtros.search}%`)
    }
    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria)
    }
    if (filtros?.activo !== undefined && filtros?.activo !== 'all') {
      query = query.eq('activo', filtros.activo)
    }

    // Paginación
    const page = filtros?.page || 1
    const perPage = filtros?.perPage || 20
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error detallado de Supabase:', error)
      throw new Error(`Error al obtener productos: ${error.message || 'Error desconocido'}`)
    }

    // Calcular precio base (el más bajo de cada producto)
    const productos = data?.map(p => ({
      ...p,
      precio_base: p.precios_escalonados?.length > 0
        ? Math.min(...p.precios_escalonados.map((pe: any) => pe.precio_unitario))
        : 0
    })) || []

    return {
      data: productos,
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    }
  } catch (error: any) {
    console.error('Error en getProductos:', error)
    throw new Error(error.message || 'Error al cargar productos')
  }
}

export async function getProducto(id: number): Promise<ProductoConPrecios | null> {
  const { data, error } = await supabase
    .from('productos')
    .select('*, precios_escalonados(*)')
    .eq('id', id)
    .single()

  if (error) throw error

  if (!data) return null

  return {
    ...data,
    precio_base: data.precios_escalonados?.length > 0
      ? Math.min(...data.precios_escalonados.map((pe: any) => pe.precio_unitario))
      : 0
  }
}

export async function createProducto(producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>): Promise<Producto> {
  try {
    let sku = producto.sku
    
    // Si no se proporciona SKU o está vacío, generar automáticamente
    if (!sku || sku.trim() === '') {
      console.log('🔢 Generando SKU automático para categoría:', producto.categoria)
      sku = await generarSkuAutomatico(producto.categoria)
      console.log('✅ SKU generado:', sku)
    } else {
      // Si se proporciona SKU, verificar que sea único
      const esUnico = await verificarSkuUnico(sku)
      if (!esUnico) {
        throw new Error(`El SKU "${sku}" ya existe`)
      }
    }

    console.log('📦 Insertando producto con SKU:', sku)
    const { data, error } = await supabase
      .from('productos')
      .insert({ ...producto, sku })
      .select()
      .single()

    if (error) {
      console.error('❌ Error de Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Error al crear producto: ${error.message || 'Error desconocido'}`)
    }
    
    if (!data) {
      throw new Error('No se devolvió el producto creado')
    }
    
    console.log('✅ Producto creado exitosamente:', data.id)
    return data
  } catch (error: any) {
    console.error('❌ Error completo en createProducto:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      error: error
    })
    
    // Lanzar error con mensaje descriptivo
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`Error al crear producto: ${JSON.stringify(error)}`)
    }
  }
}

export async function updateProducto(id: number, producto: Partial<Producto>): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .update({ ...producto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProducto(id: number): Promise<void> {
  // Primero eliminar precios escalonados
  await supabase.from('precios_escalonados').delete().eq('producto_id', id)
  
  // Luego eliminar el producto
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function verificarSkuUnico(sku: string, productoId?: number): Promise<boolean> {
  let query = supabase
    .from('productos')
    .select('id')
    .eq('sku', sku)

  if (productoId) {
    query = query.neq('id', productoId)
  }

  const { data, error } = await query

  if (error) throw error
  return !data || data.length === 0
}

/**
 * Genera un prefijo de SKU basado en la categoría
 */
function generarPrefijoSku(categoria: string): string {
  const prefijos: Record<string, string> = {
    'Papelería Corporativa': 'PAP',
    'Publicidad': 'PUB',
    'Promocional': 'PROM',
    'Señalética': 'SEN',
    'Packaging': 'PACK',
    'Textil': 'TEXT',
    'Digital': 'DIG',
    'Otro': 'PROD'
  }
  
  return prefijos[categoria] || 'PROD'
}

/**
 * Genera un SKU único automáticamente
 * Formato: {PREFIJO}-{CONTADOR}
 * Ejemplo: PAP-001, PUB-042
 */
export async function generarSkuAutomatico(categoria: string): Promise<string> {
  try {
    const prefijo = generarPrefijoSku(categoria)
    
    // Buscar el último SKU con este prefijo
    const { data, error } = await supabase
      .from('productos')
      .select('sku')
      .ilike('sku', `${prefijo}-%`)
      .order('sku', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    let contador = 1
    
    if (data && data.length > 0) {
      // Extraer el número del último SKU
      const ultimoSku = data[0].sku
      const match = ultimoSku.match(/-(\d+)$/)
      if (match) {
        contador = parseInt(match[1], 10) + 1
      }
    }
    
    // Formatear con ceros a la izquierda (3 dígitos)
    const numeroFormateado = contador.toString().padStart(3, '0')
    const nuevoSku = `${prefijo}-${numeroFormateado}`
    
    // Verificar que no exista (por si acaso)
    const existe = !(await verificarSkuUnico(nuevoSku))
    if (existe) {
      // Si existe, intentar con el siguiente número
      return generarSkuAutomatico(categoria)
    }
    
    return nuevoSku
  } catch (error) {
    console.error('Error generando SKU automático:', error)
    // Fallback: usar timestamp
    return `PROD-${Date.now().toString().slice(-6)}`
  }
}

// ============= PRECIOS ESCALONADOS =============

export async function getPreciosProducto(productoId: number): Promise<PrecioEscalonado[]> {
  const { data, error } = await supabase
    .from('precios_escalonados')
    .select('*')
    .eq('producto_id', productoId)
    .order('cantidad_min', { ascending: true })

  if (error) throw error
  return data || []
}

// Alias for consistency
export const getPreciosEscalonados = getPreciosProducto

export async function createPrecioEscalonado(precio: Omit<PrecioEscalonado, 'id' | 'created_at'>): Promise<PrecioEscalonado> {
  const { data, error } = await supabase
    .from('precios_escalonados')
    .insert(precio)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePrecioEscalonado(id: number, precio: Partial<PrecioEscalonado>): Promise<PrecioEscalonado> {
  const { data, error } = await supabase
    .from('precios_escalonados')
    .update(precio)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePrecioEscalonado(id: number): Promise<void> {
  const { error } = await supabase
    .from('precios_escalonados')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============= LEADS =============

export async function getLeads(filtros?: FiltrosLeads): Promise<PaginatedResponse<LeadConEstadisticas>> {
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filtros
  if (filtros?.search) {
    query = query.or(`nombre.ilike.%${filtros.search}%,empresa.ilike.%${filtros.search}%,email.ilike.%${filtros.search}%,telefono.ilike.%${filtros.search}%`)
  }
  if (filtros?.ciudad) {
    query = query.eq('ciudad', filtros.ciudad)
  }
  if (filtros?.tieneEmpresa !== undefined && filtros?.tieneEmpresa !== 'all') {
    query = filtros.tieneEmpresa ? query.not('empresa', 'is', null) : query.is('empresa', null)
  }

  // Paginación
  const page = filtros?.page || 1
  const perPage = filtros?.perPage || 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  // Agregar estadísticas a cada lead
  const leadsConEstadisticas = await Promise.all(
    (data || []).map(async (lead) => {
      const { data: cotizaciones } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('lead_id', lead.id)

      const total_cotizaciones = cotizaciones?.length || 0
      const aprobadas = cotizaciones?.filter(c => c.estado === 'aprobada') || []
      const total_ventas = aprobadas.reduce((sum, c) => sum + c.total, 0)
      const tasa_conversion = total_cotizaciones > 0 ? (aprobadas.length / total_cotizaciones) * 100 : 0

      const fechas = cotizaciones?.map(c => c.created_at).sort() || []

      return {
        ...lead,
        total_cotizaciones,
        total_ventas,
        tasa_conversion,
        primera_cotizacion: fechas[0],
        ultima_cotizacion: fechas[fechas.length - 1]
      }
    })
  )

  return {
    data: leadsConEstadisticas,
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage)
  }
}

export async function getLead(id: number): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getLeadConEstadisticas(id: number): Promise<LeadConEstadisticas | null> {
  const lead = await getLead(id)
  if (!lead) return null

  // Obtener cotizaciones del lead
  const { data: cotizaciones } = await supabase
    .from('cotizaciones')
    .select('*')
    .eq('lead_id', id)

  const total_cotizaciones = cotizaciones?.length || 0
  const aprobadas = cotizaciones?.filter(c => c.estado === 'aprobada') || []
  const total_ventas = aprobadas.reduce((sum, c) => sum + c.total, 0)
  const tasa_conversion = total_cotizaciones > 0 ? (aprobadas.length / total_cotizaciones) * 100 : 0

  const fechas = cotizaciones?.map(c => c.created_at).sort() || []

  return {
    ...lead,
    total_cotizaciones,
    total_ventas,
    tasa_conversion,
    primera_cotizacion: fechas[0],
    ultima_cotizacion: fechas[fechas.length - 1]
  }
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLead(id: number, lead: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(lead)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLead(id: number): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function verificarEmailUnico(email: string, leadId?: number): Promise<boolean> {
  let query = supabase
    .from('leads')
    .select('id')
    .eq('email', email)

  if (leadId) {
    query = query.neq('id', leadId)
  }

  const { data, error } = await query

  if (error) throw error
  return !data || data.length === 0
}

// ============= COTIZACIONES =============

export async function getCotizaciones(filtros?: FiltrosCotizaciones): Promise<PaginatedResponse<CotizacionConRelaciones>> {
  let query = supabase
    .from('cotizaciones')
    .select('*, leads(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filtros
  if (filtros?.search) {
    query = query.or(`numero.ilike.%${filtros.search}%`)
  }
  if (filtros?.estado && filtros.estado !== 'all') {
    query = query.eq('estado', filtros.estado)
  }
  if (filtros?.leadId) {
    query = query.eq('lead_id', filtros.leadId)
  }
  if (filtros?.montoMin) {
    query = query.gte('total', filtros.montoMin)
  }
  if (filtros?.montoMax) {
    query = query.lte('total', filtros.montoMax)
  }
  if (filtros?.fechaInicio) {
    query = query.gte('created_at', filtros.fechaInicio)
  }
  if (filtros?.fechaFin) {
    query = query.lte('created_at', filtros.fechaFin)
  }

  // Paginación
  const page = filtros?.page || 1
  const perPage = filtros?.perPage || 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage)
  }
}

export async function getCotizacion(id: number): Promise<CotizacionCompleta | null> {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      lead:leads(*),
      items:items_cotizacion(*, producto:productos(*))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  
  if (!data) return null
  
  // Mapear campos de BD a estructura esperada por el frontend
  const mapped = {
    ...data,
    items: data.items?.map((item: any) => ({
      ...item,
      // Mapear precio_unitario_aplicado a precio_unitario
      precio_unitario: item.precio_unitario_aplicado || item.precio_unitario || 0,
      subtotal: item.subtotal || 0,
      // Calcular IVA si no existe
      iva: item.iva || (item.subtotal || 0) * 0.15
    })) || []
  }
  
  return mapped
}

export async function createCotizacion(cotizacion: {
  lead_id: number
  items: { producto_id: number; cantidad: number; precio_unitario: number }[]
}): Promise<Cotizacion> {
  // Calcular totales
  const subtotal = cotizacion.items.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0
  )
  const iva = subtotal * 0.15
  const total = subtotal + iva

  // Generar número
  const { data: numero } = await supabase.rpc('generar_numero_cotizacion')

  // Crear cotización
  const { data: nuevaCotizacion, error: cotError } = await supabase
    .from('cotizaciones')
    .insert({
      numero,
      lead_id: cotizacion.lead_id,
      estado: 'borrador' as EstadoCotizacion,
      subtotal,
      iva,
      total
    })
    .select()
    .single()

  if (cotError) throw cotError

  // Crear items - usar nombres correctos de columnas de BD
  const items = cotizacion.items.map(item => ({
    cotizacion_id: nuevaCotizacion.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario_aplicado: item.precio_unitario, // Mapear a nombre correcto en BD
    subtotal: item.cantidad * item.precio_unitario
    // NO incluir iva - no existe en la tabla
  }))

  const { error: itemsError } = await supabase
    .from('items_cotizacion')
    .insert(items)

  if (itemsError) throw itemsError

  // Registrar evento
  await createEvento({
    tipo: 'cotizacion_creada',
    cotizacion_id: nuevaCotizacion.id,
    descripcion: `Cotización ${numero} creada desde panel admin`,
    metadata: { lead_id: cotizacion.lead_id, total }
  })

  return nuevaCotizacion
}

export async function updateCotizacion(
  id: number,
  cotizacion: {
    lead_id?: number
    estado?: EstadoCotizacion
    items?: { producto_id: number; cantidad: number; precio_unitario: number }[]
  }
): Promise<Cotizacion> {
  let updates: any = { updated_at: new Date().toISOString() }

  if (cotizacion.lead_id) {
    updates.lead_id = cotizacion.lead_id
  }

  if (cotizacion.estado) {
    updates.estado = cotizacion.estado
  }

  // Si se actualizan items, recalcular totales
  if (cotizacion.items) {
    const subtotal = cotizacion.items.reduce(
      (sum, item) => sum + item.cantidad * item.precio_unitario,
      0
    )
    const iva = subtotal * 0.15
    const total = subtotal + iva

    updates.subtotal = subtotal
    updates.iva = iva
    updates.total = total

    // Eliminar items antiguos
    await supabase.from('items_cotizacion').delete().eq('cotizacion_id', id)

    // Insertar nuevos items - usar nombres correctos de columnas de BD
    const items = cotizacion.items.map(item => ({
      cotizacion_id: id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario_aplicado: item.precio_unitario, // Mapear a nombre correcto en BD
      subtotal: item.cantidad * item.precio_unitario
      // NO incluir iva - no existe en la tabla
    }))

    await supabase.from('items_cotizacion').insert(items)
  }

  const { data, error } = await supabase
    .from('cotizaciones')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Registrar evento
  await createEvento({
    tipo: 'cotizacion_editada',
    cotizacion_id: id,
    descripcion: `Cotización ${data.numero} actualizada`,
    metadata: updates
  })

  return data
}

export async function deleteCotizacion(id: number): Promise<void> {
  // Eliminar items
  await supabase.from('items_cotizacion').delete().eq('cotizacion_id', id)
  
  // Eliminar eventos
  await supabase.from('eventos').delete().eq('cotizacion_id', id)
  
  // Eliminar cotización
  const { error } = await supabase
    .from('cotizaciones')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function cambiarEstadoCotizacion(id: number, estado: EstadoCotizacion): Promise<Cotizacion> {
  const { data, error } = await supabase
    .from('cotizaciones')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Registrar evento
  await createEvento({
    tipo: 'estado_cambiado',
    cotizacion_id: id,
    descripcion: `Estado cambiado a ${estado}`,
    metadata: { nuevo_estado: estado }
  })

  return data
}

export async function clonarCotizacion(id: number): Promise<Cotizacion> {
  // Obtener cotización original
  const original = await getCotizacion(id)
  if (!original) throw new Error('Cotización no encontrada')

  // Crear nueva cotización con los mismos datos
  return createCotizacion({
    lead_id: original.lead_id,
    items: original.items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario
    }))
  })
}

// ============= EVENTOS =============

export async function getEventos(filtros?: FiltrosEventos): Promise<PaginatedResponse<Evento>> {
  let query = supabase
    .from('eventos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filtros
  if (filtros?.tipo && filtros.tipo !== 'all') {
    query = query.eq('tipo', filtros.tipo)
  }
  if (filtros?.cotizacionId) {
    query = query.eq('cotizacion_id', filtros.cotizacionId)
  }
  if (filtros?.fechaInicio) {
    query = query.gte('created_at', filtros.fechaInicio)
  }
  if (filtros?.fechaFin) {
    query = query.lte('created_at', filtros.fechaFin)
  }

  // Paginación
  const page = filtros?.page || 1
  const perPage = filtros?.perPage || 50
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage)
  }
}

export async function getEventosCotizacion(cotizacionId: number): Promise<Evento[]> {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('cotizacion_id', cotizacionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createEvento(evento: Omit<Evento, 'id' | 'created_at'>): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .insert(evento)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============= ESTADÍSTICAS Y DASHBOARD =============

export async function getEstadisticasDashboard(): Promise<EstadisticasDashboard> {
  const { data, error } = await supabase
    .from('estadisticas_dashboard')
    .select('*')
    .single()

  if (error) throw error

  // Calcular cotizaciones por estado
  const { data: cotizaciones } = await supabase
    .from('cotizaciones')
    .select('estado')

  const cotizaciones_por_estado = {
    borrador: cotizaciones?.filter(c => c.estado === 'borrador').length || 0,
    enviada: cotizaciones?.filter(c => c.estado === 'enviada').length || 0,
    aprobada: cotizaciones?.filter(c => c.estado === 'aprobada').length || 0,
    rechazada: cotizaciones?.filter(c => c.estado === 'rechazada').length || 0,
    pendiente: cotizaciones?.filter(c => c.estado === 'pendiente').length || 0
  }

  // Calcular ingresos estimados (suma de aprobadas)
  const { data: aprobadas } = await supabase
    .from('cotizaciones')
    .select('total')
    .eq('estado', 'aprobada')

  const ingresos_estimados = aprobadas?.reduce((sum, c) => sum + c.total, 0) || 0

  return {
    ...data,
    cotizaciones_por_estado,
    ingresos_estimados
  }
}

export async function getProductosTopCotizados(limit: number = 5): Promise<ProductoTopCotizado[]> {
  const { data, error } = await supabase
    .from('productos_top_cotizados')
    .select('*')
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getCotizacionesPorDia(dias: number = 7): Promise<{ fecha: string; cantidad: number }[]> {
  const fechaInicio = new Date()
  fechaInicio.setDate(fechaInicio.getDate() - dias)

  const { data, error } = await supabase
    .from('cotizaciones')
    .select('created_at')
    .gte('created_at', fechaInicio.toISOString())

  if (error) throw error

  // Agrupar por día
  const porDia: Record<string, number> = {}
  
  for (let i = 0; i < dias; i++) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - i)
    const key = fecha.toISOString().split('T')[0]
    porDia[key] = 0
  }

  data?.forEach(cotizacion => {
    const key = cotizacion.created_at.split('T')[0]
    if (porDia[key] !== undefined) {
      porDia[key]++
    }
  })

  return Object.entries(porDia)
    .map(([fecha, cantidad]) => ({ fecha, cantidad }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}

// ============= STORAGE =============

export async function uploadImagen(file: File, bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteImagen(url: string, bucket: string = 'productos'): Promise<void> {
  // Extraer path de la URL
  const path = url.split(`/${bucket}/`)[1]
  
  if (!path) return

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}
