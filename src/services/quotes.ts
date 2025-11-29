import { supabase, Lead, LeadReference, Cotizacion, ItemCotizacion, Evento } from "./supabaseClient"
import type { Producto } from '../types/quotes'
import { LeadSchema, CreateQuoteSchema } from '../schemas'

/**
 * Crea o reutiliza un lead (contacto) basado en el email.
 * El RPC maneja la deduplicación y, si el usuario está autenticado con el mismo email,
 * actualiza `user_id` para vincular el lead a la cuenta.
 */
export async function crearLead(leadData: {
  nombre: string
  email: string
  telefono: string
  empresa: string
  notas?: string
  ruc_cedula?: string
  ciudad?: string
}): Promise<LeadReference> {
  try {
    console.debug("[Lead] Creando/reutilizando lead mediante RPC seguro")

    // Validar datos de entrada con Zod
    const validatedData = LeadSchema.parse(leadData)

    const params = {
      p_nombre: validatedData.nombre,
      p_email: validatedData.email,
      p_telefono: validatedData.telefono ?? "",
      p_empresa: validatedData.empresa ?? "",
      p_notas: validatedData.notas,
      p_ruc_cedula: validatedData.ruc_cedula,
      p_ciudad: validatedData.ciudad,
    }

    const { data, error } = await supabase.rpc("create_public_lead", params)

    if (error) {
      console.error("[Lead] Error ejecutando create_public_lead:", error)
      throw new Error(`Error creando lead: ${error.message}`)
    }

    // Cast del resultado del RPC
    const result = data as unknown as { success: boolean; lead: LeadReference; reused?: boolean; upgraded_to_user?: boolean }

    if (!result || !result.success || !result.lead) {
      throw new Error("Error creando lead: respuesta inválida del servidor")
    }

    const lead = result.lead

    console.debug("[Lead] Lead asegurado (nuevo o reutilizado):", {
      id: lead.id,
      reused: !!result.reused,
      upgraded: !!result.upgraded_to_user,
    })

    return lead
  } catch (error) {
    console.error("[Lead] Error en crearLead:", error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`Error inesperado: ${JSON.stringify(error)}`)
    }
  }
}

/**
 * Crea una nueva cotización con sus ítems.
 * El RPC asigna user_id si el lead ya está vinculado o si el actor autenticado coincide.
 */
export async function crearCotizacion(cotizacionData: {
  leadId: number
  items: Array<{
    productoId: number
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
  canal: "web" | "whatsapp" | "email"
  notas?: string
}): Promise<{ cotizacion: Cotizacion; items: ItemCotizacion[] }> {
  try {
    console.debug("Creando cotizacion via RPC")

    // Validar datos de entrada con Zod
    const validatedData = CreateQuoteSchema.parse({
      leadId: cotizacionData.leadId,
      items: cotizacionData.items.map((item) => ({
        producto_id: item.productoId,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario,
        subtotal: item.subtotal,
      })),
      canal: cotizacionData.canal,
      notas: cotizacionData.notas,
    })

    const itemsPayload = validatedData.items.map((item) => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    }))

    // leadId es requerido para crear una cotización
    if (!validatedData.leadId) {
      throw new Error("leadId es requerido para crear una cotización")
    }

    const quoteParams = {
      p_lead_id: validatedData.leadId,
      p_items: itemsPayload as unknown as any, // Cast para compatibilidad con Json type
      p_canal: validatedData.canal,
      p_notas: validatedData.notas,
    }

    const { data, error } = await supabase.rpc("create_public_quote", quoteParams as any)

    if (error) {
      console.error("❌ Error ejecutando create_public_quote:", error)
      throw new Error(`Error creando cotización: ${error.message}`)
    }

    // Cast del resultado del RPC
    const result = data as unknown as { cotizacion: Cotizacion; items: ItemCotizacion[] }

    if (!result || !result.cotizacion) {
      throw new Error("Error creando cotización: el servidor no devolvió la cotización")
    }

    const cotizacion = result.cotizacion
    const items = result.items || []

    console.debug("Cotizacion creada via RPC", { id: cotizacion.id })

    return { cotizacion, items }
  } catch (error) {
    console.error("❌ Error en crearCotizacion:", error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error(`Error inesperado al crear cotización: ${JSON.stringify(error)}`)
    }
  }
}

/**
 * Registra un evento relacionado con una cotización.
 */
export async function registrarEvento(eventoData: {
  cotizacionId: number
  tipo: "pdf_generado" | "email_enviado" | "whatsapp_share" | "cotizacion_creada" | "cotizacion_actualizada"
  metadata?: Record<string, unknown>
}): Promise<Evento> {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .insert({
        cotizacion_id: eventoData.cotizacionId,
        tipo: eventoData.tipo,
        metadata: eventoData.metadata as any, // Cast para compatibilidad con tipo Json de Supabase
      })
      .select()
      .single()

    if (error) {
      console.error("Error registering event:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in registrarEvento:", error)
    throw error
  }
}

/**
 * Actualiza el estado de una cotización.
 */
