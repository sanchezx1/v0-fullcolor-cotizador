import { createClient } from 'jsr:@supabase/supabase-js@2';
import { HttpError, requirePrivilegedAccess } from '../_shared/security.ts';
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { z } from 'https://deno.land/x/zod@v3.24.1/mod.ts';
// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
// Cliente con permisos de servicio para actualizar leads
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Schema de validación para Lead
const LeadSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(255),
  email: z.string().email('Email inválido').max(255),
  telefono: z.string().max(20).optional(),
  empresa: z.string().max(255).optional(),
  ruc_cedula: z.string().max(13).optional(),
  ciudad: z.string().max(100).optional(),
  notas: z.string().max(1000).optional(),
});

async function ensureAdminLeadAccess(req: Request) {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new HttpError(500, 'Faltan credenciales de Supabase');
  }

  await requirePrivilegedAccess({
    req,
    supabase,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey
  });
}
/**
 * Edge Function para crear o actualizar leads con Service Role
 * Evita problemas de RLS al actualizar datos de contacto
 */ Deno.serve(async (req)=>{
  const corsHeaders = getCorsHeaders(req);
  try {
    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return handleCorsPreflight(req);
    }
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Método no permitido'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }
    await ensureAdminLeadAccess(req);

    // Obtener y validar datos del request
    const body = await req.json();

    // Validar con Zod
    const validationResult = LeadSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Validación de datos falló:', validationResult.error.flatten());
      return new Response(JSON.stringify({
        error: 'Datos inválidos',
        details: validationResult.error.flatten().fieldErrors
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { nombre, email, telefono, empresa, ruc_cedula, ciudad, notas } = validationResult.data;
    console.log('🔍 Upsert lead para email:', email);
    // Buscar lead existente por email
    const { data: existingLeads, error: searchError } = await supabase.from('leads').select('*').eq('email', email).limit(1);
    if (searchError) {
      console.error('❌ Error buscando lead:', searchError);
      throw new Error(`Error buscando lead: ${searchError.message}`);
    }
    let lead;
    if (existingLeads && existingLeads.length > 0) {
      // Lead existe, actualizar
      const existingLead = existingLeads[0];
      console.log('📝 Actualizando lead existente:', existingLead.id);
      const { data: updatedLeads, error: updateError } = await supabase.from('leads').update({
        nombre,
        telefono,
        empresa,
        ruc_cedula,
        ciudad,
        notas,
        updated_at: new Date().toISOString()
      }).eq('id', existingLead.id).select();
      if (updateError) {
        console.error('❌ Error actualizando lead:', updateError);
        throw new Error(`Error actualizando lead: ${updateError.message}`);
      }
      if (!updatedLeads || updatedLeads.length === 0) {
        throw new Error('No se devolvió el lead actualizado');
      }
      lead = updatedLeads[0];
      console.log('✅ Lead actualizado exitosamente:', lead.id);
    } else {
      // Lead no existe, crear nuevo
      console.log('➕ Creando nuevo lead...');
      const { data: newLeads, error: insertError } = await supabase.from('leads').insert({
        nombre,
        email,
        telefono,
        empresa,
        ruc_cedula,
        ciudad,
        notas
      }).select();
      if (insertError) {
        console.error('❌ Error creando lead:', insertError);
        throw new Error(`Error creando lead: ${insertError.message}`);
      }
      if (!newLeads || newLeads.length === 0) {
        throw new Error('No se devolvió el lead creado');
      }
      lead = newLeads[0];
      console.log('✅ Lead creado exitosamente:', lead.id);
    }
    return new Response(JSON.stringify({
      success: true,
      lead,
      action: existingLeads && existingLeads.length > 0 ? 'updated' : 'created'
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error en upsert-lead:', error);
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    return new Response(JSON.stringify({
      error: message,
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status,
      headers: corsHeaders
    });
  }
});
