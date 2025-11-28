# Skills - Cotizador FullColor

Skills modulares que Claude invoca automáticamente según el contexto de la tarea.

## Skills Disponibles

| Skill | Tarea(s) | Descripción |
|-------|----------|-------------|
| `rls-policy-optimizer` | 1.3 | Optimiza RLS con `(select auth.uid())` |
| `supabase-index-creator` | 1.2 | Crea índices para FK sin cobertura |
| `rls-policy-consolidator` | 2.1 | Consolida policies permisivas redundantes |
| `edge-function-cors-hardener` | 2.2 | Implementa CORS restrictivo |
| `typescript-any-eliminator` | 2.3 | Elimina uso de `any` |
| `zod-schema-validator` | 3.1 | Validación con Zod |
| `plan-mejoras-tracker` | Todas | Documenta progreso en PLAN_MEJORAS.md |

## Diferencia: Agents vs Skills

| Aspecto | Agents | Skills |
|---------|--------|--------|
| Ubicación | `.claude/agents/` | `.claude/skills/` |
| Invocación | Explícita (`@agent-name`) | Automática por contexto |
| Propósito | Personalidad + instrucciones completas | Capacidad modular específica |
| Tamaño | Más extensos | Más enfocados |

## Cómo Funcionan

Claude descubre automáticamente los skills por su `description` en el frontmatter. Por ejemplo:

```yaml
description: Optimiza políticas RLS usando el patrón (select auth.uid()). 
Usa cuando trabajes con RLS policies, auth.uid() reevaluación...
```

Cuando mencionas "RLS", "auth.uid()", o "tarea 1.3", Claude activa automáticamente el skill correspondiente.

## Estructura de Archivos

```
.claude/skills/
├── rls-policy-optimizer/
│   └── SKILL.md
├── supabase-index-creator/
│   └── SKILL.md
├── rls-policy-consolidator/
│   └── SKILL.md
├── edge-function-cors-hardener/
│   └── SKILL.md
├── typescript-any-eliminator/
│   └── SKILL.md
├── zod-schema-validator/
│   └── SKILL.md
├── plan-mejoras-tracker/
│   └── SKILL.md
└── README.md
```

## Uso

No necesitas invocar los skills explícitamente. Simplemente describe tu tarea:

```
"Necesito optimizar las policies RLS de la tabla leads"
→ Claude activa: rls-policy-optimizer

"Crea el índice para email_logs"  
→ Claude activa: supabase-index-creator

"Implementa CORS restrictivo en las Edge Functions"
→ Claude activa: edge-function-cors-hardener
```

## Referencia

- [Skills en Claude Code](https://code.claude.com/docs/en/skills)
- [Repo de ejemplos](https://github.com/anthropics/skills)
