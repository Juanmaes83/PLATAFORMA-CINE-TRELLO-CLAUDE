# ARTEMIS · Plataforma SaaS de Gestión de Producción Cinematográfica

> **MVP Sprint 0 — Núcleo Kanban del Departamento de Arte**
> Stack: Next.js 14 (App Router) · TypeScript · Tailwind · @dnd-kit · Zustand
> Monorepo: pnpm + Turborepo · Despliegue: Vercel-ready

---

## ⚡ Arranque rápido (modo demo, sin DB)

Requisitos: **Node 18.17+** y **pnpm 8**.

```bash
# 1. Instalar pnpm si no lo tienes
npm install -g pnpm@8.15.6

# 2. Instalar dependencias del monorepo
pnpm install

# 3. (solo demo) Forzar capa en memoria
echo 'DATA_LAYER="memory"' > .env

# 4. Levantar el dev server
pnpm dev
```

Modo memoria: sin Postgres, los cambios viven en RAM del server y se
pierden al reiniciar. Útil para demos rápidas. El modo real es Postgres →
ver sección siguiente.

---

## 🐘 Arrancar el entorno completo (Sprint 2: Postgres + Prisma)

Requisitos adicionales: **Docker** (Docker Desktop en Windows/Mac) y
**Node 18.17+ / pnpm 8**.

```bash
# 1. Levantar Postgres en contenedor
docker compose up -d

# 2. Copiar plantilla de entorno (una sola vez)
cp .env.example .env

# 3. Crear el esquema en la DB (genera migraciones + cliente Prisma)
cd packages/db && pnpm prisma migrate dev
cd ../..

# 4. Cargar los datos seed (GOLDEN HOUR · S01 — Atrezzo)
cd packages/db && pnpm prisma db seed
cd ../..

# 5. Levantar la app
pnpm dev
```

Abre **http://localhost:3000**. Mueve tarjetas, cierra la pestaña,
reabre: los cambios persisten en Postgres. Para volver al estado seed,
usa el botón **Restaurar demo** en la Topbar (dispara un reset + reseed
en el server).

### Resetear Postgres de raíz

```bash
docker compose down -v          # borra volumen + datos
docker compose up -d
cd packages/db && pnpm prisma migrate dev && pnpm prisma db seed
```

---

## 🎬 Qué hay en el MVP

### Funcional ya
- ✅ **Tablero Kanban con drag & drop** entre columnas (look & feel Trello)
- ✅ **5 listas** con flujo real de Atrezzo: Necesidad → Búsqueda → Adquirido/Taller → En Set → Devuelto
- ✅ **Tarjetas con metadatos cinematográficos**: nº de escena, referencia de guion, prioridad, hero/breakaway, asignados, coste estimado, etiquetas
- ✅ **Reverso de tarjeta extendida** (panel lateral no modal): edición inline de título y descripción, ficha técnica, notas de continuidad, panel financiero con stub RBAC
- ✅ **CRUD completo**: añadir/editar/eliminar listas y tarjetas
- ✅ **WIP limit** visual por lista
- ✅ **Persistencia local** (localStorage) — todos los cambios sobreviven al refresco
- ✅ **Botón "Restaurar demo"** para volver al estado seed

### Cableado para Sprint 1+
- 🔌 Capa de repositorios `@artemis/db` con interfaces (`ICardRepository`, etc.) — la UI no conoce la implementación. Sustituir `/lib/repositories/memory.ts` por una versión Prisma/Drizzle no requiere tocar componentes.
- 🔌 `art_metadata` ya tipado como union discriminada por subdepartamento (Graphics/Props/Set Decoration/Construction) — listo para mapear a JSONB.
- 🔌 Topbar con switcher de subdepto (Atrezzo activo, los otros 3 deshabilitados).
- 🔌 `.env.example` documenta qué variables se activan en cada Sprint.

---

## 📁 Estructura

