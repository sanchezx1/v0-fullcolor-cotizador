import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('\n🔐 VERIFICACIÓN DE SEGURIDAD DE LA BASE DE DATOS\n')
console.log('=' .repeat(60))

async function checkRLSStatus() {
  console.log('\n📋 1. VERIFICANDO ESTADO DE RLS (Row Level Security)...\n')
  
  const tables = [
    'productos',
    'precios_escalonados', 
    'leads',
    'cotizaciones',
    'items_cotizacion',
    'eventos',
    'profiles'
  ]
  
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            tablename,
            CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
          FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename IN ('${tables.join("','")}')
          ORDER BY tablename;
        `
      })
    
    if (error) {
      // Método alternativo si no existe la función
      console.log('   ℹ️  Consultando directamente las tablas...\n')
      
      for (const table of tables) {
        // Intentar hacer una query sin autenticación para probar RLS
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (table === 'profiles' && error) {
          console.log(`   ⚠️  Tabla "${table}": RLS probablemente HABILITADO (requiere auth)`)
        } else if (error) {
          console.log(`   ⚠️  Tabla "${table}": ${error.message}`)
        } else {
          console.log(`   ⚠️  Tabla "${table}": RLS probablemente DESHABILITADO (acceso sin auth)`)
        }
      }
    } else {
      data.forEach(row => {
        const icon = row.rls_status === 'ENABLED' ? '🔒' : '🔓'
        console.log(`   ${icon} Tabla "${row.tablename}": ${row.rls_status}`)
      })
    }
  } catch (err) {
    console.log('   ⚠️  No se pudo verificar RLS directamente')
    console.log('   Verificando acceso a tablas...\n')
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          if (error.message.includes('row-level security')) {
            console.log(`   🔒 Tabla "${table}": RLS HABILITADO`)
          } else {
            console.log(`   ❓ Tabla "${table}": ${error.message}`)
          }
        } else {
          console.log(`   🔓 Tabla "${table}": RLS DESHABILITADO (${count} registros accesibles)`)
        }
      } catch (e) {
        console.log(`   ❌ Tabla "${table}": Error - ${e.message}`)
      }
    }
  }
}

async function checkAuthUsers() {
  console.log('\n👥 2. VERIFICANDO USUARIOS AUTENTICADOS...\n')
  
  try {
    // Intentar obtener usuarios (requiere service role key)
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.log('   ⚠️  No se puede listar usuarios (requiere Service Role Key)')
      console.log(`   Error: ${error.message}`)
      return
    }
    
    if (users && users.length > 0) {
      console.log(`   ✅ Total de usuarios registrados: ${users.length}`)
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`)
      })
    } else {
      console.log('   ⚠️  NO HAY USUARIOS CREADOS')
      console.log('\n   🚀 ACCIÓN REQUERIDA:')
      console.log('      1. Ve a Supabase Dashboard → Authentication → Users')
      console.log('      2. Click en "Add user"')
      console.log('      3. Email: admin@fullcolor.com')
      console.log('      4. Password: (tu contraseña segura)')
      console.log('      5. Auto Confirm User: ✅ ON')
    }
  } catch (err) {
    console.log(`   ❌ Error al verificar usuarios: ${err.message}`)
  }
}

async function checkProfiles() {
  console.log('\n📝 3. VERIFICANDO TABLA PROFILES...\n')
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('   ❌ Tabla "profiles" NO EXISTE')
        console.log('\n   🚀 ACCIÓN REQUERIDA:')
        console.log('      Ejecutar: database/migrations/005_setup_authentication_and_rls.sql')
        console.log('      en Supabase Dashboard → SQL Editor')
      } else if (error.message.includes('row-level security')) {
        console.log('   🔒 Tabla "profiles" EXISTE con RLS habilitado')
        console.log('   ⚠️  No se puede acceder sin autenticación (CORRECTO)')
      } else {
        console.log(`   ⚠️  Error: ${error.message}`)
      }
    } else if (data) {
      console.log(`   ✅ Tabla "profiles" EXISTE`)
      console.log(`   📊 Perfiles registrados: ${data.length}`)
      
      if (data.length > 0) {
        data.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email} - Rol: ${profile.role}`)
        })
      } else {
        console.log('   ⚠️  No hay perfiles creados (normal si no hay usuarios)')
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`)
  }
}

