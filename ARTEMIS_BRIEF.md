# ARTEMIS · Brief Maestro del Proyecto (v2)

## Qué es Artemis

Plataforma SaaS colaborativa para la gestión del Departamento de Arte y su
interacción con Producción en rodajes de cine, serie y publicidad.
Diferencial: habla el idioma del cine (props, hero, breakaway, continuidad,
dressing, takeoff) y conecta guion → tablero → presupuesto → referencias
visuales en un solo flujo.

## Equipo

- 2 devs full-stack (uno backend-leaning, uno frontend-leaning).
- 1 diseñador UI/UX.
- 2 product managers (PM1=Owner Producto, PM2=Conector con expertos).
- 3 Directores de Arte y Producción (consultores, trabajan con Disney/Netflix).
- Copilotos IA: Claude (arquitectura, product, briefs), Kimi Code (ejecución
  rápida de tickets acotados).

## Stack técnico (DEFINITIVO, no debatir sin nota firmada)

- Monorepo: pnpm workspaces + Turborepo.
- App principal: apps/web (Next.js 14 App Router + TypeScript strict).
- UI: Tailwind + lucide-react + @dnd-kit.
- Estado cliente: Zustand (sin persist middleware a partir de Sprint 2).
- Persistencia: Postgres + Prisma. Driver en packages/db.
- Auth: NextAuth con Google + email magic link.
- Storage: S3 compatible (MinIO local, R2 o S3 producción) para adjuntos.
- IA proveedores: capa de abstracción propia en packages/ai con adapters
  para OpenAI, Google (Gemini/Gemma), Anthropic, modelos self-hosted (LLaVA).
- Hosting: Vercel para web, Postgres gestionado (Neon o Supabase).
- Repos abstractos: la UI consume @artemis/db (interfaces ICardRepository,
  etc.). Sustituir la implementación NO debe requerir tocar componentes.

## Roles del producto (RBAC)

- admin: todo.
- production_manager: ve costes, aprueba gastos, informes completos.
- art_director: ve todos los tableros del depto. de arte, aprueba diseños.
- department_lead: ve y edita su subdepartamento + hijos directos.
- crew: ve y edita sus tarjetas asignadas, NO ve panel financiero.
- viewer: solo lectura.

## Subdepartamentos (los 4 grandes)

- props (Atrezzo): Necesidad → Búsqueda → Adquirido/Taller → En Set → Devuelto.
- graphics (Grafismo): Briefing → En Diseño → Revisión → Aprobado → Entregado.
- set_decoration (Decorados): Concepto → Selección → Reservado → Montaje → Desmontaje.
- construction (Construcción): Planos → Despiece → En Construcción → Acabados → Montaje → Desmontado.

## Módulos del producto v1.0

1. Kanban Multi-subdepartamento (los 4 arriba).
2. Tarjeta Extendida (ficha técnica, continuidad, checklist, adjuntos,
   comentarios, financiero con RBAC).
3. Tarjetas Nodales (parent_card_id, subtareas, barra progreso agregada).
4. Filtros Multidimensionales (por persona, por subdepto, por prioridad,
   por fecha, por estado presupuestario, por escena).
5. Bandeja Personal (tarjetas asignadas a mí, plazos, dashboard de persona).
6. Adjuntos (fotos de continuidad, planos, mockups, referencias).
7. Módulo de Referencias Visuales (ver Módulo IA Visual abajo).
8. Desglose de Guion (parser PDF/Word con extracción de props/locaciones/
   personajes/vestuario; crea tarjetas con un click).
9. Aprobaciones Arte → Producción (tarjetas espejo, flujo de aprobación).
10. Dashboard de Presupuesto (estimado vs real vs comprometido).
11. Mapas Visuales (DAG de dependencias, organigrama dinámico, task map).
12. Generación de Informes (PDF/Excel para estudio).
13. Carga de Trabajo (gráfico de horas por persona, alertas de sobrecarga).
14. Multi-proyecto (un usuario puede estar en varios proyectos con roles
    distintos; ver tabla user_functions).