```
artemis/
├── apps/
│   └── web/                    # Next.js 14 App
│       └── src/
│           ├── app/            # App Router (layout, page, globals.css)
│           ├── components/
│           │   ├── kanban/     # Board, ListColumn, CardItem, CardEditor, Topbar
│           │   └── ui/         # Avatar, Label
│           ├── lib/
│           │   ├── repositories/memory.ts   # ← Sprint 1 sustituye por Prisma
│           │   ├── seed.ts                  # Datos demo del proyecto
│           │   └── utils.ts
│           └── store/board.ts  # Zustand + persist
├── packages/
│   ├── types/                  # Modelo del dominio (Card, List, ArtMetadata...)
│   ├── db/                     # Interfaces de repositorios (sin implementación)
│   └── config/                 # tsconfig base
├── package.json                # workspaces + turbo
├── pnpm-workspace.yaml
├── turbo.json
└── vercel.json                 # listo para deploy
```

---

## 🧭 Roadmap

| Fase | Sprint | Foco | Archivos clave a tocar |
|------|--------|------|------------------------|
| MVP | 0 | Kanban funcional ✅ | _este commit_ |
| MVP | 1 | Postgres + Prisma + Auth | `packages/db/src/prisma.ts`, NextAuth en `apps/web/src/app/api/auth/[...nextauth]` |
| MVP | 2 | Vistas Kanban por subdepto restantes | `apps/web/src/app/[subdept]/page.tsx` |
| MVP | 3 | Adjuntos S3/MinIO | `apps/web/src/app/api/uploads` |
| MVP | 4 | Comentarios + WebSockets | servidor Socket.io aparte o `app/api/socket` |
| F2 | 6 | Presupuestos + POs | nuevo módulo `apps/web/src/app/budgets` |
| F2 | 7 | Aprobaciones + tarjetas espejo | `packages/types` extender |
| F2 | 8 | Motor de reglas (Butler) | nuevo paquete `@artemis/automation` |
| F3 | 10+ | Gantt, Desglose Guión + OCR, integraciones, TPN | — |

---

## 🛠 Decisiones técnicas relevantes

1. **App Router (no Pages)**: alineado con Next 14 estable, server components por defecto.
2. **Zustand + persist en lugar de Redux**: el MVP no necesita la complejidad de RTK; Zustand encaja con la lógica optimista del DnD.
3. **@dnd-kit en lugar de react-beautiful-dnd**: mantenido, soporta React 18 estricto, accesible por teclado.
4. **Tailwind con paleta `ink-*` custom**: identidad propia (no es "Trello azul"), oscuro por defecto — los sets de rodaje suelen estar en penumbra.
5. **Persistencia separada por capas** (Zustand + capa repos): hoy el store es la fuente de verdad, mañana lo será Postgres y el store actuará como caché optimista. La separación ya está hecha.
6. **No se usa `next/font` con fuentes locales todavía**: usa Google Fonts (Inter + Playfair Display) por simplicidad inicial. Sustituible por self-hosted en Sprint 1.

---

## ⚠️ Limitaciones honestas del MVP

- **No hay backend real todavía**: los datos viven en localStorage. Si limpias el navegador, pierdes los cambios → usa "Restaurar demo" para resembrar.
- **No hay autenticación**: el "usuario actual" es siempre Ana Castaño (Art Director). NextAuth se integra en Sprint 1.
- **No hay multi-tablero**: solo el tablero piloto de Props. La UI de Boards Dashboard se construye en Sprint 2.
- **Los otros 3 subdepartamentos** (Graphics, Set Dec, Construction) aparecen en la Topbar pero deshabilitados.
- **Sin tests** todavía. Vitest + Testing Library entran en Sprint 1.

---

## 📜 Comandos

```bash
pnpm dev          # Levanta apps/web en :3000
pnpm build        # Build de toda la monorepo
pnpm lint         # Lint
pnpm type-check   # tsc --noEmit en todos los packages
pnpm format       # Prettier en todo
```
