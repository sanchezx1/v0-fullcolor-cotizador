import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cliente con permisos de servicio para actualizar leads
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Edge Function para crear o actualizar leads con Service Role
 * Evita problemas de RLS al actualizar datos de contacto
 */
Deno.serve(async (req: Request) => {
  try {
    // Headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    }

    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders
      })
    }

    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método no permitido' }),
        { 
          status: 405,
          headers: corsHeaders
        }
      )
    }

    // Obtener datos del request
    const { nombre, email, telefono, empresa, ruc_cedula, ciudad, notas } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    if (!nombre) {
      return new Response(
        JSON.stringify({ error: 'Nombre es requerido' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    console.log('🔍 Upsert lead para email:', email)

    // Buscar lead existente por email
    const { data: existingLeads, error: searchError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (searchError) {
      console.error('❌ Error buscando lead:', searchError)
      throw new Error(`Error buscando lead: ${searchError.message}`)
    }

    let lead

    if (existingLeads && existingLeads.length > 0) {
      // Lead existe, actualizar
      const existingLead = existingLeads[0]
      console.log('📝 Actualizando lead existente:', existingLead.id)

      const { data: updatedLeads, error: updateError } = await supabase
        .from('leads')
        .update({
          nombre,
          telefono,
          empresa,
          ruc_cedula,
          ciudad,
          notas,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
        .select()

      if (updateError) {
        console.error('❌ Error actualizando lead:', updateError)
        throw new Error(`Error actualizando lead: ${updateError.message}`)
      }

      if (!updatedLeads || updatedLeads.length === 0) {
        throw new Error('No se devolvió el lead actualizado')
      }

      lead = updatedLeads[0]
      console.log('✅ Lead actualizado exitosamente:', lead.id)

    } else {
      // Lead no existe, crear nuevo
      console.log('➕ Creando nuevo lead...')

      const { data: newLeads, error: insertError } = await supabase
        .from('leads')
        .insert({
          nombre,
          email,
          telefono,
          empresa,
          ruc_cedula,
          ciudad,
          notas
        })
        .select()

      if (insertError) {
        console.error('❌ Error creando lead:', insertError)
        throw new Error(`Error creando lead: ${insertError.message}`)
      }

      if (!newLeads || newLeads.length === 0) {
        throw new Error('No se devolvió el lead creado')
      }

      lead = newLeads[0]
      console.log('✅ Lead creado exitosamente:', lead.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead,
        action: existingLeads && existingLeads.length > 0 ? 'updated' : 'created'
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    )

  } catch (error) {
    console.error('Error en upsert-lead:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
