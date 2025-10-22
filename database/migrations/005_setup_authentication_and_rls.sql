-- ============================================
-- CONFIGURACIÓN DE AUTENTICACIÓN Y RLS
-- Archivo: 005_setup_authentication_and_rls.sql
-- Descripción: Configura autenticación y políticas RLS seguras
-- ============================================

-- PASO 1: Crear tabla de perfiles de usuario
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios administradores';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario (solo admin por ahora)';

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- PASO 2: Función para crear perfil automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'admin' -- Todos los usuarios creados son admin
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un usuario';

-- Trigger para ejecutar la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASO 3: Políticas RLS para tabla profiles
-- ============================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política: Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 4: RE-HABILITAR RLS en tablas principales
-- ============================================

-- Re-habilitar RLS en todas las tablas
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precios_escalonados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 5: Políticas RLS para PRODUCTOS
-- ============================================

-- Eliminar políticas públicas antiguas (las de desarrollo)
DROP POLICY IF EXISTS "Anyone can read productos" ON public.productos;
DROP POLICY IF EXISTS "Anyone can insert productos" ON public.productos;
DROP POLICY IF EXISTS "Anyone can update productos" ON public.productos;
DROP POLICY IF EXISTS "Anyone can delete productos" ON public.productos;

-- Política: Lectura pública para el catálogo (anónimos y autenticados)
CREATE POLICY "Public read access to productos"
ON public.productos FOR SELECT
TO anon, authenticated
USING (activo = true);

-- Política: Admins pueden ver todos los productos (incluso inactivos)
CREATE POLICY "Admins full read access to productos"
ON public.productos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden insertar productos
CREATE POLICY "Admins can insert productos"
ON public.productos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden actualizar productos
CREATE POLICY "Admins can update productos"
ON public.productos FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden eliminar productos
CREATE POLICY "Admins can delete productos"
ON public.productos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 6: Políticas RLS para PRECIOS_ESCALONADOS
-- ============================================

DROP POLICY IF EXISTS "Public read precios_escalonados" ON public.precios_escalonados;
DROP POLICY IF EXISTS "Admins manage precios_escalonados" ON public.precios_escalonados;

-- Lectura pública (para cotizador)
CREATE POLICY "Public read precios_escalonados"
ON public.precios_escalonados FOR SELECT
TO anon, authenticated
USING (true);

-- Solo admins pueden modificar precios
CREATE POLICY "Admins manage precios_escalonados"
ON public.precios_escalonados FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 7: Políticas RLS para LEADS
-- ============================================

DROP POLICY IF EXISTS "Anon can create leads" ON public.leads;
DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;

-- Anónimos pueden crear leads (desde cotizador público)
CREATE POLICY "Anon can create leads"
ON public.leads FOR INSERT
TO anon
WITH CHECK (true);

-- Solo admins pueden leer/actualizar/eliminar leads
CREATE POLICY "Admins manage leads"
ON public.leads FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 8: Políticas RLS para COTIZACIONES
-- ============================================

DROP POLICY IF EXISTS "Anon can create cotizaciones" ON public.cotizaciones;
DROP POLICY IF EXISTS "Admins manage cotizaciones" ON public.cotizaciones;

-- Anónimos pueden crear cotizaciones (desde formulario público)
CREATE POLICY "Anon can create cotizaciones"
ON public.cotizaciones FOR INSERT
TO anon
WITH CHECK (true);

-- Solo admins pueden leer/actualizar/eliminar cotizaciones
CREATE POLICY "Admins manage cotizaciones"
ON public.cotizaciones FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 9: Políticas RLS para ITEMS_COTIZACION
-- ============================================

DROP POLICY IF EXISTS "Anon can create items_cotizacion" ON public.items_cotizacion;
DROP POLICY IF EXISTS "Admins manage items_cotizacion" ON public.items_cotizacion;

-- Anónimos pueden crear items (parte de crear cotización)
CREATE POLICY "Anon can create items_cotizacion"
ON public.items_cotizacion FOR INSERT
TO anon
WITH CHECK (true);

-- Solo admins pueden leer/actualizar/eliminar items
CREATE POLICY "Admins manage items_cotizacion"
ON public.items_cotizacion FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 10: Políticas RLS para EVENTOS
-- ============================================

DROP POLICY IF EXISTS "System can create eventos" ON public.eventos;
DROP POLICY IF EXISTS "Admins read eventos" ON public.eventos;

-- Sistema puede crear eventos (desde triggers/functions)
CREATE POLICY "System can create eventos"
ON public.eventos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo admins pueden leer eventos
CREATE POLICY "Admins read eventos"
ON public.eventos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 11: Políticas RLS para STORAGE
-- ============================================

-- Eliminar políticas públicas antiguas
DROP POLICY IF EXISTS "productos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "productos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "productos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "productos_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_delete_policy" ON storage.objects;

-- PRODUCTOS BUCKET: Lectura pública, escritura solo admins
CREATE POLICY "Public read productos bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'productos');

CREATE POLICY "Admins upload to productos bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'productos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins update productos bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'productos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins delete from productos bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'productos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- COTIZACIONES BUCKET: Lectura pública, escritura sistema/admins
CREATE POLICY "Public read cotizaciones bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'cotizaciones');

CREATE POLICY "Admins upload to cotizaciones bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cotizaciones' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins update cotizaciones bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cotizaciones' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins delete from cotizaciones bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cotizaciones' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PASO 12: Verificación de la configuración
-- ============================================

-- Verificar que RLS está habilitado
DO $$
DECLARE
  rls_status RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     VERIFICACIÓN DE CONFIGURACIÓN RLS                  ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  FOR rls_status IN
    SELECT 
      schemaname,
      tablename,
      rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'productos', 'precios_escalonados', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos')
    ORDER BY tablename
  LOOP
    IF rls_status.rowsecurity THEN
      RAISE NOTICE '✅ % - RLS HABILITADO', rls_status.tablename;
    ELSE
      RAISE NOTICE '❌ % - RLS DESHABILITADO', rls_status.tablename;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     RESUMEN DE POLÍTICAS CREADAS                       ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'profiles:               4 políticas (view own, update own, admins view all)';
  RAISE NOTICE 'productos:              5 políticas (public read, admins CRUD)';
  RAISE NOTICE 'precios_escalonados:    2 políticas (public read, admins manage)';
  RAISE NOTICE 'leads:                  2 políticas (anon create, admins manage)';
  RAISE NOTICE 'cotizaciones:           2 políticas (anon create, admins manage)';
  RAISE NOTICE 'items_cotizacion:       2 políticas (anon create, admins manage)';
  RAISE NOTICE 'eventos:                2 políticas (system create, admins read)';
  RAISE NOTICE 'storage.productos:      4 políticas (public read, admins write)';
  RAISE NOTICE 'storage.cotizaciones:   4 políticas (public read, admins write)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Seguridad aplicada correctamente';
  RAISE NOTICE '';
END $$;

-- ============================================
-- PASO 13: Instrucciones para crear primer usuario admin
-- ============================================

-- EJECUTA ESTOS PASOS EN SUPABASE DASHBOARD:
-- 1. Ve a: Authentication → Users
-- 2. Click en "Add user" → "Create new user"
-- 3. Ingresa:
--    - Email: admin@fullcolor.com
--    - Password: (contraseña segura)
--    - Auto Confirm User: ✅ ON
-- 4. El trigger creará automáticamente el perfil con role='admin'

COMMENT ON TABLE public.profiles IS 'IMPORTANTE: Crea usuarios desde Supabase Dashboard → Authentication → Users';
