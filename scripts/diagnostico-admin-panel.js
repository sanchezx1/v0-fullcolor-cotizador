/**
 * Script de diagnóstico para el panel admin
 * Verifica autenticación, RLS y permisos
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnosticar() {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('🔍 DIAGNÓSTICO DEL PANEL ADMIN')
  console.log('═══════════════════════════════════════════════════════\n')

  // 1. Verificar conexión a Supabase
  console.log('1️⃣  Verificando conexión a Supabase...')
  try {
    const { data, error } = await supabase.from('productos').select('count', { count: 'exact', head: true })
    if (error) {
      console.log('   ❌ Error de conexión:', error.message)
      console.log('   📋 Detalles:', error)
    } else {
      console.log('   ✅ Conexión exitosa')
    }
  } catch (error) {
    console.log('   ❌ Error al conectar:', error)
  }

  // 2. Verificar estado de autenticación
  console.log('\n2️⃣  Verificando autenticación...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.log('   ❌ Usuario NO autenticado')
    console.log('   ℹ️  Esto es normal si no has iniciado sesión en la app')
    console.log('   ℹ️  El error en el panel admin puede ser por falta de autenticación')
  } else {
    console.log('   ✅ Usuario autenticado')
    console.log('   📧 Email:', user.email)
    console.log('   🆔 ID:', user.id)
  }

  // 3. Verificar perfil del usuario
  console.log('\n3️⃣  Verificando perfil de usuario...')
  if (user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.log('   ❌ Error obteniendo perfil:', profileError.message)
      } else if (profile) {
        console.log('   ✅ Perfil encontrado')
        console.log('   👤 Nombre:', profile.full_name || 'No definido')
        console.log('   🎭 Rol:', profile.role || 'No definido')
        console.log('   📅 Creado:', new Date(profile.created_at).toLocaleString())
      } else {
        console.log('   ⚠️  Perfil no encontrado para este usuario')
      }
    } catch (error) {
      console.log('   ❌ Error:', error)
    }
  } else {
    console.log('   ⏭️  Saltado (no hay usuario autenticado)')
  }

  // 4. Verificar acceso a tabla productos (sin autenticación)
  console.log('\n4️⃣  Verificando acceso a productos (anónimo)...')
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, sku, activo', { count: 'exact' })
      .limit(5)
    
    if (error) {
      console.log('   ❌ Error:', error.message)
      console.log('   📋 Código:', error.code)
      console.log('   📋 Detalles:', error.details)
      console.log('   📋 Hint:', error.hint)
      
      if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
        console.log('\n   🔒 DIAGNÓSTICO: RLS está bloqueando el acceso')
        console.log('   💡 SOLUCIÓN: Las políticas RLS requieren autenticación')
        console.log('   💡 El usuario debe estar logueado para acceder al panel admin')
      }
    } else {
      console.log('   ✅ Acceso exitoso')
      console.log('   📊 Productos encontrados:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('   📦 Ejemplos:')
        data.forEach(p => console.log(`      - ${p.nombre} (SKU: ${p.sku})`))
      }
    }
  } catch (error) {
    console.log('   ❌ Error inesperado:', error)
  }

  // 5. Verificar RLS en todas las tablas
  console.log('\n5️⃣  Verificando estado de RLS en tablas...')
  const tablas = ['productos', 'precios_escalonados', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos', 'profiles']
  
  for (const tabla of tablas) {
    try {
      const { data, error } = await supabase.from(tabla).select('count', { count: 'exact', head: true })
      
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
          console.log(`   🔒 ${tabla}: RLS habilitado (requiere autenticación)`)
        } else {
          console.log(`   ❌ ${tabla}: Error - ${error.message}`)
        }
      } else {
        console.log(`   ✅ ${tabla}: Acceso público permitido`)
      }
    } catch (error) {
      console.log(`   ❌ ${tabla}: Error inesperado`)
    }
  }

  // 6. Verificar políticas RLS
  console.log('\n6️⃣  Consultando políticas RLS activas...')
  try {
    const { data: policies, error } = await supabase.rpc('get_policies_info')
    
    if (error) {
      console.log('   ⚠️  No se puede consultar políticas (función RPC no existe)')
      console.log('   ℹ️  Esto es normal, se necesita crear la función en Supabase')
    } else {
      console.log('   ✅ Políticas encontradas:', policies?.length || 0)
    }
  } catch (error) {
    console.log('   ⚠️  No se puede consultar políticas')
  }

  // RESUMEN Y RECOMENDACIONES
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('📋 RESUMEN Y RECOMENDACIONES')
  console.log('═══════════════════════════════════════════════════════\n')

  if (!user) {
    console.log('🔴 PROBLEMA PRINCIPAL: Usuario no autenticado')
    console.log('\n💡 SOLUCIONES:')
    console.log('   1. Inicia sesión en la aplicación:')
    console.log('      → http://localhost:3000/auth/login')
    console.log('      → Email: carlosmatiasflor@gmail.com')
    console.log('      → Password: [tu contraseña]')
    console.log('\n   2. Verifica que las políticas RLS permitan acceso a usuarios autenticados')
    console.log('      → Dashboard Supabase → Authentication → Policies')
    console.log('\n   3. Confirma que el perfil del usuario tiene rol "admin"')
    console.log('      → Dashboard Supabase → Table Editor → profiles')
  } else {
    console.log('✅ Usuario autenticado correctamente')
    console.log('\n💡 Si aún tienes errores:')
    console.log('   1. Verifica que las políticas RLS estén configuradas correctamente')
    console.log('   2. Revisa que el rol del usuario sea "admin" en la tabla profiles')
    console.log('   3. Ejecuta: database/migrations/005_setup_authentication_and_rls.sql')
  }

  console.log('\n═══════════════════════════════════════════════════════\n')
}

diagnosticar().catch(console.error)
