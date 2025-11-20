# tasks-auth-accounts-emails.md
Plan técnico por fases para leads, cuentas de usuario y recordatorios por correo

> IMPORTANTE (para cualquier agente):
> - Antes de tocar código o ejecutar cualquier tarea, lee `AGENTS.md`.
> - **Antes de implementar NINGUNA tarea, debes leer y entender por completo `docs/FEATURE_LEADS_AND_ACCOUNTS.md`.**  
>   Si tienes dudas sobre el flujo o el alcance, vuelve SIEMPRE a ese archivo.
> - Trabaja SIEMPRE en una sola fase/tarea a la vez.
> - Usa el MCP de **Supabase** para todo lo relacionado con la base de datos.
> - Usa el MCP de **context7** solo para consultar documentación EXTERNA ACTUALIZADA (Next.js, Supabase, shadcn/ui, buenas prácticas, etc.)

---

## Fase 0 – Arquitectura / Diseño funcional (Agente Arquitectura)

Objetivo: dejar claro el modelo y los flujos antes de tocar DB o código.

- [ ] Leer este archivo de tareas completo.
- [ ] Leer el documento funcional de este feature en `docs/` (por ejemplo `FEATURE_LEADS_AND_ACCOUNTS.md`).
- [ ] Si hace falta aclarar dudas de arquitectura o buenas prácticas de tecnologías (Next.js, Supabase, shadcn/ui, etc.), usar el MCP de **context7** para consultar documentación externa y oficial.
- [ ] Hacer un resumen corto (5–10 puntos) de:
  - cómo se relacionan leads, cuentas y cotizaciones,
  - qué rol tendrá “Mi cuenta”,
  - qué tipo de correos se enviarán.
- [ ] Definir, a nivel conceptual (sin SQL todavía):
  - qué datos mínimos necesita un lead,
  - qué datos mínimos necesita una cuenta de usuario,
  - qué necesita una cotización para mostrar bien el estado en “Mi cuenta” y en los correos.
- [ ] Documentar las decisiones al final de este archivo (sección **“Notas de arquitectura”**), sin entrar en nombres concretos de tablas/columnas.

> No avanzar a Fase 1 hasta que estos puntos estén claros y escritos.

---

## Fase 1 – Base de datos y seguridad (Agente Supabase / Security)

Objetivo: ajustar el modelo de datos y RLS para soportar leads + cuentas + cotizaciones de forma segura.

- [ ] Leer el resumen de Fase 0 en **“Notas de arquitectura”**.
- [ ] Usar el MCP de **Supabase** para:
  - inspeccionar tablas actuales de leads, cotizaciones y cualquier tabla relacionada,
  - revisar las RLS/policies actuales.
- [ ] Definir qué cambios son necesarios a nivel de estructura, por ejemplo:
  - campo para vincular lead con usuario autenticado (por ejemplo `user_id`),
  - si hace falta una tabla extra para historial de estados de cotización,
  - si hace falta una tabla para logs de emails (opcional).
- [ ] Si hay dudas sobre patrones recomendados (por ejemplo, diseño de tablas de historial o logs), usar **context7** para consultar documentación externa de Supabase / Postgres.
- [ ] Proponer cambios de RLS a nivel conceptual:
  - qué puede ver/editar un invitado,
  - qué puede ver/editar un usuario autenticado,
  - qué puede ver/editar un admin.
- [ ] Aplicar los cambios en Supabase usando el MCP, asegurándose de:
  - no romper flujos actuales,
  - no exponer datos de otros leads/usuarios.
- [ ] Dejar un resumen de los cambios de DB y RLS al final de este archivo (sección **“Notas de DB y seguridad”**).

> No avanzar a Fase 2 si las RLS no están claras o si queda alguna duda importante de seguridad.

---

## Fase 2 – Lógica de negocio / Backend (Agente Backend)

Objetivo: implementar la lógica que conecta el flujo de cotización con leads, cuentas y “Mi cuenta”.

- [ ] Revisar el documento funcional en `docs/` y las **“Notas de DB y seguridad”** de la Fase 1.
- [ ] Revisar el código actual relacionado con:
  - creación de cotizaciones,
  - manejo de leads,
  - cualquier RPC o Edge Function ya existente.
- [ ] Si hace falta confirmar buenas prácticas de diseño de APIs (por ejemplo, uso de server actions, Edge Functions, patrones de RPC en Supabase), usar **context7** para consultar documentación externa de Next.js / Supabase.
- [ ] Diseñar y/o ajustar la lógica de:
  - primera cotización como invitado (crear lead + cotización),
  - detección de “correo ya usado” sin exponer datos sensibles,
  - vinculación de leads existentes con una cuenta de usuario cuando el usuario decide registrarse.
- [ ] Implementar o actualizar las funciones necesarias (RPC/Edge Functions/server actions), por ejemplo:
  - crear cotización a partir de la info del formulario o de la cuenta del usuario,
  - obtener listado de cotizaciones de un usuario autenticado,
  - obtener detalle de una cotización (solo si pertenece al usuario o si es admin),
  - actualizar datos de contacto/facturación del usuario autenticado.
- [ ] Asegurarse de que todas las funciones respetan las RLS definidas en la Fase 1.
- [ ] Añadir notas breves sobre las nuevas funciones/endpoints en la sección **“Notas de backend”** al final de este archivo.

