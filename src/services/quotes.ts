import { supabase, Lead, Cotizacion, ItemCotizacion, Evento } from './supabaseClient'

/**
 * Crea o actualiza un lead (contacto) basado en el email
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
    console.log('[Lead] Creando lead mediante RPC seguro para email:', leadData.email)

    const { data, error } = await supabase.rpc('create_public_lead', {
      p_nombre: leadData.nombre,
      p_email: leadData.email,
      p_telefono: leadData.telefono,
      p_empresa: leadData.empresa,
      p_notas: leadData.notas ?? null,
      p_ruc_cedula: leadData.ruc_cedula ?? null,
      p_ciudad: leadData.ciudad ?? null
    })

    if (error) {
      console.error('[Lead] Error ejecutando create_public_lead:', error)
      throw new Error(`Error creando lead: ${error.message}`)
    }

    if (!data) {
      throw new Error('Error creando lead: respuesta vacía')
    }

    if (!data.success) {
      if (data.code === 'LEAD_EMAIL_EXISTS') {
        const conflictError = new Error('LEAD_EMAIL_EXISTS') as any
        conflictError.code = 'LEAD_EMAIL_EXISTS'
        conflictError.existingLead = data.existing_lead
        conflictError.newData = data.new_data ?? leadData
        throw conflictError
      }

      throw new Error('Error creando lead: respuesta inválida del servidor')
    }

    if (!data.lead) {
      throw new Error('Error creando lead: el servidor no devolvió el lead creado')
    }

    console.log('[Lead] Lead creado exitosamente:', data.lead)
    return data.lead as Lead
  } catch (error) {
    console.error('[Lead] Error en crearLead:', error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`Error inesperado: ${JSON.stringify(error)}`)
    }
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
    console.log('🔎 Creando cotización para lead:', cotizacionData.leadId)

    const itemsPayload = cotizacionData.items.map(item => ({
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      subtotal: item.subtotal
    }))

    const { data, error } = await supabase.rpc('create_public_quote', {
      p_lead_id: cotizacionData.leadId,
      p_items: itemsPayload,
      p_canal: cotizacionData.canal,
      p_notas: cotizacionData.notas ?? null
    })

    if (error) {
      console.error('❌ Error ejecutando create_public_quote:', error)
      throw new Error(`Error creando cotización: ${error.message}`)
    }

    if (!data || !data.cotizacion) {
      throw new Error('Error creando cotización: el servidor no devolvió la cotización')
    }

    const cotizacion = data.cotizacion as Cotizacion
    const items = (data.items as ItemCotizacion[]) || []

    console.log('✅ Cotización creada vía RPC:', cotizacion.id)

    return { cotizacion, items }
  } catch (error) {
    console.error('❌ Error en crearCotizacion:', error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`Error inesperado al crear cotización: ${JSON.stringify(error)}`)
    }
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