async function checkStoragePolicies() {
  console.log('\n📦 4. VERIFICANDO STORAGE BUCKETS Y POLÍTICAS...\n')
  
  const buckets = ['productos', 'cotizaciones']
  
  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list('', { limit: 1 })
      
      if (error) {
        if (error.message.includes('not found')) {
          console.log(`   ❌ Bucket "${bucketName}": NO EXISTE`)
        } else {
          console.log(`   ⚠️  Bucket "${bucketName}": ${error.message}`)
        }
      } else {
        console.log(`   ✅ Bucket "${bucketName}": EXISTE y accesible`)
        
        // Verificar si es público
        const { data: publicData } = await supabase
          .storage
          .from(bucketName)
          .getPublicUrl('test.jpg')
        
        if (publicData?.publicUrl) {
          console.log(`      → Configurado como: PÚBLICO`)
        }
      }
    } catch (err) {
      console.log(`   ❌ Bucket "${bucketName}": Error - ${err.message}`)
    }
  }
}

async function checkRLSPolicies() {
  console.log('\n🛡️  5. VERIFICANDO POLÍTICAS RLS...\n')
  
  try {
    // Intentar acceder a diferentes tablas para ver qué políticas están activas
    const tests = [
      {
        table: 'productos',
        expected: 'READ permitido (público)',
        action: async () => {
          const { data, error } = await supabase
            .from('productos')
            .select('id, nombre')
            .limit(1)
          return { success: !error, error }
        }
      },
      {
        table: 'leads',
        expected: 'CREATE permitido (anónimo)',
        action: async () => {
          // No intentaremos crear, solo verificar
          return { success: null, error: null }
        }
      },
      {
        table: 'cotizaciones',
        expected: 'READ limitado según RLS',
        action: async () => {
          const { data, error } = await supabase
            .from('cotizaciones')
            .select('id, numero')
            .limit(1)
          return { success: !error, error }
        }
      }
    ]
    
    for (const test of tests) {
      const result = await test.action()
      if (result.success === null) {
        console.log(`   ℹ️  Tabla "${test.table}": No verificado`)
      } else if (result.success) {
        console.log(`   ✅ Tabla "${test.table}": ${test.expected} ✓`)
      } else {
        if (result.error?.message.includes('row-level security')) {
          console.log(`   🔒 Tabla "${test.table}": RLS activo (requiere autenticación)`)
        } else {
          console.log(`   ⚠️  Tabla "${test.table}": ${result.error?.message}`)
        }
      }
    }
  } catch (err) {
    console.log(`   ❌ Error al verificar políticas: ${err.message}`)
  }
}

async function generateSecurityReport() {
  console.log('\n' + '=' .repeat(60))
  console.log('\n📊 RESUMEN DE SEGURIDAD\n')
  
  try {
    // Verificar acceso público a productos (debe funcionar)
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('count', { count: 'exact', head: true })
    
    // Verificar acceso a tabla profiles (debe fallar sin auth)
    const { data: profiles, error: errorProfiles } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    const productosAccesibles = !errorProductos
    const profilesBloqueado = errorProfiles && errorProfiles.message.includes('row-level security')
    
    console.log('Estado Actual:')
    console.log('')
    
    if (productosAccesibles && profilesBloqueado) {
      console.log('   ✅ SEGURIDAD CONFIGURADA CORRECTAMENTE')
      console.log('      - Productos accesibles públicamente: ✓')
      console.log('      - Perfiles protegidos por RLS: ✓')
      console.log('')
      console.log('   🎯 Sistema en MODO PRODUCCIÓN')
    } else if (productosAccesibles && !profilesBloqueado) {
      console.log('   ⚠️  SEGURIDAD EN MODO DESARROLLO')
      console.log('      - Productos accesibles: ✓')
      console.log('      - Tabla profiles: Accesible sin auth (RLS deshabilitado)')
      console.log('')
      console.log('   🚨 ANTES DE PRODUCCIÓN:')
      console.log('      → Ejecutar: 005_setup_authentication_and_rls.sql')
    } else {
      console.log('   🔴 CONFIGURACIÓN REQUIERE ATENCIÓN')
      console.log('      - Revisar estado de tablas y políticas RLS')
    }
    
  } catch (err) {
    console.log('   ❌ Error al generar reporte:', err.message)
  }
  
  console.log('')
  console.log('=' .repeat(60))
  console.log('')
}

// Ejecutar todas las verificaciones
async function main() {
  await checkRLSStatus()
  await checkAuthUsers()
  await checkProfiles()
  await checkStoragePolicies()
  await checkRLSPolicies()
  await generateSecurityReport()
}

main().catch(console.error)
