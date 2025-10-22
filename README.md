# FullColor Cotizador 🎨

Sistema de cotización profesional para FullColor - Servicios Gráficos Digitales

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sanchezx1s-projects/v0-fullcolorquotation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/MvzwgE0pmWy)

## 📋 Descripción

Sistema integral de cotización que permite:
- 📝 Crear cotizaciones profesionales
- 📄 Generar PDFs automáticamente
- 📧 Enviar emails automáticos con cotizaciones
- 💾 Almacenamiento en Supabase
- 🎯 Seguimiento de leads y conversiones

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/v0-fullcolor-cotizador-2.git
cd v0-fullcolor-cotizador-2
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Desplegar Edge Functions

**⚠️ IMPORTANTE:** Las Edge Functions deben estar desplegadas para que el envío de emails funcione.

#### Opción A: Script Automático (Recomendado)

**Linux/Mac:**
```bash
chmod +x deploy-email-functions.sh
./deploy-email-functions.sh
```

**Windows PowerShell:**
```powershell
.\deploy-email-functions.ps1
```

#### Opción B: Deployment Manual

```bash
# 1. Autenticarse con Supabase
supabase login

# 2. Configurar secrets
supabase secrets set RESEND_API_KEY=re_UgHhX1vd_BwRBwUeGLE9DtskowvHRedSZ
supabase secrets set RESEND_FROM_EMAIL=carlosmatiasf12@gmail.com
supabase secrets set RESEND_FROM_NAME="FullColor - Cotizaciones"

# 3. Desplegar funciones
supabase functions deploy send-email --no-verify-jwt
supabase functions deploy generate-pdf --no-verify-jwt

# 4. Verificar deployment
supabase functions list
```

📖 **Para más detalles, ver:** [`DEPLOYMENT_INSTRUCTIONS.md`](DEPLOYMENT_INSTRUCTIONS.md:1)

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
v0-fullcolor-cotizador-2/
├── app/                        # Páginas Next.js
│   ├── cotizador/             # Página del cotizador
│   ├── catalogo/              # Catálogo de productos
│   └── confirmacion/          # Página de confirmación
├── components/                 # Componentes React
│   ├── pdf-generator.tsx      # Generador de PDFs
│   ├── email-sender.tsx       # Componente de envío de emails
│   └── ui/                    # Componentes UI
├── src/
│   ├── services/              # Servicios
│   │   ├── supabaseClient.ts  # Cliente de Supabase
│   │   ├── emailService.ts    # Servicio de emails
│   │   └── pdfGenerationService.ts
│   └── hooks/                 # React hooks
├── supabase/
│   └── functions/             # Edge Functions
│       ├── send-email/        # Función de envío de emails
│       └── generate-pdf/      # Función de generación de PDFs
├── database/                   # Scripts SQL
├── deploy-email-functions.sh  # Script de deployment (Bash)
├── deploy-email-functions.ps1 # Script de deployment (PowerShell)
└── DEPLOYMENT_INSTRUCTIONS.md # Instrucciones detalladas
```

## 🔧 Tecnologías

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Edge Functions, Storage)
- **Email:** Resend API
- **PDF:** jsPDF
- **Deployment:** Vercel

## 📧 Sistema de Emails

El sistema de emails está completamente automatizado:

1. Usuario genera cotización → Se guarda en BD
2. Se genera PDF → Se sube a Supabase Storage
3. **Automáticamente** se envía email al cliente con PDF adjunto
4. Se registran todos los eventos en tabla `eventos`

### Flujo de Envío

```
[Cotización] → [generate-pdf] → [send-email] → [Cliente recibe email]
                    ↓                 ↓
                [Storage]         [Eventos]
```

### Verificar Logs

```bash
# Ver logs de send-email en tiempo real
supabase functions logs send-email --tail

