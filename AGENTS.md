# Repository Guidelines

## Estructura del Proyecto y Organización de Módulos
- `app/` gobierna rutas (cotizador, catalogo, confirmacion) y layouts; respeta nombres para no romper el router.
- `components/` reúne UI compuesta y `components/ui/` los primitivos shadcn/Tailwind; prioriza extenderlos antes de crear variantes.
- Negocio y datos viven en `src/services` y utilidades puras en `src/lib`; hooks van en `src/hooks`, mientras `supabase/functions`, `database/`, `scripts/` y docs raíz describen backend y operaciones.

## Comandos de Build, Test y Desarrollo
- Usa `npm install --legacy-peer-deps` + `npx playwright install` (una vez) para preparar el entorno.
- `npm run dev` sirve desarrollo, `npm run build && npm start` validan producción y `npm run lint` garantiza estilo antes del PR.
- Pruebas: Jest (`npm run test`, `test:unit`, `test:integration`, `test:coverage`, `test:all`) y Playwright (`npm run test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:accessibility`, `run-all-qa.*`).

## Estilo de Código y Convenciones de Nombres
- Stack fijo: Next.js 15, React 19, TypeScript, Tailwind v4; queda prohibido duplicar datos fuera de Supabase o migrar routers.
- Indentación 2 espacios, comillas dobles, componentes en PascalCase, hooks/helpers camelCase y servicios con nombres explícitos (`supabaseClient`, `pricing`, `quotes`).
- IO centralizado en `src/services`, helpers en `src/lib`, comentarios solo para justificar decisiones y preferencia por `components/ui` + sonner para UI/feedback.

## Guía de Pruebas
- Los tests Jest viven en `tests/unit` y `tests/integration`; mantén ≥73 casos verdes y nombra archivos `*.test.ts(x)`.
- Playwright cubre regresiones, headed/UI y accesibilidad WCAG 2.1 AA (`npm run test:e2e`, `test:e2e:ui`, `test:accessibility --grep @a11y`).
- Ejecuta `npm run test:coverage` al tocar pricing, cotizaciones o Edge Functions y apóyate en `run-all-qa.sh|ps1` antes de mergear.

## Commits y Pull Requests
- Emplea Conventional Commits y cambios atómicos; evita mezclar features o refactors en una misma rama.
- Cada PR necesita resumen, lista de cambios, pasos de prueba, riesgos, checklist (lint/tests) y relación con issues.
- Adjunta capturas para cambios de UI, declara ajustes de variables de entorno/migraciones y solicita revisión solo tras `npm run test:all`.

## Entorno, Seguridad y Configuración
- Crea `.env.local` desde `.env.example` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; secretos de servidor (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`, `RESEND_API_KEY`) quedan en Vercel/Supabase.
- Rota credenciales con `supabase secrets set RESEND_API_KEY=<key>` y jamás expongas el Service Role en el cliente; las escrituras críticas van vía server actions o Edge Functions respetando RLS.
- Documenta cualquier cambio de infraestructura o storage en README/`DEPLOYMENT_INSTRUCTIONS.md` y comparte scripts SQL actualizados en `database/`.
