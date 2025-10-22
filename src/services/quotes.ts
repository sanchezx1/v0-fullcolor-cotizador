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
    console.log('🔍 Verificando si lead existe con email:', leadData.email)
    
    // 1. Verificar si el lead ya existe por email
    const { data: existingLead, error: searchError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', leadData.email)
      .single()

    // Si ya existe, actualizarlo
    if (existingLead && !searchError) {
      console.log('📝 Lead existente encontrado, actualizando...', existingLead.id)
      
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({
          nombre: leadData.nombre,
          telefono: leadData.telefono,
          empresa: leadData.empresa,
          notas: leadData.notas,
          ruc_cedula: leadData.ruc_cedula,
          ciudad: leadData.ciudad,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error actualizando lead:', updateError)
        throw new Error(`Error actualizando lead: ${updateError.message}`)
      }

      console.log('✅ Lead actualizado exitosamente:', updatedLead)
      return updatedLead
    }

    // 2. Si no existe, crear uno nuevo
    console.log('➕ Lead no existe, creando nuevo...')
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creando lead:', insertError)
      throw new Error(`Error creando lead: ${insertError.message} (Código: ${insertError.code})`)
    }

    console.log('✅ Lead creado exitosamente:', newLead)
    return newLead
  } catch (error) {
    console.error('❌ Error en crearLead:', error)
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
    console.log('🔍 Creando cotización para lead:', cotizacionData.leadId)
    
    // Calcular total
    const total = cotizacionData.items.reduce((sum, item) => sum + item.subtotal, 0)
    console.log('💰 Total calculado:', total)

    // Generar número de cotización usando la función de Supabase
    const { data: numeroData, error: numeroError } = await supabase
      .rpc('generar_numero_cotizacion')

    if (numeroError) {
      console.error('❌ Error generando número de cotización:', numeroError)
      throw new Error(`Error generando número de cotización: ${numeroError.message}`)
    }

    const numero = numeroData as string
    console.log('📄 Número de cotización generado:', numero)

    // Crear la cotización
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from('cotizaciones')
      .insert({
        lead_id: cotizacionData.leadId,
        numero,
        estado: 'pendiente',
        total,
        validez_dias: 30,
        canal: cotizacionData.canal,
        notas: cotizacionData.notas
      })
      .select()
      .single()

    if (cotizacionError) {
      console.error('❌ Error creando cotización:', {
        message: cotizacionError.message,
        details: cotizacionError.details,
        hint: cotizacionError.hint,
        code: cotizacionError.code
      })
      throw new Error(`Error creando cotización: ${cotizacionError.message} (Código: ${cotizacionError.code})`)
    }

    console.log('✅ Cotización creada:', cotizacion.id)

    // Crear los ítems de la cotización
    const itemsData = cotizacionData.items.map(item => ({
      cotizacion_id: cotizacion.id,
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario_aplicado: item.precioUnitario,
      subtotal: item.subtotal
    }))

    console.log('📦 Insertando', itemsData.length, 'items...')

    const { data: items, error: itemsError } = await supabase
      .from('items_cotizacion')
      .insert(itemsData)
      .select()

    if (itemsError) {
      console.error('❌ Error creando items de cotización:', {
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
        code: itemsError.code
      })
      throw new Error(`Error creando items: ${itemsError.message} (Código: ${itemsError.code})`)
    }

    console.log('✅ Items creados:', items.length)

    // Registrar evento de creación
    try {
      await registrarEvento({
        cotizacionId: cotizacion.id,
        tipo: 'cotizacion_creada',
        metadata: {
          total_items: cotizacionData.items.length,
          canal: cotizacionData.canal
        }
      })
      console.log('✅ Evento registrado')
    } catch (eventoError) {
      // No fallar si el evento no se puede registrar
      console.warn('⚠️ No se pudo registrar evento:', eventoError)
    }

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