---

## Fase 3 – Interfaz y experiencia de usuario (Agente Frontend)

Objetivo: crear/adaptar las pantallas y componentes para “Mi cuenta” y los nuevos flujos de cotización.

- [ ] Revisar el documento funcional en `docs/` para entender los flujos de usuario (Mi cuenta, invitado, registro progresivo, etc.).
- [ ] Si hay dudas de buenas prácticas de UI/UX con shadcn/ui, Next.js o patrones de diseño, usar **context7** para consultar documentación externa de esas librerías/tecnologías.
- [ ] Añadir el botón **“Mi cuenta”** en la interfaz:
  - coherente con el diseño actual,
  - visible en el header u otra zona estable,
  - con comportamiento distinto según estado (no autenticado / cliente / admin).
- [ ] Implementar la pantalla de **“Mi cuenta”** para usuarios autenticados:
  - listado de cotizaciones,
  - vista de detalle de una cotización,
  - sección de datos de contacto (y espacio previsto para facturación futura).
- [ ] Ajustar el flujo de cotización para:
  - usuarios invitados (formulario completo),
  - usuarios autenticados (usar datos guardados + opción “Modificar mis datos”).
- [ ] Implementar el **modal de registro progresivo** cuando el correo ya exista:
  - texto corto explicando que ya ha cotizado antes,
  - opción recomendada: crear cuenta y vincular cotizaciones,
  - opción alternativa: seguir como invitado.
- [ ] Para todos los componentes y pantallas nuevos:
  - usar componentes de `components/ui` basados en shadcn/ui,
  - mantener coherencia visual global (colores, tipografías, espaciados, bordes, radios, sombras, estados hover/focus),
  - no introducir estilos que rompan la consistencia del diseño existente.

> En esta fase se toca solo UI/UX; no cambiar contratos de backend sin volver a Fase 2.

---

## Fase 4 – Sistema de correos / Recordatorios (Agente Emails)

Objetivo: enviar correos claros y coherentes con los cambios de estado de las cotizaciones.

- [ ] Revisar en el repo cualquier código actual relacionado con envío de correos (Edge Functions, servicios, etc.).
- [ ] Si hay dudas sobre integración con el proveedor de correo (SendGrid u otro), usar **context7** para consultar documentación externa de ese proveedor o de patrones recomendados (por ejemplo, en Supabase Edge Functions).
- [ ] Definir qué eventos de cambio de estado disparan correos (por ejemplo: en revisión, aprobada, rechazada, vencida), alineado con lo definido en los docs de `docs/`.
- [ ] Crear o ajustar la función central (RPC o Edge Function) encargada de:
  - recibir la info mínima (por ejemplo: `id` de cotización + nuevo estado),
  - buscar datos necesarios (correo del cliente, resumen de la cotización),
  - construir el contenido del correo,
  - llamar al proveedor de correo configurado en el proyecto.
- [ ] Asegurar que:
  - no se envían correos duplicados por el mismo cambio de estado,
  - se registran errores o logs mínimos para debug (si aplica, usando estructura definida en Fase 1).
- [ ] Revisar textos de correos:
  - claros,
  - cortos,
  - alineados con el tono de FullColor.

---

## Fase 5 – QA, pruebas y documentación (Agente QA / Docs)

Objetivo: comprobar que el flujo completo funciona bien y dejar documentado el resultado.

- [ ] Probar end-to-end los siguientes escenarios (mínimo):
  - usuario invitado que cotiza por primera vez y recibe su correo,
  - usuario que vuelve a cotizar con el mismo correo y ve el modal de registro progresivo,
  - usuario que crea cuenta y luego ve sus cotizaciones en “Mi cuenta”,
  - usuario autenticado que vuelve a cotizar y ya no rellena todo el formulario,
  - administrador que cambia estados de cotización y dispara correos.
- [ ] Verificar que:
  - ningún usuario puede ver cotizaciones de otro usuario,
  - los administradores tienen acceso al panel correcto y no usan el panel de cliente,
  - los estados en UI y en correos son coherentes (nombres de estado, mensajes, etc.).
- [ ] Ejecutar `npm run lint` y los tests relevantes (unitarios/E2E) si están disponibles, y anotar cualquier fallo importante.
- [ ] Actualizar la documentación:
  - añadir un resumen de cómo quedó el flujo final en un documento de `docs/` (por ejemplo, ampliando el feature correspondiente),
  - señalar cualquier decisión o limitación pendiente para futuras iteraciones.
- [ ] Dejar en este archivo un breve **“Changelog final”** con los puntos más importantes completados.

---

## Notas de arquitectura

_(Usar esta sección para anotar decisiones importantes de Fase 0.)_

---

## Notas de DB y seguridad

_(Usar esta sección para anotar decisiones importantes de Fase 1: tablas, campos, RLS, etc., a nivel de resumen.)_

---

## Notas de backend

_(Usar esta sección para anotar, de forma breve, qué funciones/RPC/Edge Functions se añadieron o modificaron en Fase 2.)_

---

## Changelog final

_(Usar esta sección al terminar la Fase 5 para resumir qué se implementó y en qué estado quedó el feature.)_
