-- ====================================================================
-- LIMPIEZA DE COTIZACIONES DUPLICADAS
-- ====================================================================
-- Este script elimina cotizaciones duplicadas manteniendo solo la más reciente
-- de cada número duplicado.
-- 
-- INSTRUCCIONES:
-- 1. Ve al Dashboard de Supabase
-- 2. SQL Editor → New Query
-- 3. Copia y pega este script
-- 4. Click en "Run"
-- ====================================================================

-- Paso 1: Ver cotizaciones duplicadas (solo para verificar)
SELECT 
  numero,
  COUNT(*) as cantidad,
  array_agg(id ORDER BY created_at DESC) as ids,
  array_agg(created_at ORDER BY created_at DESC) as fechas
FROM cotizaciones
GROUP BY numero
HAVING COUNT(*) > 1
ORDER BY numero;

-- Paso 2: Eliminar ítems de cotizaciones duplicadas (excepto la más reciente)
DELETE FROM items_cotizacion
WHERE cotizacion_id IN (
  SELECT id 
  FROM cotizaciones c1
  WHERE EXISTS (
    SELECT 1 
    FROM cotizaciones c2 
    WHERE c2.numero = c1.numero 
    AND c2.id > c1.id
  )
);

-- Paso 3: Eliminar cotizaciones duplicadas (excepto la más reciente)
DELETE FROM cotizaciones c1
WHERE EXISTS (
  SELECT 1 
  FROM cotizaciones c2 
  WHERE c2.numero = c1.numero 
  AND c2.id > c1.id
);

-- Paso 4: Verificar que no queden duplicados
SELECT 
  numero,
  COUNT(*) as cantidad
FROM cotizaciones
GROUP BY numero
HAVING COUNT(*) > 1;

-- Si el resultado del paso 4 está vacío, ¡todo está limpio! ✅