export async function actualizarEstadoCotizacion(
  cotizacionId: number,
  nuevoEstado: Cotizacion["estado"],
  pdfUrl?: string
): Promise<Cotizacion> {
  try {
    const updateData: { estado: Cotizacion["estado"]; pdf_url?: string } = { estado: nuevoEstado }
    if (pdfUrl) {
      updateData.pdf_url = pdfUrl
    }

    const { data, error } = await supabase
      .from("cotizaciones")
      .update(updateData)
      .eq("id", cotizacionId)
      .select()
      .single()

    if (error) {
      console.error("Error updating quote status:", error)
      throw error
    }

    // Registrar evento de actualización
    await registrarEvento({
      cotizacionId,
      tipo: "cotizacion_actualizada",
      metadata: {
        nuevo_estado: nuevoEstado,
        pdf_url: pdfUrl,
      },
    })

    return data
  } catch (error) {
    console.error("Error in actualizarEstadoCotizacion:", error)
    throw error
  }
}

/**
 * Obtiene una cotización con todos sus datos relacionados.
 */
export async function obtenerCotizacionCompleta(cotizacionId: number): Promise<{
  cotizacion: Cotizacion
  lead: Lead
  items: Array<ItemCotizacion & { producto: Producto }>
  eventos: Evento[]
}> {
  try {
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from("cotizaciones")
      .select(`
        *,
        leads (*),
        items_cotizacion (
          *,
          productos (*)
        )
      `)
      .eq("id", cotizacionId)
      .single()

    if (cotizacionError) {
      console.error("Error fetching quote:", cotizacionError)
      throw cotizacionError
    }

    const { data: eventos, error: eventosError } = await supabase
      .from("eventos")
      .select("*")
      .eq("cotizacion_id", cotizacionId)
      .order("created_at", { ascending: true })

    if (eventosError) {
      console.error("Error fetching events:", eventosError)
      throw eventosError
    }

    type CotizacionWithRelations = Cotizacion & {
      leads: Lead
      items_cotizacion: Array<ItemCotizacion & { productos: Producto }>
    }

    return {
      cotizacion,
      lead: (cotizacion as CotizacionWithRelations).leads,
      items: (cotizacion as CotizacionWithRelations).items_cotizacion.map(item => ({
        ...item,
        producto: item.productos
      })),
      eventos: eventos || [],
    }
  } catch (error) {
    console.error("Error in obtenerCotizacionCompleta:", error)
    throw error
  }
}

/**
 * Vincula el lead principal de un email al usuario autenticado (upgrade de invitado a cuenta).
 */
export async function vincularLeadAUsuarioAutenticado(email: string): Promise<{ linked: boolean; leadId?: number | null }> {
  if (!email) {
    throw new Error("Email requerido para vincular lead")
  }

  try {
    const { data, error } = await supabase.rpc("link_lead_to_auth_user", { p_email: email })

    if (error) {
      throw error
    }

    // Cast del resultado JSON a un objeto con las propiedades esperadas
    const result = data as { linked?: boolean; lead_id?: number | null } | null
    return { linked: !!result?.linked, leadId: result?.lead_id ?? null }
  } catch (error) {
    console.warn("No se pudo vincular lead a usuario autenticado:", error)
    return { linked: false, leadId: null }
  }
}

/**
 * Detecta si ya existe un lead para el email (sin exponer datos del lead).
 */
export async function existeLeadParaEmail(email: string): Promise<boolean> {
  if (!email) return false
  const { data, error } = await supabase.rpc("check_lead_email_exists", { p_email: email })
  if (error) {
    console.error("Error revisando existencia de lead:", error)
    return false
  }
  return Boolean(data)
}

/**
 * Detecta el estado de un email: si no existe, si es invitado, o si tiene cuenta creada.
 */
export async function verificarEstadoEmail(email: string): Promise<{ exists: boolean; hasAccount: boolean }> {
  if (!email) return { exists: false, hasAccount: false }

  const { data, error } = await supabase.rpc("check_lead_email_status", { p_email: email })

  if (error) {
    console.error("Error verificando estado de email:", error)
    return { exists: false, hasAccount: false }
  }

  // Cast del resultado del RPC
  const result = data as { exists: boolean; has_account: boolean } | null

  return {
    exists: result?.exists ?? false,
    hasAccount: result?.has_account ?? false
  }
}

/**
 * Obtiene cotizaciones visibles para el usuario autenticado (panel "Mi cuenta").
 */
export async function obtenerCotizacionesDeUsuario(): Promise<Array<Cotizacion & { leads: Lead }>> {
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*, leads(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo cotizaciones del usuario:", error)
    throw error
  }

  // RLS ya filtra por user_id o lead.user_id; retornamos datos tipados
  return (data as Array<Cotizacion & { leads: Lead }>) ?? []
}

/**
 * Obtiene detalle de una cotización para el usuario autenticado (respeta RLS).
 */
export async function obtenerCotizacionDeUsuarioPorId(
  cotizacionId: number
): Promise<(Cotizacion & { leads: Lead; items_cotizacion: (ItemCotizacion & { productos: Producto })[] }) | null> {
  const { data, error } = await supabase
    .from("cotizaciones")
    .select(
      `
      *,
      leads (*),
      items_cotizacion (*, productos (*))
    `
    )
    .eq("id", cotizacionId)
    .maybeSingle()

  if (error) {
    console.error("Error obteniendo detalle de cotización del usuario:", error)
    throw error
  }

  // Cast para compatibilidad de tipos null/undefined de Supabase
  return data as any
}
