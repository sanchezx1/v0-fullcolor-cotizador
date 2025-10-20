# Plan de Limpieza: Eliminación de Feature Email/Resend + Arquitectura Limpia

**Fecha:** 2025-10-20  
**Objetivo:** Dejar la arquitectura limpia y funcional, eliminando completamente el feature inconcluso de envío de cotizaciones por email con Resend.

**Principios:**
- ✅ Supabase es la única fuente de verdad
- ✅ No romper nada que ya funciona (PDF, WhatsApp, cotizaciones)
- ✅ Mantener solo archivos esenciales
- ✅ Archivar lo que pueda ser útil históricamente
- ✅ Borrar desecho y duplicados

---

## 📋 FASE 1: ARCHIVOS DE DOCUMENTACIÓN

### 1.1 Archivos a MANTENER (esenciales)
```
✅ README.md - Documentación principal del proyecto
✅ RULES.md - Reglas del proyecto (referenciado por contexto)
✅ CONTEXT.md - Contexto del proyecto (referenciado por reglas)
```

### 1.2 Archivos a ARCHIVAR en `docs/archive/`
Estos tienen valor histórico pero no son necesarios en raíz:
```
📦 ANALISIS_PROYECTO.md
📦 CHECKLIST_FINAL.md
📦 PDF_DESIGN_UPDATED.md
📦 PDF_SYSTEM_README.md
📦 REFACTOR_README.md
📦 TASKS.md
📦 SUPABASE_SETUP.md
📦 SETUP_STORAGE_INSTRUCCIONES.md
📦 DEPLOYMENT_INSTRUCTIONS.md (general, no email)
📦 DEPLOYMENT_SUCCESS.md (general, no email)
📦 CREAR_BUCKET_DASHBOARD.md
```

### 1.3 Archivos a ELIMINAR (relacionados con email/resend)
```
❌ EDGE_FUNCTION_SEND_EMAIL_SIMPLIFICADA.md
❌ EMAIL_IMPLEMENTATION_SUMMARY.md
❌ EMAIL_SETUP_GUIDE.md
❌ EMAIL_SYSTEM_PLAN.md
❌ QUICK_FIX_RESEND_EMAIL.md
❌ README_DEPLOY_EMAIL.md
❌ SOLUCION_COMPLETA_EMAIL.md
❌ SOLUCION_ERROR_EMAIL.md
❌ EMPEZAR_AQUI.md (parece guía temporal)
❌ RESUMEN_CORRECCIONES.md (temporal)
```

### 1.4 Archivos a ELIMINAR (otros temporales)
```
❌ tarea-copilotCLI.txt (nota temporal)
```

---

## 📋 FASE 2: SCRIPTS Y UTILIDADES

### 2.1 Scripts a ELIMINAR (email/resend)
```
❌ deploy-email-fix.ps1
❌ deploy-email-functions.ps1
❌ deploy-email-functions.sh
❌ test-email-function.ps1
❌ test-send-email.js
```

### 2.2 Scripts a ELIMINAR (setup env - no usados en build/ci)
```
❌ setup-env.ps1
❌ setup-env.sh
```

### 2.3 Scripts a MANTENER en `scripts/`
```
✅ scripts/test-supabase.js (referenciado en package.json)
✅ scripts/test-pricing-simple.js
✅ scripts/test-pricing.js
✅ scripts/test-supabase-browser.js
✅ scripts/diagnose-edge-functions.js
✅ scripts/diagnose-supabase.js
✅ scripts/diagnostico-completo.js
✅ scripts/consultar-buckets-sql.js
✅ scripts/fix-bucket-registration.js
✅ scripts/verify-storage.js
```

### 2.4 Script a ELIMINAR del root
```
❌ test-supabase-connection.js (duplicado, ya está en scripts/)
```

---

## 📋 FASE 3: BASE DE DATOS (SQL)

### 3.1 Archivos SQL ESENCIALES a MANTENER en `database/`
```
✅ schema.sql - Schema principal de BD
✅ seed.sql - Datos iniciales
✅ rls_policies.sql - Políticas RLS
✅ setup_storage.sql - Setup de storage (parece el oficial)
✅ migration_add_lead_fields.sql - Migración aplicada
```

### 3.2 Archivos SQL a ARCHIVAR en `database/archive/`
Usados para diagnóstico/fixes pero ya no necesarios en runtime:
```
📦 diagnosticar_storage.sql
📦 fix_storage.sql
📦 recreate_storage_clean.sql
📦 crear_storage_simple.sql
📦 REGISTRAR_BUCKET.sql
📦 verify_and_fix_rls.sql
```

---

## 📋 FASE 4: EDGE FUNCTIONS (SUPABASE)

### 4.1 Edge Functions a ELIMINAR
```
❌ supabase/functions/send-email/ (completo)
   ❌ supabase/functions/send-email/index.ts
   ❌ supabase/functions/send-email/email-template.ts
```

