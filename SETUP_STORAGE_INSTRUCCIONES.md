# 🚀 INSTRUCCIONES PARA CONFIGURAR STORAGE DE PDFS

---

## ✅ **LO QUE VAMOS A HACER**

Vamos a **recrear completamente** el Storage de Supabase para que esté limpio y bien configurado.

**Esto va a:**
- ❌ Borrar los 34 PDFs existentes (confirmado por el usuario)
- ✅ Eliminar todas las políticas viejas
- ✅ Crear el bucket limpio desde cero
- ✅ Configurar permisos correctos
- ✅ Dejar todo listo para generar PDFs

---

## 📋 **PASOS A SEGUIR**

### **PASO 1: Abrir Supabase Dashboard** (30 segundos)

1. Ve a: https://supabase.com/dashboard/project/cxhjxponouukrnuxdhyz
2. Inicia sesión si te lo pide
3. Haz clic en **"SQL Editor"** (icono de base de datos 💾 en el menú lateral izquierdo)

---

### **PASO 2: Ejecutar el script SQL** (1 minuto)

1. En el SQL Editor, haz clic en **"New Query"** (botón verde arriba a la derecha)

2. **Copia TODO** el contenido del archivo:
   ```
   database/recreate_storage_clean.sql
   ```

3. **Pega** el SQL completo en el editor

4. Haz clic en **"RUN"** (botón verde abajo a la derecha)
   - También puedes presionar `Ctrl+Enter` (Windows) o `Cmd+Enter` (Mac)

5. **Espera 2-3 segundos** mientras se ejecuta

---

### **PASO 3: Verificar el resultado** (30 segundos)

Deberías ver **3 tablas de resultados** en la parte inferior:

#### ✅ **Resultado 1: BUCKET CREADO**
```
status              | id            | ¿Público? | Límite MB | Tipos permitidos
✅ BUCKET CREADO    | cotizaciones  | true      | 10        | {application/pdf}
```

#### ✅ **Resultado 2: POLÍTICAS CREADAS**
```
status                  | Nombre de Política                              | Tipo   | Roles
✅ POLÍTICAS CREADAS    | Cotizaciones: Permitir inserción pública        | INSERT | {public}
✅ POLÍTICAS CREADAS    | Cotizaciones: Permitir lectura pública          | SELECT | {public}
✅ POLÍTICAS CREADAS    | Cotizaciones: Actualización por service_role    | UPDATE | {service_role}
✅ POLÍTICAS CREADAS    | Cotizaciones: Eliminación por service_role      | DELETE | {service_role}
```

#### ✅ **Resultado 3: BUCKET LIMPIO**
```
status
✅ BUCKET LIMPIO (sin archivos)
```

#### ✅ **Resultado 4: MENSAJE FINAL**
```
🎉 Estado Final                      | Mensaje
✅ STORAGE RECREADO EXITOSAMENTE     | El bucket está listo para generar PDFs
```

---

### **PASO 4: Verificar desde el proyecto** (1 minuto)

Vuelve a la terminal del proyecto y ejecuta:

```bash
node scripts/verify-storage.js
```

Deberías ver:
```
✅ Bucket "cotizaciones" existe
✅ Permisos de lectura OK
✅ Permisos de escritura OK
✅ URL pública generada correctamente
✅ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!
```

---

## ❌ **SI ALGO SALE MAL**

### **Error: "permission denied for table storage.buckets"**
**Solución:** Estás usando un usuario sin permisos. Asegúrate de estar ejecutando el SQL como usuario admin en Supabase Dashboard.

### **Error: "relation storage.buckets does not exist"**
**Solución:** Tu proyecto de Supabase no tiene Storage habilitado. Contacta a soporte de Supabase o crea un nuevo proyecto.

### **El script se ejecuta pero no veo resultados**
**Solución:** Desplázate hacia abajo en el SQL Editor. Los resultados aparecen debajo del editor de código.

---

## ✅ **DESPUÉS DE ESTO**

Una vez que el Storage esté configurado correctamente, continuaremos con:

1. ✅ Decidir método de generación de PDF (jsPDF vs PDFShift)
2. ✅ Arreglar pequeño bug en el código
3. ✅ Probar flujo completo de cotización con PDF

---

## 📞 **AYUDA**

Si tienes algún problema, avísame y te ayudo a resolverlo. Puedes:
- Copiar y pegar el error que te aparezca
- Tomar una captura de pantalla
- Describir qué ves

---

**¡Vamos! Ejecuta el SQL y avísame cuando esté listo para continuar.** 🚀

