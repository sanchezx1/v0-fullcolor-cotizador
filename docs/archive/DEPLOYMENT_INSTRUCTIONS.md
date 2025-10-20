# 📧 Instrucciones de Deployment - Sistema de Emails

Esta guía te ayudará a desplegar correctamente las Edge Functions para envío de emails en tu proyecto de FullColor Cotizador.

## ⚠️ Problema Actual

El error `FunctionsFetchError: Failed to send a request to the Edge Function` indica que la Edge Function `send-email` no está desplegada o configurada correctamente en Supabase.

## 🎯 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. **Supabase CLI instalado**
   ```bash
   npm install -g supabase
   ```

2. **Cuenta de Resend** con API key activo
   - Registro: https://resend.com
   - API Keys: https://resend.com/api-keys

3. **Email verificado en Resend**
   - El email `carlosmatiasf12@gmail.com` debe estar verificado
   - O usa un dominio verificado propio

4. **Autenticación con Supabase**
   ```bash
   supabase login
   ```

## 🚀 Deployment Rápido

### Opción 1: Script Automático (Recomendado)

#### En Linux/Mac:
```bash
# Dar permisos de ejecución
chmod +x deploy-email-functions.sh

# Ejecutar script
./deploy-email-functions.sh
```

#### En Windows (PowerShell):
```powershell
# Ejecutar script
.\deploy-email-functions.ps1
```

### Opción 2: Deployment Manual

Si prefieres hacerlo paso a paso:

#### 1. Configurar Secrets de Resend

```bash
# API Key de Resend
supabase secrets set RESEND_API_KEY=re_UgHhX1vd_BwRBwUeGLE9DtskowvHRedSZ

# Email remitente (debe estar verificado en Resend)
supabase secrets set RESEND_FROM_EMAIL=carlosmatiasf12@gmail.com

# Nombre del remitente
supabase secrets set RESEND_FROM_NAME="FullColor - Cotizaciones"
```

#### 2. Desplegar Edge Functions

```bash
# Desplegar función de envío de emails
supabase functions deploy send-email --no-verify-jwt

# Desplegar función de generación de PDFs (incluye envío automático)
supabase functions deploy generate-pdf --no-verify-jwt
```

#### 3. Verificar Deployment

```bash
# Listar funciones desplegadas
supabase functions list

# Ver logs en tiempo real
supabase functions logs send-email --tail
supabase functions logs generate-pdf --tail
```

## 🔍 Verificación Post-Deployment

### 1. Verificar que las funciones están activas

```bash
supabase functions list
```

Deberías ver:
- ✅ `send-email`
- ✅ `generate-pdf`

### 2. Probar el sistema

1. Ve a tu aplicación web
2. Crea una nueva cotización
3. Genera el PDF
4. Verifica que:
   - ✅ Se genera el PDF correctamente
   - ✅ Se envía el email automáticamente
   - ✅ El cliente recibe el email con el PDF adjunto

### 3. Revisar logs si hay errores

```bash
# Ver errores de send-email
supabase functions logs send-email --tail

# Ver errores de generate-pdf
supabase functions logs generate-pdf --tail
```

## 🐛 Troubleshooting

### Error: "FunctionsFetchError"

**Causa:** La función no está desplegada o el nombre es incorrecto.

**Solución:**
```bash
supabase functions deploy send-email --no-verify-jwt
```

### Error: "Resend API key is invalid"

**Causa:** El API key de Resend es incorrecto o ha expirado.

**Solución:**
1. Ve a https://resend.com/api-keys
2. Genera un nuevo API key
3. Actualiza el secret:
```bash
supabase secrets set RESEND_API_KEY=tu_nuevo_key
```

### Error: "Email address not verified"

**Causa:** El email remitente no está verificado en Resend.

**Solución:**
1. Ve a https://resend.com/domains
2. Verifica el email `carlosmatiasf12@gmail.com`
3. O configura un dominio propio y verificalo

### Error: "Cannot find module 'resend'"

**Causa:** Las dependencias no están correctamente configuradas en la Edge Function.

**Solución:**
Verifica que [`supabase/functions/import_map.json`](supabase/functions/import_map.json:1) incluya:
```json
{
  "imports": {
    "resend": "npm:resend@3.0.0"
  }
}
```

## 📝 Variables de Entorno

### Para la Aplicación (`.env.local`)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Para Edge Functions (Secrets en Supabase)

Los secrets se configuran con el CLI (ya lo hiciste en el paso 1):

- `RESEND_API_KEY` - Tu API key de Resend
- `RESEND_FROM_EMAIL` - Email remitente verificado
- `RESEND_FROM_NAME` - Nombre que aparecerá en el email

## 🔄 Re-deployment

Si necesitas actualizar las funciones después de hacer cambios:

```bash
# Re-desplegar ambas funciones
supabase functions deploy send-email --no-verify-jwt
supabase functions deploy generate-pdf --no-verify-jwt
```

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
# Logs de send-email
supabase functions logs send-email --tail

# Logs de generate-pdf
supabase functions logs generate-pdf --tail
```

### Verificar eventos en la base de datos

```sql
-- Ver emails enviados
SELECT * FROM eventos 
WHERE tipo = 'email_enviado' 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver PDFs generados
SELECT * FROM eventos 
WHERE tipo = 'pdf_generado' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🎯 Flujo Completo

1. **Usuario genera cotización** → Datos se guardan en Supabase
2. **Se llama a `generate-pdf`** → Genera el PDF y lo sube a Storage
3. **`generate-pdf` llama automáticamente a `send-email`** → Envía el email con el PDF
4. **Cliente recibe email** → Con PDF adjunto y enlace de descarga
5. **Se registran eventos** → Tabla `eventos` para auditoría

## 📞 Soporte

Si sigues teniendo problemas después de seguir esta guía:

1. Revisa los logs con los comandos mostrados arriba
2. Verifica que todos los secrets estén configurados correctamente
3. Confirma que el email esté verificado en Resend
4. Revisa el código de las funciones en caso de errores de sintaxis

## ✅ Checklist de Deployment

- [ ] Supabase CLI instalado y autenticado
- [ ] Cuenta de Resend creada
- [ ] API key de Resend obtenido
- [ ] Email verificado en Resend
- [ ] Secrets configurados en Supabase
- [ ] `send-email` desplegado
- [ ] `generate-pdf` desplegado
- [ ] Funciones verificadas con `supabase functions list`
- [ ] Sistema probado end-to-end
- [ ] Logs revisados sin errores

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sistema de emails estará completamente funcional y los clientes recibirán automáticamente sus cotizaciones por email.