## Módulo IA Visual (integrado en tarjetas y en bandeja)

Dos flujos simétricos:

**Flujo A — Ingeniería inversa (análisis de imagen subida):**
El usuario sube una imagen a una tarjeta. El módulo la envía a los GPTs
personalizados del usuario (ya existentes y propiedad del usuario) vía
API o al modelo configurado (Gemini/Gemma/LLaVA según compliance).
Devuelve descripción estructurada + clasificación departamental +
metadatos sugeridos + detección de origen (IA vs real).
El usuario revisa y acepta (nada se autorellena sin confirmación).

**Flujo B — Generación (crear referencia desde tarjeta):**
Desde la tarjeta, botón "Generar referencia visual". Un LLM interno lee
los metadatos (art_metadata) y genera un prompt optimizado. Lo envía a
DALL-E / Midjourney / Stable Diffusion vía adapter. Devuelve 2-4 imágenes
con marca de agua "AI Reference - No usar en cámara".

Ambos flujos dejan historial trazable (prompt + proveedor + timestamp +
usuario). Ambos respetan RBAC y cuotas por rol.

## Reglas técnicas inquebrantables

1. NO usar localStorage ni sessionStorage en producción a partir de Sprint 2.
2. NO instalar librerías UI pesadas (MUI, Chakra, Ant). Tailwind + propios.
3. NO usar `any` en TypeScript. Usar `unknown` y narrow.
4. Cada PR debe pasar type-check y lint sin warnings.
5. Tests: Vitest + Testing Library obligatorio desde Sprint 3.
6. Migraciones Prisma commiteadas al repo.
7. Capa de abstracción IA obligatoria: NO llamar APIs de modelos
   directamente desde componentes ni desde handlers. Siempre a través de
   packages/ai.
8. Imágenes generadas por IA llevan EXIF con campo `AIGenerated=true` y
   watermark visual no removible de UI.
9. NO descargar guiones de internet sin licencia. Solo guiones propiedad
   del equipo o dominio público para entrenar parsers.
10. Todo dato sensible (adjuntos, guiones) cifrado at-rest en S3.

## Cómo trabajar con este brief

1. Leer ARTEMIS_BRIEF.md al inicio de cada sesión.
2. Confirmar a qué módulo apunta la tarea pedida.
3. Si la tarea contradice este brief, PARAR y avisar.
4. Al terminar un sprint, ACTUALIZAR la sección "Estado actual".

## Estado actual del código

- Sprint 0 ✅ COMPLETADO: Kanban base + drag-and-drop + tablero demo.
- Sprint 1 parcial ✅ COMPLETADO: Editor de tarjeta completo, duplicar, mover.
- Sprint 2 ✅ COMPLETADO: Postgres + Prisma + server actions, schema con
  UserFunction y Card.parent_card_id, toasts stackables 3s, type-check y
  lint limpios.
- Sprint 3 ✅ COMPLETADO: Tarjetas nodales (parent/children + mover con
  descendientes) + barras de progreso (simple/nodal/bloqueada) + checklists
  CRUD + reorden drag de subtareas. Modelo Checklist en Prisma/memory,
  función pura cardProgress(), componente ProgressBar.
- Sprint 4 🔄 PENDIENTE: Filtros multidimensionales.
- Sprint 5 🔄 PENDIENTE: Capa de abstracción IA (packages/ai).

## Convenciones de nombres

- Tipos en PascalCase. Funciones en camelCase.
- IDs prefijados: c_ (cards), l_ (lists), b_ (boards), u_ (users),
  p_ (projects), att_ (attachments), cmt_ (comments), ref_ (AI refs).
- Archivos de componente: PascalCase.tsx.
- Archivos de utilidad: kebab-case.ts.
