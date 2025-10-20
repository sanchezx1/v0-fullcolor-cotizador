# 🎯 CREAR BUCKET DESDE EL DASHBOARD (Método Visual)

Si el SQL no está funcionando, puedes crear el bucket manualmente desde la interfaz:

---

## 📋 **PASOS CON EL DASHBOARD**

### **1. Ir a Storage**
1. Abre: https://supabase.com/dashboard/project/cxhjxponouukrnuxdhyz/storage/buckets
2. Ya deberías estar en la sección "Storage" → "Buckets"

---

### **2. Crear Bucket Nuevo**

Si ves un bucket llamado "cotizaciones":
- Haz clic en los **3 puntos** al lado del nombre
- Selecciona **"Delete bucket"**
- Confirma la eliminación

Luego:
1. Haz clic en **"New bucket"** (botón verde arriba a la derecha)

2. Completa el formulario:
   ```
   Name: cotizaciones
   Public bucket: ✅ (activar el toggle)
   File size limit: 10 MB
   Allowed MIME types: application/pdf
   ```

3. Haz clic en **"Create bucket"**

---

### **3. Configurar Políticas RLS**

Una vez creado el bucket:

1. Haz clic en el bucket **"cotizaciones"**
2. Ve a la pestaña **"Policies"**
3. Haz clic en **"New Policy"**

#### **Política 1: Permitir Inserción**
```
Policy name: Permitir inserción pública de PDFs
Allowed operation: INSERT
Policy definition: 
  FOR: public
  USING expression: true
  WITH CHECK expression: bucket_id = 'cotizaciones'
```

#### **Política 2: Permitir Lectura**
```
Policy name: Permitir lectura pública de PDFs
Allowed operation: SELECT
Policy definition:
  FOR: public
  USING expression: bucket_id = 'cotizaciones'
```

#### **Política 3: Actualización (service_role)**
```
Policy name: Actualización por service_role
Allowed operation: UPDATE
Target roles: service_role
USING expression: bucket_id = 'cotizaciones'
```

#### **Política 4: Eliminación (service_role)**
```
Policy name: Eliminación por service_role
Allowed operation: DELETE
Target roles: service_role
USING expression: bucket_id = 'cotizaciones'
```

---

### **4. Verificar**

Después de crear todo, ejecuta:
```bash
node scripts/verify-storage.js
```

Debe mostrar:
```
✅ Bucket "cotizaciones" existe
✅ Permisos de lectura OK
✅ Permisos de escritura OK
```

---

## 🚨 **SI SIGUES TENIENDO PROBLEMAS**

El problema puede ser que Supabase necesita permisos especiales para crear buckets con SQL. En ese caso, el método del Dashboard es la solución más confiable.

Después de crear el bucket manualmente, el sistema funcionará perfectamente.