### 4.2 Edge Functions a MANTENER
```
✅ supabase/functions/generate-pdf/ (en uso)
✅ supabase/functions/generate-pdf-real/ (backup o versión alternativa)
✅ supabase/functions/generate-pdf-simple/ (versión simple)
✅ supabase/functions/config.toml
✅ supabase/functions/import_map.json
```

**Nota:** Revisar si `generate-pdf-real` y `generate-pdf-simple` son necesarios o solo `generate-pdf`.

---

## 📋 FASE 5: CÓDIGO FUENTE (TypeScript/React)

### 5.1 Archivos a ELIMINAR

#### Servicios
```
❌ src/services/emailService.ts (completo)
```

#### Componentes
```
❌ components/email-sender.tsx (completo)
```

### 5.2 Archivos a MODIFICAR

#### components/pdf-generator.tsx
**Cambios:**
- Eliminar import de `EmailSender`
- Eliminar import de `emailService`
- Eliminar estados relacionados: `emailSent`, `emailRecipient`, `showEmailSender`
- Eliminar sección de UI del botón "Reenviar a otro email" (líneas ~182-202)
- Eliminar función `handleEmailSent`
- Mantener toda la funcionalidad de PDF intacta

#### src/hooks/useQuoteBuilder.ts
**Cambios:**
- MANTENER campos de email en el contactInfo (son parte del lead, no del feature de envío)
- MANTENER validación de email (es dato del lead)
- NO tocar nada más

**Justificación:** El email del lead es un dato necesario para el registro del cliente, independiente del feature de envío por email.

---

## 📋 FASE 6: VARIABLES DE ENTORNO

### 6.1 Variables a ELIMINAR de `.env.local`
```
❌ RESEND_API_KEY=re_ajMDbyXa_CVtZx4P16C9tPuJ9sToK731z
❌ RESEND_FROM_EMAIL=carlosmatiasf12@gmail.com
❌ RESEND_FROM_NAME=FullColor - Cotizaciones
```

### 6.2 Variables a MANTENER
```
✅ NEXT_PUBLIC_COMPANY_EMAIL=info@fullcolor.com (informativo para UI)
✅ NEXT_PUBLIC_SUPABASE_URL=...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=...
✅ (todas las de Supabase)
```

### 6.3 Crear/Actualizar `.env.example`
Documentar todas las variables necesarias sin valores reales.

---

## 📋 FASE 7: PACKAGE.JSON

### 7.1 Dependencias a VERIFICAR
```
✅ NO hay dependencia "resend" en package.json (ya confirmado)
✅ Todas las dependencias actuales son necesarias
```

### 7.2 Scripts
```
✅ Mantener todos los scripts actuales (build, dev, lint, start, test:supabase)
```

---

## 📋 FASE 8: ESTRUCTURA FINAL

### 8.1 Crear directorio de archivo
```
📁 docs/
   📁 archive/
      📄 (archivos md históricos)
      
📁 database/
   📁 archive/
      📄 (sql de diagnóstico/fixes)
```

### 8.2 Árbol Final Esperado (simplificado)
```
v0-fullcolor-cotizador-2/
├── .cursor/
├── .next/
├── app/                      ✅ Sin cambios
├── components/
│   ├── email-sender.tsx     ❌ ELIMINAR
│   ├── pdf-generator.tsx    ✏️ MODIFICAR (quitar email UI)
│   └── ui/                  ✅ Sin cambios
├── database/
│   ├── archive/             📦 NUEVO (SQLs históricos)
│   ├── schema.sql           ✅ MANTENER
│   ├── seed.sql             ✅ MANTENER
│   ├── rls_policies.sql     ✅ MANTENER
│   ├── setup_storage.sql    ✅ MANTENER
│   └── migration_add_lead_fields.sql ✅ MANTENER
├── docs/
│   └── archive/             📦 NUEVO (MDs históricos)
├── public/                  ✅ Sin cambios
├── scripts/                 ✅ MANTENER todos
├── src/
│   ├── hooks/               ✅ Sin cambios (email es dato del lead)
│   ├── lib/                 ✅ Sin cambios
│   └── services/
│       ├── emailService.ts  ❌ ELIMINAR
│       └── ...              ✅ MANTENER resto
├── supabase/
│   └── functions/
│       ├── send-email/      ❌ ELIMINAR completo
│       ├── generate-pdf/    ✅ MANTENER
│       ├── generate-pdf-real/ ✅ REVISAR si es necesario
│       └── generate-pdf-simple/ ✅ REVISAR si es necesario
├── .env.local               ✏️ MODIFICAR (quitar vars de email)
├── .gitignore               ✅ Sin cambios
├── package.json             ✅ Sin cambios
├── README.md                ✅ MANTENER
├── RULES.md                 ✅ MANTENER
├── CONTEXT.md               ✅ MANTENER
└── (otros configs)          ✅ Sin cambios
```

---

## 🔄 FASE 9: SECUENCIA DE EJECUCIÓN

### Paso 1: Crear rama
```bash
git checkout -b chore/cleanup-resend-removal
```

