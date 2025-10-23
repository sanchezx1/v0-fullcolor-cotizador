# 🎨 FullColor Cotizador

**Sistema profesional de cotización para servicios gráficos digitales**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sanchezx1s-projects/v0-fullcolorquotation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/MvzwgE0pmWy)
[![Tests](https://img.shields.io/badge/Tests-73%20passing-brightgreen?style=for-the-badge)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)]()

## ✨ Estado Actual: PRODUCCIÓN READY

### 🎯 Funcionalidades Principales
- ✅ **Autenticación completa** - Login/logout con Supabase Auth
- ✅ **Panel administrativo** - CRUD completo de productos, precios y cotizaciones  
- ✅ **Cotizador público** - Flujo completo de cotización para clientes
- ✅ **Generación de PDFs** - Cotizaciones profesionales automáticas
- ✅ **Envío de emails** - Notificaciones automáticas via Edge Functions
- ✅ **Suite de testing** - 73+ tests unitarios, integración y E2E
- ✅ **Base de datos** - Supabase con RLS configurado
- ✅ **CI/CD** - GitHub Actions con tests automatizados

### 🏗️ Arquitectura Técnica
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Testing**: Jest + Playwright + Testing Library
- **Deployment**: Vercel + Supabase

## 🚀 Instalación y Configuración

### 1️⃣ Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/sanchezx1/v0-fullcolor-cotizador.git
cd v0-fullcolor-cotizador

# Instalar dependencias (incluye testing)
npm install --legacy-peer-deps

# Instalar navegadores para E2E tests
npx playwright install
```

### 2️⃣ Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env.local
```

Configurar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3️⃣ Ejecutar Aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

**🌐 Aplicación disponible en:** http://localhost:3000

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

## 🧪 Testing

### Comandos de Testing

```bash
# Tests unitarios (73+ tests)
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E (19 scenarios)
npm run test:e2e
npm run test:e2e:ui    # Con interfaz gráfica

# Tests de accesibilidad (WCAG 2.1 AA)
npm run test:accessibility

# Cobertura de código
npm run test:coverage

# Todos los tests
npm run test:all
```

### Verificar Setup
```bash
node scripts/test-setup.js
```

📖 **Documentación completa:** [`TESTING_README.md`](TESTING_README.md)

## 🏗️ Stack Tecnológico

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Frontend** | Next.js | 15.2.4 | Framework React |
| | React | 19 | UI Library |
| | TypeScript | 5.9.3 | Tipado estático |
| | Tailwind CSS | 4.1.15 | Styling |
| | shadcn/ui | Latest | Componentes UI |
| **Backend** | Supabase | Latest | Base de datos + Auth |
| | PostgreSQL | 15 | Base de datos |
| | Edge Functions | Latest | APIs serverless |
| **Testing** | Jest | 29.7.0 | Unit/Integration |
| | Playwright | 1.40.0 | E2E Testing |
| | Testing Library | 15.0.0 | React Testing |
| **DevOps** | Vercel | Latest | Deployment |
| | GitHub Actions | Latest | CI/CD |

## 📁 Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── admin/             # Panel administrativo
│   ├── api/               # API Routes
│   ├── catalogo/          # Catálogo público
│   ├── cotizador/         # Cotizador principal
│   └── producto/[id]/     # Detalle de producto
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   └── admin/            # Componentes del admin
├── src/
│   ├── lib/              # Utilidades y tipos
│   └── services/         # Servicios (Supabase, PDF)
├── tests/                # Suite de testing
│   ├── unit/             # Tests unitarios
│   ├── integration/      # Tests integración
│   └── setup/            # Configuración tests
├── e2e/                  # Tests E2E
│   ├── specs/            # Scenarios Playwright
│   └── fixtures/         # Datos de prueba
├── database/             # Scripts SQL
├── supabase/             # Edge Functions
└── .github/workflows/    # CI/CD Pipelines
```

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

## 🤝 Contribuir

### Flujo de Trabajo

```bash
# 1. Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... desarrollo ...

# 3. Ejecutar tests
npm run test:all

# 4. Commit y push
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request
```

### Ramas Activas

- **`main`** - Producción estable
- **`feature/redesign-frontend`** - Mejoras de UI/UX  
- **`feature/backend-optimization`** - Optimizaciones del servidor

## 📚 Documentación

| Archivo | Propósito |
|---------|-----------|
| [`TESTING_README.md`](TESTING_README.md) | Guía completa de testing |
| [`TESTING_IMPLEMENTATION_SUMMARY.md`](TESTING_IMPLEMENTATION_SUMMARY.md) | Resumen de implementación |
| [`FASES_PENDIENTES.md`](FASES_PENDIENTES.md) | Roadmap del proyecto |
| [`RULES.md`](RULES.md) | Reglas de desarrollo |

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor desarrollo
npm run build                  # Build producción
npm run start                  # Servidor producción

# Testing
npm run test:unit              # Tests unitarios
npm run test:e2e               # Tests E2E
npm run test:coverage          # Cobertura
npm run test:accessibility     # Accesibilidad

# Utilidades
node scripts/test-setup.js     # Verificar testing setup
npm run lint                   # Linter ESLint
```

## 📊 Métricas del Proyecto

- ✅ **73+ tests** pasando
- ✅ **100% TypeScript** coverage
- ✅ **WCAG 2.1 AA** compliant
- ✅ **Production ready**
- ✅ **CI/CD configurado**
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
## 📝 Licencia

**Proyecto privado** - FullColor Servicios Gráficos

## 📞 Contacto & Soporte

- **Email**: carlosmatiasf12@gmail.com
- **GitHub**: [@sanchezx1](https://github.com/sanchezx1)
- **Repositorio**: [v0-fullcolor-cotizador](https://github.com/sanchezx1/v0-fullcolor-cotizador)

---

**💡 Proyecto desarrollado con Next.js 15, React 19 y Supabase**

*Última actualización: Octubre 2025*
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