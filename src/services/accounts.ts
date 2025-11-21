import { supabase, Lead } from "./supabaseClient"
import { vincularLeadAUsuarioAutenticado } from "./quotes"

type LeadUpdatePayload = Partial<Pick<Lead, "nombre" | "telefono" | "empresa" | "ciudad" | "ruc_cedula">>

/**
 * Vincula el lead principal del usuario autenticado usando su email.
 * No falla si ya esta vinculado.
 */
export async function asegurarLeadVinculado(email?: string | null) {
  if (!email) return
  try {
    await vincularLeadAUsuarioAutenticado(email)
  } catch (error) {
    console.warn("No se pudo vincular lead a la cuenta:", error)
  }
}

/**
 * Obtiene el lead principal del usuario autenticado (el mas reciente).
 */
export async function obtenerLeadDeUsuario(): Promise<Lead | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error("Error obteniendo usuario actual:", userError)
    throw userError
  }

  if (!user) return null

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error cargando lead del usuario:", error)
    throw error
  }

  return data as Lead | null
}

/**
 * Actualiza los datos de contacto del lead principal del usuario autenticado.
 */
export async function actualizarLeadDeUsuario(payload: LeadUpdatePayload): Promise<Lead> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error("Error obteniendo usuario actual:", userError)
    throw userError
  }

  if (!user || !user.email) {
    throw new Error("No encontramos tu sesion activa")
  }

  const lead = await obtenerLeadDeUsuario()

  // Si el usuario nunca tuvo cotizaciones ni lead previo, crear uno con los datos actuales.
  if (!lead) {
    const nombreFallback =
      (payload.nombre && payload.nombre.trim()) ||
      (user.user_metadata as { full_name?: string } | null)?.full_name ||
      user.email.split("@")[0] ||
      "Cliente"

    const { data: nuevoLead, error: createError } = await supabase
      .from("leads")
      .insert({
        nombre: nombreFallback,
        email: user.email,
        telefono: payload.telefono ?? null,
        empresa: payload.empresa ?? null,
        ciudad: payload.ciudad ?? null,
        ruc_cedula: payload.ruc_cedula ?? null,
        user_id: user.id,
        origen: "cotizador_web",
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creando lead inicial para el usuario:", createError)
      throw createError
    }

    return nuevoLead as Lead
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id)
    .select()
    .single()

  if (error) {
    console.error("Error actualizando datos de contacto:", error)
    throw error
  }

  return data as Lead
}