### Paso 2: Crear directorios de archivo
```bash
mkdir -p docs/archive
mkdir -p database/archive
```

### Paso 3: Archivar documentación
```bash
# Mover MDs históricos a docs/archive/
git mv ANALISIS_PROYECTO.md docs/archive/
git mv CHECKLIST_FINAL.md docs/archive/
# ... (ver lista 1.2)
```

### Paso 4: Eliminar documentación de email
```bash
git rm EDGE_FUNCTION_SEND_EMAIL_SIMPLIFICADA.md
git rm EMAIL_IMPLEMENTATION_SUMMARY.md
# ... (ver lista 1.3)
```

### Paso 5: Eliminar scripts de email
```bash
git rm deploy-email-fix.ps1
git rm deploy-email-functions.ps1
git rm deploy-email-functions.sh
git rm test-email-function.ps1
git rm test-send-email.js
git rm setup-env.ps1
git rm setup-env.sh
git rm test-supabase-connection.js
```

### Paso 6: Archivar SQLs diagnóstico
```bash
git mv database/diagnosticar_storage.sql database/archive/
git mv database/fix_storage.sql database/archive/
# ... (ver lista 3.2)
```

### Paso 7: Eliminar Edge Function de email
```bash
git rm -r supabase/functions/send-email/
```

### Paso 8: Eliminar código fuente de email
```bash
git rm src/services/emailService.ts
git rm components/email-sender.tsx
```

### Paso 9: Modificar pdf-generator.tsx
- Quitar imports de EmailSender y emailService
- Quitar estados y funciones de email
- Quitar UI del botón de reenvío

### Paso 10: Limpiar variables de entorno
- Editar `.env.local` y quitar variables RESEND_*
- Crear/actualizar `.env.example`

### Paso 11: Verificar build
```bash
npm install
npm run build
```

### Paso 12: Commits atómicos
```bash
git commit -m "chore(docs): archive historical documentation"
git commit -m "chore(docs): remove email/resend documentation"
git commit -m "chore(scripts): remove email deployment and setup scripts"
git commit -m "chore(database): archive diagnostic SQL files"
git commit -m "refactor(edge-functions): remove send-email function"
git commit -m "refactor(services): remove emailService"
git commit -m "refactor(components): remove email-sender component"
git commit -m "refactor(components): remove email UI from pdf-generator"
git commit -m "chore(env): remove Resend environment variables"
git commit -m "chore: verify build passes after cleanup"
```

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

### Build y Funcionalidad
- [ ] `npm install` ejecuta sin errores
- [ ] `npm run build` ejecuta sin errores
- [ ] No hay imports huérfanos (errores de TypeScript)
- [ ] No hay referencias a `resend`, `send-email`, `emailService`, `EmailSender`

### Funcionalidad Preservada
- [ ] Generación de PDF funciona correctamente
- [ ] Compartir por WhatsApp funciona
- [ ] Creación de cotizaciones funciona
- [ ] Registro de leads funciona
- [ ] Email del lead se captura y guarda (pero no se envía)

### Limpieza
- [ ] No hay archivos `.md` de email/resend en raíz
- [ ] No hay scripts de deploy/test de email
- [ ] No hay variables RESEND_* en `.env.local`
- [ ] Edge function `send-email` eliminada
- [ ] Servicios y componentes de email eliminados
- [ ] Archivos históricos archivados en `docs/archive/` y `database/archive/`

### Git
- [ ] Commits pequeños y descriptivos siguiendo Conventional Commits
- [ ] Todos los archivos staged correctamente
- [ ] Branch `chore/cleanup-resend-removal` creada
- [ ] Listo para crear PR hacia `main`

---

## 📊 RESUMEN DE IMPACTO

### Archivos Eliminados (total estimado: ~25)
- 10 archivos .md de email/resend/temporales
- 7 scripts .ps1/.sh/.js de email/setup
- 1 carpeta edge function completa (send-email/)
- 1 servicio TypeScript (emailService.ts)
- 1 componente React (email-sender.tsx)
- Modificaciones en 2 archivos (.env.local, pdf-generator.tsx)

### Archivos Archivados (total estimado: ~17)
- 11 archivos .md históricos → docs/archive/
- 6 archivos .sql de diagnóstico → database/archive/

### Archivos Mantenidos (esenciales)
- 3 .md principales (README, RULES, CONTEXT)
- 5 .sql esenciales (schema, seed, rls, storage, migration)
- ~10 scripts de utilidad
- 3 edge functions de PDF
- Todos los componentes UI principales
- Todos los servicios excepto emailService

---

## 🚀 PRÓXIMOS PASOS (POST-CLEANUP)

1. **Crear PR:** `chore/cleanup-resend-removal` → `main`
2. **Documentar en PR:**
   - Resumen de archivos eliminados/archivados
   - Confirmación de build OK
   - Screenshots de funcionalidad preservada (opcional)
3. **Revisar y mergear**
4. **Opcional:** Limpiar edge functions duplicadas si `generate-pdf-real` y `-simple` no son necesarias

---

**Fin del Plan**
