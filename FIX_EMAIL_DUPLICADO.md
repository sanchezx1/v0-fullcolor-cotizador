# 🔧 SOLUCIÓN: Error de Email Duplicado

## ❌ Error Encontrado
```
ERROR: 23505: could not create unique index "idx_leads_email_unique"
DETAIL: Key (email)=(carlosmatiasflor@gmail.com) is duplicated.
```

## ✅ Solución Aplicada

He creado una nueva versión del script de migración que:

### 1. **Limpia duplicados ANTES** de crear el índice
```sql
-- Elimina duplicados manteniendo el lead más reciente
WITH duplicados AS (
  SELECT id, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL
)
DELETE FROM leads
WHERE id IN (
  SELECT id FROM duplicados WHERE rn > 1
);
```

### 2. **Verifica integridad** al final
```sql
-- Confirma que no queden duplicados
DO $$
DECLARE
  emails_duplicados INT;
BEGIN
  SELECT COUNT(*) INTO emails_duplicados
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM leads
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  ) duplicados;
  
  IF emails_duplicados > 0 THEN
    RAISE EXCEPTION 'Error: Aún hay % emails duplicados', emails_duplicados;
  END IF;
END $$;
```

## 🚀 Cómo Ejecutar

### Opción 1: Usar el nuevo script (RECOMENDADO)
```sql
-- Copiar contenido de:
database/migrations/001_admin_schema_updates_FIXED.sql

-- Pegar en: Supabase Dashboard → SQL Editor → Run
```

### Opción 2: Ejecutar manualmente (si ya tienes cambios parciales)

**Paso 1:** Eliminar duplicados
```sql
WITH duplicados AS (
  SELECT id, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL
)
DELETE FROM leads
WHERE id IN (
  SELECT id FROM duplicados WHERE rn > 1
);
```

**Paso 2:** Verificar que no queden duplicados
```sql
SELECT email, COUNT(*) as cantidad
FROM leads
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;
```

Debería devolver **0 filas**.

**Paso 3:** Crear el índice único
```sql
CREATE UNIQUE INDEX idx_leads_email_unique ON leads(email);
```

## 📊 ¿Qué hace el script corregido?

### Mejoras vs versión anterior:

1. ✅ **Limpia duplicados primero** (mantiene el más reciente)
2. ✅ **Usa DO blocks** para evitar errores si ya existen columnas
3. ✅ **Verifica integridad** antes de confirmar
4. ✅ **Mensajes informativos** durante la ejecución
5. ✅ **Idempotente** - se puede ejecutar múltiples veces sin romper

### Orden de ejecución:

```
1. Limpiar duplicados de email
2. Actualizar tabla productos (SKU)
3. Actualizar tabla leads (ruc, ciudad, dirección)
4. Actualizar tabla cotizaciones (subtotal, IVA)
5. Actualizar tabla eventos (tipos)
6. Crear vistas (dashboard, top productos)
7. Crear función (generar_numero_cotizacion)
8. Verificar integridad
9. Confirmar éxito
```

## 🐛 Si aún tienes errores

### Error: "column already exists"
→ Es normal, el script lo maneja con `DO` blocks. Ignóralo.

### Error: "relation already exists"
→ La vista/función ya existe. El script hace `DROP IF EXISTS` primero.

### Error: "constraint already exists"
→ El script elimina constraints antes de recrearlos.

## 📝 Notas Importantes

### ⚠️ Duplicados eliminados
El script elimina leads duplicados **manteniendo el más reciente** (mayor `created_at`).

Si necesitas revisar qué se va a eliminar ANTES de ejecutar:
```sql
-- SOLO PARA REVISAR (no ejecuta DELETE)
WITH duplicados AS (
  SELECT id, email, nombre, created_at,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL
)
SELECT * FROM duplicados WHERE rn > 1
ORDER BY email, created_at;
```

### 💾 Backup (opcional pero recomendado)
```sql
-- Crear tabla de respaldo antes de ejecutar
CREATE TABLE leads_backup AS SELECT * FROM leads;

-- Si algo sale mal, restaurar:
-- DELETE FROM leads;
-- INSERT INTO leads SELECT * FROM leads_backup;
```

## ✅ Confirmación de Éxito

Al ejecutar el script verás mensajes como:
```
NOTICE: Todos los productos tienen SKU
NOTICE: No hay emails duplicados en leads
NOTICE: ============================================
NOTICE: Migración completada exitosamente
NOTICE: ============================================
```

---

## 🚀 Siguiente Paso

Una vez ejecutado exitosamente:
1. ✅ Verifica que `/admin` cargue sin errores
2. ✅ Revisa los KPIs (deben mostrar datos reales)
3. ✅ Explora la gráfica y top productos
4. 🎯 Continúa con CRUD Productos

¿Ejecutaste el script corregido? ¿Todo OK ahora? 🚀
