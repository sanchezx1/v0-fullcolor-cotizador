# FullColor Cotizador

## Estado del proyecto
Plataforma profesional de cotización para servicios gráficos digitales operativa en producción. Incluye autenticación con Supabase, CRUD administrativo de productos y escalas, cotizador público, generación automática de PDFs, envío de emails y notificaciones, y flujos de QA con pruebas unitarias, integración y E2E.

## Arquitectura
- **Frontend**: Next.js 15 + React 19 + TypeScript, con Tailwind CSS v4 y shadcn/ui para la capa visual.
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions) como fuente única de verdad; Edge Functions generan PDFs y envían correos.
- **Pruebas**: Jest cubre unitarios e integraciones, Playwright ejecuta escenarios E2E y verificaciones de accesibilidad.
- **Despliegue**: Vercel para el frontend, Supabase para funciones y base de datos; CI ejecuta el conjunto completo de tests antes de fusionar.

## Estructura principal
- `app/`: páginas Next.js (cotizador, catálogo, confirmación) y layouts controlados por la convención de rutas.
- `components/`: componentes reutilizables y `components/ui/` para primitives estilizadas con Tailwind/shadcn.
- `src/services`: clientes de Supabase, lógica de pricing, email y generación de PDFs; `src/lib` agrupa utilidades puras; `src/hooks` contiene hooks compartidos.
- `supabase/functions/`, `database/`, `scripts/`: Edge Functions, migraciones SQL y automatizaciones.
- `public/`, `docs/`, `tests/`, `e2e/`: activos estáticos, documentación adicional y suites de pruebas (unitarias, integración y E2E).

## Requisitos
- Node.js 20+ (compatible con la cadena de herramientas actual).
- Variables de entorno (véase `.env.example`).
- `npx playwright install` para ejecutar los tests E2E la primera vez.

## Instalación y desarrollo rápido
1. Instalar dependencias: `npm install --legacy-peer-deps`.
2. Configurar variables copiando `.env.example` a `.env.local` y completando las claves de Supabase y otros servicios (SMTP, RESEND).
3. Levantar entorno local: `npm run dev`.
4. Construir para producción: `npm run build` y `npm start`.

## Variables de entorno clave
- Cliente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Servidor/Edge: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`, `RESEND_API_KEY`.
- Guarda las claves sensibles en Vercel/Supabase Secrets; nunca las incluyas en el repositorio.

## Comandos de mantenimiento
- `npm run lint`: ESLint para todo el proyecto.
- `npm run test`: Jest base, útil para validar cambios rápidos.
- `npm run test:unit`, `npm run test:integration`: suites segmentadas de Jest.
- `npm run test:coverage`: genera el reporte de cobertura.
- `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:headed`: pruebas Playwright completas.
- `npm run test:accessibility`: auditoría WCAG 2.1 AA con Playwright y Axe.
- `npm run test:all`: combina Jest + Playwright; útil antes de mandar un PR grande.
- `run-all-qa.sh` / `run-all-qa.ps1`: scripts para orquestar todos los chequeos en pipelines internos.

## Testing
Mantener 73+ pruebas pasando, incluyendo unitarias, integraciones y E2E documentadas en `tests/` y `e2e/`. Ejecútalas localmente después de cambios significativos en pricing, cotizaciones o Edge Functions y adjunta los reportes al PR cuando el alcance lo amerite.

## Contribuir
Lee `AGENTS.md` para guías detalladas sobre estructura, estilo, pruebas y flujos de trabajo. Utiliza Conventional Commits y mantén los PR pequeños, con pasos de prueba claros y checklist de lint/tests. Documenta cualquier cambio de infraestructura o storage en `DEPLOYMENT_INSTRUCTIONS.md` y sincroniza los scripts SQL dentro de `database/`.

## Documentación adicional
- `TESTING_README.md`: guía completa de testing.
- `RULES.md`: reglas operativas (pila tech, datos, errores, calidad).
- `DEPLOYMENT_INSTRUCTIONS.md`: despliegues, secrets y procedimientos de troubleshooting.
- `START_HERE.md`: contexto rápido para nuevos colaboradores.
