import { supabase, Lead, Cotizacion, ItemCotizacion, Evento } from './supabaseClient'

/**
 * Crea un nuevo lead (contacto)
 */
export async function crearLead(leadData: {
  nombre: string
  email: string
  telefono: string
  empresa: string
  notas?: string
  ruc_cedula?: string
  ciudad?: string
}): Promise<Lead> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in crearLead:', error)
    throw error
  }
}

/**
 * Crea una nueva cotización con sus ítems
 */
export async function crearCotizacion(cotizacionData: {
  leadId: number
  items: Array<{
    productoId: number
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
  canal: 'web' | 'whatsapp' | 'email'
  notas?: string
}): Promise<{ cotizacion: Cotizacion; items: ItemCotizacion[] }> {
  try {
    // Calcular total
    const total = cotizacionData.items.reduce((sum, item) => sum + item.subtotal, 0)

    // Crear la cotización
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from('cotizaciones')
      .insert({
        lead_id: cotizacionData.leadId,
        estado: 'pendiente',
        total,
        validez_dias: 30,
        canal: cotizacionData.canal,
        notas: cotizacionData.notas
      })
      .select()
      .single()

    if (cotizacionError) {
      console.error('Error creating quote:', cotizacionError)
      throw cotizacionError
    }

    // Crear los ítems de la cotización
    const itemsData = cotizacionData.items.map(item => ({
      cotizacion_id: cotizacion.id,
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario_aplicado: item.precioUnitario,
      subtotal: item.subtotal
    }))

    const { data: items, error: itemsError } = await supabase
      .from('items_cotizacion')
      .insert(itemsData)
      .select()

    if (itemsError) {
      console.error('Error creating quote items:', itemsError)
      throw itemsError
    }

    // Registrar evento de creación
    await registrarEvento({
      cotizacionId: cotizacion.id,
      tipo: 'cotizacion_creada',
      metadata: {
        total_items: cotizacionData.items.length,
        canal: cotizacionData.canal
      }
    })

    return { cotizacion, items }
  } catch (error) {
    console.error('Error in crearCotizacion:', error)
    throw error
  }
}

/**
 * Registra un evento relacionado con una cotización
 */
export async function registrarEvento(eventoData: {
  cotizacionId: number
  tipo: 'pdf_generado' | 'email_enviado' | 'whatsapp_share' | 'cotizacion_creada' | 'cotizacion_actualizada'
  metadata?: Record<string, any>
}): Promise<Evento> {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .insert({
        cotizacion_id: eventoData.cotizacionId,
        tipo: eventoData.tipo,
        metadata: eventoData.metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Error registering event:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in registrarEvento:', error)
    throw error
  }
}

/**
 * Actualiza el estado de una cotización
 */
export async function actualizarEstadoCotizacion(
  cotizacionId: number,
  nuevoEstado: Cotizacion['estado'],
  pdfUrl?: string
): Promise<Cotizacion> {
  try {
    const updateData: any = { estado: nuevoEstado }
    if (pdfUrl) {
      updateData.pdf_url = pdfUrl
    }

    const { data, error } = await supabase
      .from('cotizaciones')
      .update(updateData)
      .eq('id', cotizacionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quote status:', error)
      throw error
    }

    // Registrar evento de actualización
    await registrarEvento({
      cotizacionId,
      tipo: 'cotizacion_actualizada',
      metadata: {
        nuevo_estado: nuevoEstado,
        pdf_url: pdfUrl
      }
    })

    return data
  } catch (error) {
    console.error('Error in actualizarEstadoCotizacion:', error)
    throw error
  }
}

/**
 * Obtiene una cotización con todos sus datos relacionados
 */
export async function obtenerCotizacionCompleta(cotizacionId: number): Promise<{
  cotizacion: Cotizacion
  lead: Lead
  items: Array<ItemCotizacion & { producto: any }>
  eventos: Evento[]
}> {
  try {
    // Obtener cotización
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        leads (*),
        items_cotizacion (
          *,
          productos (*)
        )
      `)
      .eq('id', cotizacionId)
      .single()

    if (cotizacionError) {
      console.error('Error fetching quote:', cotizacionError)
      throw cotizacionError
    }

    // Obtener eventos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .eq('cotizacion_id', cotizacionId)
      .order('created_at', { ascending: true })

    if (eventosError) {
      console.error('Error fetching events:', eventosError)
      throw eventosError
    }

    return {
      cotizacion,
      lead: cotizacion.leads,
      items: cotizacion.items_cotizacion,
      eventos: eventos || []
    }
  } catch (error) {
    console.error('Error in obtenerCotizacionCompleta:', error)
    throw error
  }
}

