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
    const { data: existingLeads, error: searchError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', leadData.email)
      .limit(1)

    if (searchError) {
      console.error('❌ Error buscando lead:', searchError)
      // No lanzar error, solo continuar creando uno nuevo
      console.log('⚠️ Error al buscar, creando nuevo lead...')
    }

    // Si ya existe, intentar actualizarlo
    if (existingLeads && existingLeads.length > 0) {
      const existingLead = existingLeads[0]
      console.log('📝 Lead existente encontrado:', existingLead.id)
      
      // Intentar actualizar (puede fallar por RLS si usuario no autenticado)
      const { data: updatedLeads, error: updateError } = await supabase
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

      if (updateError) {
        console.error('⚠️ No se pudo actualizar lead (posible RLS):', updateError.message)
        // Si falla la actualización (por RLS), usar el lead existente sin actualizar
        console.log('✅ Usando lead existente sin actualizar:', existingLead.id)
        return existingLead
      }

      if (updatedLeads && updatedLeads.length > 0) {
        console.log('✅ Lead actualizado exitosamente:', updatedLeads[0])
        return updatedLeads[0]
      } else {
        // Si no se devolvió nada, usar el lead existente
        console.log('⚠️ Update no devolvió registros, usando lead existente')
        return existingLead
      }
    }

    // 2. Si no existe, crear uno nuevo
    console.log('➕ Lead no existe, creando nuevo...')
    const { data: newLeads, error: insertError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()

    if (insertError) {
      console.error('❌ Error creando lead:', insertError)
      throw new Error(`Error creando lead: ${insertError.message} (Código: ${insertError.code})`)
    }

    if (!newLeads || newLeads.length === 0) {
      throw new Error('Error creando lead: No se devolvió ningún registro')
    }

    console.log('✅ Lead creado exitosamente:', newLeads[0])
    return newLeads[0]
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
 * Genera un número de cotización único con reintentos y fallback
 */
async function generarNumeroCotizacionUnico(): Promise<string> {
  const maxIntentos = 5
  
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      console.log(`🔄 Intento ${intento}/${maxIntentos} de generar número único...`)
      
      // Generar manualmente siempre (más confiable que RPC en este caso)
      // Obtener TODOS los números existentes y encontrar el máximo
      const { data: todasCots, error: searchError } = await supabase
        .from('cotizaciones')
        .select('numero')
        .order('numero', { ascending: false })
        .limit(100) // Obtener los últimos 100 para analizar

      if (searchError) {
        console.error('⚠️ Error buscando cotizaciones:', searchError)
        throw searchError
      }

      let siguienteNumero = 1

      if (todasCots && todasCots.length > 0) {
        // Extraer todos los números y encontrar el máximo
        const numeros = todasCots
          .map(cot => {
            const match = cot.numero.match(/COT-(\d+)/)
            return match ? parseInt(match[1], 10) : 0
          })
          .filter(num => num > 0)

        if (numeros.length > 0) {
          const maxNumero = Math.max(...numeros)
          siguienteNumero = maxNumero + intento // Sumar el intento para evitar colisiones
        }
      }

      const nuevoNumero = `COT-${siguienteNumero.toString().padStart(5, '0')}`
      console.log(`📝 Número candidato: ${nuevoNumero}`)

      // Verificar que no exista
      const { data: existe, error: checkError } = await supabase
        .from('cotizaciones')
        .select('numero')
        .eq('numero', nuevoNumero)
        .limit(1)

      if (checkError) {
        console.error('⚠️ Error verificando número:', checkError)
        throw checkError
      }

      if (!existe || existe.length === 0) {
        console.log(`✅ Número único confirmado: ${nuevoNumero}`)
        return nuevoNumero
      }

      // Si existe, esperar y reintentar
      console.log(`⚠️ Número ${nuevoNumero} ya existe, reintentando en ${100 * intento}ms...`)
      await new Promise(resolve => setTimeout(resolve, 100 * intento))
      
    } catch (error) {
      console.error(`❌ Error en intento ${intento}:`, error)
      
      // Si no es el último intento, esperar y continuar
      if (intento < maxIntentos) {
        await new Promise(resolve => setTimeout(resolve, 150 * intento))
        continue
      }
      
      // En el último intento, usar fallback con timestamp único
      console.log('⚠️ Todos los intentos fallaron, usando fallback...')
    }
  }

  // Fallback final: timestamp + random
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const fallbackNumero = `COT-T${timestamp.toString().slice(-4)}${random.toString().padStart(3, '0')}`
  console.log('🆘 Usando número fallback único:', fallbackNumero)
  return fallbackNumero
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

    // Generar número de cotización único
    const numero = await generarNumeroCotizacionUnico()
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