# Ver logs de generate-pdf en tiempo real
supabase functions logs generate-pdf --tail
```

## 🐛 Troubleshooting

### Error: "FunctionsFetchError: Failed to send a request to the Edge Function"

**Causa:** Las Edge Functions no están desplegadas.

**Solución:**
```bash
./deploy-email-functions.sh  # En Linux/Mac
# o
.\deploy-email-functions.ps1  # En Windows
```

### Error: "Resend API key is invalid"

**Causa:** El API key de Resend es incorrecto o expiró.

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
2. Verifica el email configurado
3. O usa un dominio propio verificado

### Ver más soluciones

📖 Revisa [`DEPLOYMENT_INSTRUCTIONS.md`](DEPLOYMENT_INSTRUCTIONS.md:1) para troubleshooting completo.

## 📚 Documentación Adicional

- [`DEPLOYMENT_INSTRUCTIONS.md`](DEPLOYMENT_INSTRUCTIONS.md:1) - Instrucciones detalladas de deployment
- [`EMAIL_SETUP_GUIDE.md`](EMAIL_SETUP_GUIDE.md:1) - Guía de configuración de emails
- [`EMAIL_IMPLEMENTATION_SUMMARY.md`](EMAIL_IMPLEMENTATION_SUMMARY.md:1) - Resumen de implementación
- [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md:1) - Configuración de Supabase
- [`PDF_SYSTEM_README.md`](PDF_SYSTEM_README.md:1) - Sistema de generación de PDFs

## 🔐 Variables de Entorno

### Aplicación (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Edge Functions (Secrets en Supabase)

Configurados con Supabase CLI:
- `RESEND_API_KEY` - API key de Resend
- `RESEND_FROM_EMAIL` - Email remitente verificado
- `RESEND_FROM_NAME` - Nombre del remitente

## 🚢 Deployment en Producción

### Vercel (Frontend)

El proyecto está configurado para deployment automático en Vercel:

1. Push a la rama principal
2. Vercel despliega automáticamente
3. Configura las variables de entorno en Vercel Dashboard

### Supabase (Backend)

```bash
# Desplegar todas las funciones
./deploy-email-functions.sh
```

## 📊 Base de Datos

### Tablas Principales

- `productos` - Catálogo de productos
- `precios_escalonados` - Precios por volumen
- `leads` - Información de clientes
- `cotizaciones` - Cotizaciones generadas
- `items_cotizacion` - Ítems de cada cotización
- `eventos` - Log de eventos (PDFs, emails, etc.)

### Migraciones

Las migraciones SQL están en [`database/`](database/:1):

```bash
# Aplicar migración
supabase db push
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y propiedad de FullColor.

## 📞 Soporte

Para soporte técnico:
- Email: carlosmatiasf12@gmail.com
- Documentación: Ver archivos `*.md` en la raíz del proyecto

## 🎯 Roadmap

- [x] Sistema de cotización básico
- [x] Generación automática de PDFs
- [x] Envío automático de emails
- [x] Catálogo de productos
- [ ] Panel de administración
- [ ] Seguimiento de conversiones
- [ ] Reportes y analytics
- [ ] Integración con WhatsApp
- [ ] Multi-idioma

## ✨ Características

### Cotizador
- ✅ Selección de productos del catálogo
- ✅ Cálculo automático de precios por volumen
- ✅ Previsualización en tiempo real
- ✅ Validación de formularios

### Generación de PDFs
- ✅ Diseño profesional con marca FullColor
- ✅ Logo y colores corporativos
- ✅ Desglose detallado de productos
- ✅ Cálculo de IVA y totales
- ✅ Almacenamiento en Supabase Storage

### Sistema de Emails
- ✅ Envío automático al generar PDF
- ✅ Template profesional HTML
- ✅ PDF adjunto en el email
- ✅ Enlace de descarga directo
- ✅ Manejo robusto de errores

### Gestión de Datos
- ✅ Almacenamiento seguro en Supabase
- ✅ Seguimiento de eventos
- ✅ Historial de cotizaciones
- ✅ Información de leads

---

**Desarrollado con ❤️ para FullColor**