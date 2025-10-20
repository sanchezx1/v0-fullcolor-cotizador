# Sistema de Generación de PDF

## 📋 Resumen

El sistema de generación de PDF está completamente integrado y lee **datos frescos desde Supabase** como única fuente de verdad. No usa valores hardcodeados ni cachés locales.

## 🏗️ Arquitectura

### 1. **Plantilla HTML** (`templates/cotizacion.html`)
- Plantilla con placeholders `{{...}}`
- Estilos CSS integrados para PDF
- Diseño responsive y profesional

### 2. **Servicio PDF** (`src/services/pdfQuoteService.ts`)
- Lee datos frescos desde Supabase
- Calcula totales en tiempo real
- Reemplaza placeholders con datos reales

### 3. **Edge Function** (`supabase/functions/generate-pdf/index.ts`)
- Genera PDF usando la plantilla
- Sube PDF a Supabase Storage
- Actualiza estado de la cotización

### 4. **Servicio Frontend** (`src/services/pdfGenerationService.ts`)
- Llama a la Edge Function
- Maneja errores y estados
- Proporciona URLs de descarga

### 5. **Componente UI** (`components/pdf-generator.tsx`)
- Botón para generar PDF
- Estados de carga y error
- Descarga directa del PDF

## 🔄 Flujo de Datos

```
1. Usuario solicita PDF
   ↓
2. Frontend llama a Edge Function
   ↓
3. Edge Function lee datos frescos desde Supabase
   ↓
4. Se carga plantilla HTML
   ↓
5. Se reemplazan placeholders con datos reales
   ↓
6. Se genera PDF (simulado por ahora)
   ↓
7. Se sube PDF a Supabase Storage
   ↓
8. Se devuelve URL pública del PDF
```

## 📊 Datos Leídos desde Supabase

### Tabla `cotizaciones`
- ID, fecha, estado, notas
- Relación con `leads`

### Tabla `leads`
- Nombre, email, teléfono
- RUC/Cédula, ciudad
- Empresa, notas

### Tabla `items_cotizacion`
- Cantidad, precio unitario
- Relación con `productos`

### Tabla `productos`
- Nombre, categoría
- Imagen URL

### Tabla `precios_escalonados`
- Escalas de precios por producto
- Cantidades mínimas y precios

## 🎯 Placeholders de la Plantilla

| Placeholder | Descripción | Fuente |
|-------------|-------------|---------|
| `{{EMPRESA_LOGO_URL}}` | Logo de la empresa | Configuración |
| `{{EMPRESA_NOMBRE}}` | Nombre de la empresa | Configuración |
| `{{COTIZACION_NUMERO}}` | Número de cotización | `cotizaciones.id` |
| `{{COTIZACION_FECHA}}` | Fecha de cotización | `cotizaciones.created_at` |
| `{{CLIENTE_NOMBRE}}` | Nombre del cliente | `leads.nombre` |
| `{{CLIENTE_DOCUMENTO}}` | RUC/Cédula | `leads.ruc_cedula` |
| `{{CLIENTE_DIRECCION}}` | Ciudad | `leads.ciudad` |
| `{{CLIENTE_TELEFONO}}` | Teléfono | `leads.telefono` |
| `{{CLIENTE_EMAIL}}` | Email | `leads.email` |
| `{{ITEMS_ROWS}}` | Filas de productos | `items_cotizacion` + `productos` |
| `{{RESUMEN_SUBTOTAL}}` | Subtotal | Calculado |
| `{{RESUMEN_IVA15}}` | IVA 15% | Calculado |
| `{{RESUMEN_TOTAL}}` | Total | Calculado |
| `{{OBSERVACIONES}}` | Observaciones | `leads.notas` o `cotizaciones.notas` |

## 🚀 Uso

### En el Hook `useQuoteBuilder`
```typescript
// Generar PDF automáticamente después de crear cotización
const pdfResult = await pdfGenerationService.generateQuotePDF(cotizacion.id)
```

### En Componentes
```typescript
import PDFGenerator from "@/components/pdf-generator"

<PDFGenerator 
  quoteId={cotizacionId}
  quoteNumber={numeroCotizacion}
/>
```

### Servicio Directo
```typescript
import { pdfGenerationService } from "@/src/services/pdfGenerationService"

// Generar PDF
const result = await pdfGenerationService.generateQuotePDF(quoteId)

// Obtener URL existente
const url = await pdfGenerationService.getExistingPDFUrl(quoteId)
```

## ⚙️ Configuración

### Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Supabase Storage
- Bucket: `cotizaciones`
- Política: Permitir lectura pública de PDFs
- Estructura: `cotizacion-{id}-{timestamp}.pdf`

## 🔧 Implementación Pendiente

### 1. **Generación Real de PDF**
```typescript
// En Edge Function - reemplazar función simulada
async function generatePDF(html: string): Promise<Uint8Array> {
  // Implementar con Puppeteer o similar
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html)
  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()
  return pdf
}
```

### 2. **Edge Function de Email**
```typescript
// supabase/functions/send-email/index.ts
// Enviar PDF por email al cliente
```

### 3. **Configuración de Empresa**
```sql
-- Tabla para configuración de empresa
CREATE TABLE empresa_config (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  logo_url VARCHAR(500)
);
```

## ✅ Características Implementadas

- ✅ Plantilla HTML con placeholders
- ✅ Servicio que lee datos frescos desde Supabase
- ✅ Edge Function para generar PDF
- ✅ Servicio frontend para llamar Edge Function
- ✅ Componente UI para generar/descargar PDF
- ✅ Integración en `useQuoteBuilder`
- ✅ Manejo de errores y estados
- ✅ Subida a Supabase Storage
- ✅ Actualización de estado de cotización

## 🎯 Próximos Pasos

1. **Implementar generación real de PDF** con Puppeteer
2. **Crear Edge Function de email** para enviar PDFs
3. **Configurar bucket de Storage** en Supabase
4. **Probar flujo completo** con datos reales
5. **Optimizar plantilla** según feedback
