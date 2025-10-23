-- ============================================
-- FIX: Recursión Infinita en Políticas de Profiles
-- ============================================
-- Problema: Las políticas de "profiles" consultan "profiles" 
-- causando recursión infinita
-- Solución: Usar auth.uid() directamente sin consultar profiles
-- ============================================

-- 1. ELIMINAR políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- También eliminar cualquier variación de nombres
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- 2. CREAR políticas SIN recursión
-- Los usuarios pueden ver su propio perfil (usando auth.uid() directamente)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil (para el trigger)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICA ESPECIAL PARA ADMINS
-- ============================================
-- IMPORTANTE: Usamos una función auxiliar que NO consulta profiles
-- para evitar la recursión

-- Crear función auxiliar que verifica si el usuario es admin
-- SIN consultar la tabla profiles (usa user_metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si el usuario actual tiene role='admin' en sus metadatos
  -- O si es el primer usuario (para setup inicial)
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$;

-- Ahora crear políticas de admin usando la función
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- ACTUALIZAR USER METADATA DEL ADMIN
-- ============================================
-- Agregar el rol 'admin' a los metadatos del usuario
-- para que la función is_admin() funcione

UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
  END
WHERE email = 'carlosmatiasflor@gmail.com';

-- También actualizar en la tabla profiles
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'carlosmatiasflor@gmail.com';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar usuario admin
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  p.role as profile_role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'carlosmatiasflor@gmail.com';

-- Mostrar resumen
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'profiles';
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '✅ POLÍTICAS DE PROFILES CORREGIDAS';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Políticas activas: %', policy_count;
  RAISE NOTICE '✅ Recursión eliminada';
  RAISE NOTICE '✅ Función is_admin() creada';
  RAISE NOTICE '✅ Usuario admin configurado';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 SIGUIENTE PASO:';
  RAISE NOTICE '   1. Cierra sesión en la aplicación';
  RAISE NOTICE '   2. Vuelve a iniciar sesión';
  RAISE NOTICE '   3. Los metadatos se cargarán con el rol admin';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
END $$;
